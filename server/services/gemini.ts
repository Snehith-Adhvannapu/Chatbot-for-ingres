import { GoogleGenAI } from "@google/genai";

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
  data: any, 
  language: string = "en"
): Promise<string> {
  try {
    const systemPrompt = language === "hi" 
      ? "आप भारतीय भूजल संसाधन आकलन प्रणाली (INGRES) के लिए एक AI सहायक हैं। हिंदी में विस्तृत और सहायक उत्तर दें।"
      : "You are an AI assistant for India Ground Water Resource Estimation System (INGRES). Provide detailed, helpful responses about groundwater data.";

    const prompt = `Based on this groundwater data: ${JSON.stringify(data, null, 2)}

User query intent: ${query.intent}
Location: ${JSON.stringify(query.location)}
Data type: ${query.dataType}

Generate a comprehensive response that:
1. Directly answers the user's question
2. Provides relevant statistics and insights
3. Explains the categorization (Safe/Semi-Critical/Critical/Over-Exploited)
4. Mentions data source as CGWB official assessment
5. Keeps technical accuracy while being user-friendly

If no data found, suggest alternative locations or broader searches.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt
      },
      contents: prompt
    });

    return response.text || "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.";
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm experiencing technical difficulties. Please try again or contact support.";
  }
}

export async function suggestFollowUpQuestions(context: string): Promise<string[]> {
  try {
    const systemPrompt = `Generate 3 relevant follow-up questions based on the conversation context.
Focus on groundwater topics like trends, comparisons, detailed analysis, or related regions.
Respond with JSON array format: {"questions": ["question1", "question2", "question3"]}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["questions"]
        }
      },
      contents: `Context: ${context}`
    });

    const rawJson = response.text;
    if (rawJson) {
      const result = JSON.parse(rawJson);
      return result.questions || [];
    }
    return [];
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    return [];
  }
}
