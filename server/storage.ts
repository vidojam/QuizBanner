import { db } from "./db";
import { eq, desc, inArray } from "drizzle-orm";
import type { 
  Question, InsertQuestion,
  Preferences, InsertPreferences,
  Template, InsertTemplate,
  StudySession, InsertStudySession,
  User, UpsertUser
} from "@shared/schema";
import { questions, preferences, templates, studySessions, users } from "@shared/schema";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Questions
  getQuestions(): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, question: Partial<InsertQuestion>): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<boolean>;
  deleteAllQuestions(): Promise<number>;
  reorderQuestions(questionIds: string[]): Promise<void>;

  // Preferences
  getPreferences(): Promise<Preferences | undefined>;
  updatePreferences(prefs: Partial<InsertPreferences>): Promise<Preferences>;

  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  deleteTemplate(id: string): Promise<boolean>;

  // Study Sessions
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: string, session: Partial<InsertStudySession>): Promise<StudySession | undefined>;
  getRecentSessions(limit?: number): Promise<StudySession[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Questions
  async getQuestions(): Promise<Question[]> {
    return await db.select().from(questions).orderBy(questions.order);
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [created] = await db.insert(questions).values(question as any).returning();
    return created;
  }

  async updateQuestion(id: string, question: Partial<InsertQuestion>): Promise<Question | undefined> {
    const [updated] = await db
      .update(questions)
      .set(question as any)
      .where(eq(questions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const result = await db.delete(questions).where(eq(questions.id, id)).returning();
    return result.length > 0;
  }

  async deleteAllQuestions(): Promise<number> {
    const result = await db.delete(questions).returning();
    return result.length;
  }

  async reorderQuestions(questionIds: string[]): Promise<void> {
    // Update order based on position in array
    for (let i = 0; i < questionIds.length; i++) {
      await db
        .update(questions)
        .set({ order: i })
        .where(eq(questions.id, questionIds[i]));
    }
  }

  // Preferences
  async getPreferences(): Promise<Preferences | undefined> {
    const [prefs] = await db.select().from(preferences).limit(1);
    if (!prefs) {
      // Create default preferences if none exist
      const [created] = await db.insert(preferences).values({}).returning();
      return created;
    }
    return prefs;
  }

  async updatePreferences(prefs: Partial<InsertPreferences>): Promise<Preferences> {
    const existing = await this.getPreferences();
    if (existing) {
      const [updated] = await db
        .update(preferences)
        .set(prefs as any)
        .where(eq(preferences.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(preferences).values(prefs as any).returning();
      return created;
    }
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [created] = await db.insert(templates).values(template as any).returning();
    return created;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await db.delete(templates).where(eq(templates.id, id)).returning();
    return result.length > 0;
  }

  // Study Sessions
  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [created] = await db.insert(studySessions).values(session).returning();
    return created;
  }

  async updateStudySession(id: string, session: Partial<InsertStudySession>): Promise<StudySession | undefined> {
    const [updated] = await db
      .update(studySessions)
      .set(session)
      .where(eq(studySessions.id, id))
      .returning();
    return updated || undefined;
  }

  async getRecentSessions(limit: number = 10): Promise<StudySession[]> {
    return await db.select().from(studySessions).orderBy(desc(studySessions.startTime)).limit(limit);
  }
}

export const storage = new DatabaseStorage();
