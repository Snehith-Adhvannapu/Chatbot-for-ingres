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
      ? "केवल 1-2 वाक्यों में उत्तर दें। मुख्य आंकड़े: स्थिति, निकासी %, श्रेणी।"
      : "Answer in 1-2 sentences only. Key facts: status, extraction %, category. Be extremely brief.";

    const prompt = `Data: ${JSON.stringify(data, null, 2)}
Query: ${query.intent} for ${JSON.stringify(query.location)}

If data exists:
Format: "[Location]: [Category] - [X%] extraction. [Brief insight]"
Example: "Gujarat: Safe - 45% extraction. Good recharge levels."

If no data found:
Format: "No data for [Location]. Try [Similar location] or check latest CGWB reports."
Example: "No data for Xyz District. Try Karnataka state or check latest CGWB reports."

Maximum 15 words total. Always provide useful guidance.`;

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
