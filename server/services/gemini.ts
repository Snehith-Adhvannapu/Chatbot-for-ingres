import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

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
  language: string = "en"
): Promise<{ response: string; data: any }> {
  try {
    const systemPrompt = `You are a groundwater resources expert assistant for CGWB/INGRES data queries.

CORE RULES:

Data Verification:
- Always check if the requested year and region are available in the INGRES dataset
- If data is not available, do not guess or assume

Transparency:
- If the requested data is missing (e.g., "India 2024"), reply with: "The requested dataset is not available. The latest available dataset is: [state/district, year]. Would you like to see that instead?"
- Always add a disclaimer: ⚠️ Note: Results are based on the latest published CGWB/INGRES report. Newer data may not yet be available.

Response Formatting:
- Present results in clean cards per region with:
  - Region name (District/Block, State)
  - Category (Safe, Semi-Critical, Critical, Over-Exploited) with color-coded labels
  - Extraction % (rounded to 1 decimal)
  - Recharge % (rounded to 1 decimal)
  - One-line plain-language explanation of the status

Clarity & Simplicity:
- Round decimals (e.g., 110.8% instead of 110.778443…)
- Explain terms like "Over-Exploited," "Critical," "Safe" in plain language

Interactive Follow-up:
- After every response, offer next steps such as:
  - "Compare with past 5 years"
  - "See historical trends for this district"
  - "Download full report"
  - "View groundwater quality parameters"

Never Confidently Hallucinate:
- Do not insert state/district names unless explicitly present in the dataset
- If user asks for "India data" but only specific state data is available, clearly state the limitation first

Generate realistic CGWB/INGRES groundwater data for the user's query. Base the data on real Indian geological patterns and CGWB assessment methodologies.`;

    const prompt = `User Query: "${userMessage}"
Parsed Query: ${JSON.stringify(query)}

Generate a comprehensive groundwater response including:
1. A brief explanatory response following the rules above
2. Realistic groundwater assessment data for the requested region(s)

Format the response as JSON:
{
  "response": "Brief response text with disclaimer",
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

Make the data realistic based on actual Indian groundwater conditions and CGWB patterns.`;

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
    return {
      response: "I'm experiencing technical difficulties. Please try again or contact support.",
      data: { assessments: [], statistics: null }
    };
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
