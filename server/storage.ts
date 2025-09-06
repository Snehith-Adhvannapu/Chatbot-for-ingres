import { 
  type User, 
  type InsertUser, 
  type GroundwaterAssessment, 
  type InsertAssessment,
  type ChatSession,
  type InsertChatSession 
} from "@shared/schema";
import { randomUUID } from "crypto";
// Mock data removed - now generating real data via AI

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGroundwaterAssessments(filters?: {
    state?: string;
    district?: string;
    block?: string;
    year?: number;
    category?: string;
  }): Promise<GroundwaterAssessment[]>;
  
  getStateStatistics(state: string): Promise<any>;
  
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  updateChatSession(id: string, messages: any[]): Promise<ChatSession>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatSessions: Map<string, ChatSession>;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGroundwaterAssessments(filters: {
    state?: string;
    district?: string;
    block?: string;
    year?: number;
    category?: string;
  } = {}): Promise<GroundwaterAssessment[]> {
    // Data is now generated via AI based on user queries
    // This method is kept for API compatibility but returns empty array
    // Real data generation happens in the chat endpoint via AI
    return [];
  }

  async getStateStatistics(state: string): Promise<any> {
    // Statistics are now generated via AI based on user queries
    // This method is kept for API compatibility but returns null
    // Real statistics generation happens in the chat endpoint via AI
    return null;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      id,
      userId: insertSession.userId || null,
      messages: insertSession.messages || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async updateChatSession(id: string, messages: any[]): Promise<ChatSession> {
    const session = this.chatSessions.get(id);
    if (!session) {
      throw new Error("Chat session not found");
    }

    const updatedSession = {
      ...session,
      messages,
      updatedAt: new Date(),
    };

    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
