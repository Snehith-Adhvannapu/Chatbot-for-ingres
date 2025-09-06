import { 
  type User, 
  type InsertUser, 
  type GroundwaterAssessment, 
  type InsertAssessment,
  type ChatSession,
  type InsertChatSession 
} from "@shared/schema";
import { randomUUID } from "crypto";
import { mockGroundwaterData, stateStatistics } from "./data/mock-data";

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
    let filteredData = [...mockGroundwaterData];

    if (filters.state) {
      filteredData = filteredData.filter(
        item => item.state.toLowerCase().includes(filters.state!.toLowerCase())
      );
    }

    if (filters.district) {
      filteredData = filteredData.filter(
        item => item.district.toLowerCase().includes(filters.district!.toLowerCase())
      );
    }

    if (filters.block) {
      filteredData = filteredData.filter(
        item => item.block.toLowerCase().includes(filters.block!.toLowerCase())
      );
    }

    if (filters.year) {
      filteredData = filteredData.filter(item => item.year === filters.year);
    }

    if (filters.category) {
      filteredData = filteredData.filter(
        item => item.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    return filteredData;
  }

  async getStateStatistics(state: string): Promise<any> {
    return stateStatistics[state as keyof typeof stateStatistics] || null;
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
