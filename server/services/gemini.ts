import { GoogleGenAI } from "@google/genai";
import { assessment2025Data, getStateData2025 } from "../data/assessment-2025";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GroundwaterQuery {
  intent: string;
  location?: {
    state?: string;
    district?: string;
    block?: string;
  };
  dataType?: string;
  year?: number;
  language?: string;
}

export async function parseGroundwaterQuery(userMessage: string): Promise<GroundwaterQuery> {
  try {
    const systemPrompt = `You are an expert at parsing groundwater-related queries for the INGRES system. 
Extract the intent and parameters from user messages about Indian groundwater data.

Respond with JSON in this format:
{
  "intent": "query_status|historical_data|comparison|overview|help",
  "location": {
    "state": "state name if mentioned",
    "district": "district name if mentioned", 
    "block": "block name if mentioned"
  },
  "dataType": "recharge|extraction|status|category|all",
  "year": number if specific year mentioned,
  "language": "en|hi" (detect from message)
}

Common Indian states: Maharashtra, Gujarat, Punjab, Rajasthan, Tamil Nadu, Karnataka, etc.
Categories: Safe, Semi-Critical, Critical, Over-Exploited`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            location: {
              type: "object",
              properties: {
                state: { type: "string" },
                district: { type: "string" },
                block: { type: "string" }
              }
            },
            dataType: { type: "string" },
            year: { type: "number" },
            language: { type: "string" }
          },
          required: ["intent", "language"]
        }
      },
      contents: userMessage
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error parsing query:", error);
    return {
      intent: "help",
      language: "en"
    };
  }
}

export async function generateGroundwaterResponse(
  query: GroundwaterQuery, 
  userMessage: string,
  language: string = "en",
  previousMessages: Array<{role: string, content: string}> = []
): Promise<{ response: string; data: any }> {
  try {
    // Check if query is for 2024-2025 data and use real data
    const isRecent = query.year === 2024 || query.year === 2025 || 
                     userMessage.toLowerCase().includes('2024') || 
                     userMessage.toLowerCase().includes('2025') ||
                     userMessage.toLowerCase().includes('latest') ||
                     userMessage.toLowerCase().includes('recent');
    
    if (isRecent && query.location?.state) {
      const realData = getStateData2025(query.location.state);
      if (realData) {
        const response = language === "hi" 
          ? `${realData.state} 2024-2025 का भूजल डेटा:
• निकासी दर: ${realData.stageOfExtraction.toFixed(1)}%
• वार्षिक रिचार्ज: ${(realData.annualRecharge/1000).toFixed(0)} हजार HAM
• वार्षिक निकासी: ${(realData.annualExtraction/1000).toFixed(0)} हजार HAM  
• श्रेणी: ${realData.category === 'Safe' ? 'सुरक्षित' : realData.category === 'Semi-Critical' ? 'अर्ध-गंभीर' : realData.category === 'Critical' ? 'गंभीर' : 'अति-दोहन'}

${realData.category === 'Over-Exploited' ? 'यह क्षेत्र अति-दोहन की स्थिति में है।' : realData.category === 'Critical' ? 'यह क्षेत्र गंभीर स्थिति में है।' : 'यह क्षेत्र सुरक्षित स्थिति में है।'}`
          : `Here's the groundwater data for ${realData.state} 2024-2025:
• Extraction Rate: ${realData.stageOfExtraction.toFixed(1)}%
• Annual Recharge: ${(realData.annualRecharge/1000).toFixed(0)}k HAM
• Annual Extraction: ${(realData.annualExtraction/1000).toFixed(0)}k HAM
• Category: ${realData.category}

${realData.category === 'Over-Exploited' ? 'This region is in over-exploited condition.' : realData.category === 'Critical' ? 'This region is in critical condition.' : 'This region is in safe condition.'}`;
        
        return {
          response,
          data: {
            assessments: [realData],
            statistics: {
              totalBlocks: 1,
              [realData.category.toLowerCase().replace('-', '')]: 1,
              totalExtractableResource: realData.extractableResource/1000,
              totalExtraction: realData.annualExtraction/1000,
              averageStageOfExtraction: realData.stageOfExtraction
            }
          }
        };
      }
    }
    const systemPrompt = language === "hi" 
      ? `आप भारतीय उपयोगकर्ताओं के लिए CGWB/INGRES डेटा की खोज करने के लिए एक भूजल चैटबॉट हैं।

महत्वपूर्ण: केवल वास्तविक डेटा प्रदान करें। कोई भी काल्पनिक या नकली डेटा न बनाएं।

प्रतिक्रिया नियम:

अभिवादन:
- जब अभिवादन (हाय, हैलो, नमस्ते), विनम्रता से जवाब दें और राज्य/जिला/वर्ष पूछें
- उदाहरण: "नमस्ते! 👋 मैं भूजल डेटा जांचने में आपकी मदद कर सकता हूं। आप किस राज्य या जिले में रुचि रखते हैं?"

डेटा उपलब्धता:
- केवल 2024-2025 का राज्य-स्तरीय वास्तविक डेटा उपलब्ध है
- अगर पूछा गया डेटा उपलब्ध नहीं है, तो स्पष्ट रूप से कहें कि यह डेटा उपलब्ध नहीं है
- कोई भी काल्पनिक या अनुमानित डेटा न दें

उपलब्ध डेटा के लिए प्रतिक्रिया:
- केवल वास्तविक 2024-2025 राज्य डेटा दिखाएं
- निकासी %, रिचार्ज, और श्रेणी के साथ साफ कार्ड
- हमेशा वर्ष (2024-2025) का उल्लेख करें`
      : `You are a groundwater chatbot for Indian users to explore CGWB/INGRES data.

CRITICAL: Only provide real data. Never generate fake or dummy data.

RESPONSE RULES:

Greetings:
- When greeted (hi, hello, namaste), reply politely and ask for state/year
- Example: "Hi! 👋 I can help you check groundwater data. Which state are you interested in?"

Data Availability:
- Only real 2024-2025 state-level data is available
- If requested data is not available, clearly state that the data is not available
- Never provide fake, estimated, or generated data

For Available Data:
- Only show real 2024-2025 state data when available
- Present with extraction %, recharge, and category in clean format
- Always mention the year (2024-2025)

For Unavailable Data:
- Clearly state: "I don't have specific data for [requested location/year]. I only have 2024-2025 state-level data."
- Suggest asking for available state data instead`;

    // Build context from previous messages
    let contextSection = "";
    if (previousMessages.length > 0) {
      contextSection = `\nPrevious conversation context:\n${previousMessages.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n`;
    }

    const prompt = `User Query: "${userMessage}"
Parsed Query: ${JSON.stringify(query)}${contextSection}

Generate response following the rules above, considering the conversation context:

If greeting/general query: Ask politely for state/district/year
If specific location query: Provide data in clean cards
If follow-up question: Use context to provide relevant response

Format as JSON:
{
  "response": "Short, clear response text",
  "data": {
    "assessments": [
      {
        "id": "unique-id",
        "state": "State Name",
        "district": "District Name", 
        "block": "Block Name",
        "year": 2022,
        "annualRecharge": 2.45,
        "extractableResource": 2.20,
        "annualExtraction": 2.65,
        "stageOfExtraction": 120.5,
        "category": "Over-Exploited"
      }
    ],
    "statistics": {
      "totalBlocks": 355,
      "safe": 186,
      "semiCritical": 85,
      "critical": 42,
      "overExploited": 42,
      "totalExtractableResource": 24.26,
      "totalExtraction": 18.94,
      "averageStageOfExtraction": 78.1
    }
  }
}

Keep responses short and simple for Indian users.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
      contents: prompt
    });

    const result = JSON.parse(response.text || '{"response": "Error generating response", "data": {"assessments": [], "statistics": null}}');
    return result;
  } catch (error) {
    console.error("Error generating response:", error);
    
    // Handle specific API overload errors
    if (error && typeof error === 'object' && 'status' in error && error.status === 503) {
      return {
        response: "The AI service is currently busy. Please try again in a moment.",
        data: { assessments: [], statistics: null }
      };
    }
    
    return {
      response: "I'm experiencing technical difficulties. Please try again or contact support.",
      data: { assessments: [], statistics: null }
    };
  }
}

export async function suggestFollowUpQuestions(context: string): Promise<string[]> {
  // Follow-up questions feature disabled per user request
  return [];
}
