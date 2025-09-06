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
  
  // Get groundwater assessments
  app.get("/api/groundwater/assessments", async (req, res) => {
    try {
      const { state, district, block, year, category } = req.query;
      
      const filters: any = {};
      if (state) filters.state = state as string;
      if (district) filters.district = district as string;
      if (block) filters.block = block as string;
      if (year) filters.year = parseInt(year as string);
      if (category) filters.category = category as string;

      const assessments = await storage.getGroundwaterAssessments(filters);
      res.json({ assessments });
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch groundwater assessments" });
    }
  });

  // Get state statistics
  app.get("/api/groundwater/statistics/:state", async (req, res) => {
    try {
      const { state } = req.params;
      const statistics = await storage.getStateStatistics(state);
      
      if (!statistics) {
        return res.status(404).json({ message: "Statistics not found for this state" });
      }

      res.json({ statistics });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch state statistics" });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId, language } = chatRequestSchema.parse(req.body);

      // Parse the user's query using OpenAI
      const parsedQuery = await parseGroundwaterQuery(message);

      // Get relevant data based on the parsed query
      const assessments = await storage.getGroundwaterAssessments({
        state: parsedQuery.location?.state,
        district: parsedQuery.location?.district,
        block: parsedQuery.location?.block,
        year: parsedQuery.year,
      });

      // Get additional statistics if state is specified
      let stateStats = null;
      if (parsedQuery.location?.state) {
        stateStats = await storage.getStateStatistics(parsedQuery.location.state);
      }

      // Combine assessments and statistics
      const contextData = {
        assessments,
        stateStatistics: stateStats,
        query: parsedQuery,
      };

      // Generate AI response
      const aiResponse = await generateGroundwaterResponse(
        parsedQuery, 
        contextData, 
        language
      );

      // Generate follow-up questions
      const followUpQuestions = await suggestFollowUpQuestions(
        `User asked: "${message}". AI responded with groundwater data about ${parsedQuery.location?.state || 'various regions'}.`
      );

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
