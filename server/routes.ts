import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseGroundwaterQuery, generateGroundwaterResponse, suggestFollowUpQuestions } from "./services/gemini";
import { chatMessageSchema } from "@shared/schema";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  language: z.string().default("en"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get groundwater assessments - now returns guidance to use chat endpoint
  app.get("/api/groundwater/assessments", async (req, res) => {
    try {
      res.json({ 
        message: "Please use the chat endpoint (/api/chat) to get real-time groundwater data based on your specific query.",
        assessments: []
      });
    } catch (error) {
      console.error("Error in assessments endpoint:", error);
      res.status(500).json({ message: "Failed to fetch groundwater assessments" });
    }
  });

  // Get state statistics - now returns guidance to use chat endpoint
  app.get("/api/groundwater/statistics/:state", async (req, res) => {
    try {
      res.json({ 
        message: "Please use the chat endpoint (/api/chat) to get real-time groundwater statistics based on your specific query.",
        statistics: null
      });
    } catch (error) {
      console.error("Error in statistics endpoint:", error);
      res.status(500).json({ message: "Failed to fetch state statistics" });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId, language } = chatRequestSchema.parse(req.body);

      // Parse the user's query using OpenAI
      const parsedQuery = await parseGroundwaterQuery(message);

      // Get previous messages for context
      let previousMessages: Array<{role: string, content: string}> = [];
      if (sessionId) {
        const existingSession = await storage.getChatSession(sessionId);
        if (existingSession && Array.isArray(existingSession.messages)) {
          previousMessages = existingSession.messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }));
        }
      }

      // Generate AI response with real data based on user query
      const generatedData = await generateGroundwaterResponse(
        parsedQuery, 
        message,
        language,
        previousMessages
      );

      const aiResponse = generatedData.response || "I'm experiencing technical difficulties. Please try again.";
      const assessments = generatedData?.data?.assessments || [];
      const stateStats = generatedData?.data?.statistics || null;

      // Follow-up questions removed per user request
      const followUpQuestions: string[] = [];

      // Create or update chat session
      let session;
      const newMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: message,
        timestamp: new Date().toISOString(),
      };

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: aiResponse,
        timestamp: new Date().toISOString(),
        data: {
          assessments: assessments.slice(0, 5), // Limit to first 5 for response
          statistics: stateStats,
          followUpQuestions,
        },
      };

      if (sessionId) {
        const existingSession = await storage.getChatSession(sessionId);
        if (existingSession) {
          const messages = Array.isArray(existingSession.messages) ? existingSession.messages : [];
          const updatedMessages = [...messages, newMessage, aiMessage];
          session = await storage.updateChatSession(sessionId, updatedMessages);
        } else {
          session = await storage.createChatSession({
            userId: null,
            messages: [newMessage, aiMessage],
          });
        }
      } else {
        session = await storage.createChatSession({
          userId: null,
          messages: [newMessage, aiMessage],
        });
      }

      res.json({
        response: aiResponse,
        sessionId: session.id,
        data: {
          assessments: assessments.slice(0, 5),
          statistics: stateStats,
          followUpQuestions,
        },
        parsedQuery,
      });

    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ 
        message: "Sorry, I'm experiencing technical difficulties. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get chat session
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getChatSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      res.json({ session });
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "Failed to fetch chat session" });
    }
  });

  // Translation endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, language } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      
      // Use Google Gemini for translation (reuse existing instance)
      const { generateGroundwaterResponse } = await import("./services/gemini");
      const ai = await import("@google/genai").then(m => new m.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" }));
      
      const languageNames = {
        'hi': 'Hindi',
        'ta': 'Tamil', 
        'te': 'Telugu',
        'bn': 'Bengali',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'kn': 'Kannada',
        'ml': 'Malayalam',
        'pa': 'Punjabi',
        'or': 'Odia'
      };
      
      const targetLanguage = languageNames[language as keyof typeof languageNames] || 'Hindi';
      const prompt = `Translate the following text to ${targetLanguage}. Return only the translated text without any additional explanations:\n\n${text}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      const translatedText = response.text || text;
      
      res.json({ translatedText });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  });

  // Search suggestions endpoint
  app.get("/api/search/suggestions", async (req, res) => {
    try {
      const suggestions = [
        "What is the groundwater status in Maharashtra?",
        "Show recharge data for Gujarat 2022", 
        "List over-exploited blocks in Punjab",
        "Historical data for Rajasthan",
        "Compare Tamil Nadu and Karnataka water levels",
        "Which states have critical groundwater status?",
        "Show me groundwater data for Delhi 2023",
        "What are the safe districts in India?",
        "Critical groundwater areas in North India",
        "Extraction vs recharge in South India"
      ];

      res.json({ suggestions });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
