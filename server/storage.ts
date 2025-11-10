import { db } from "./db";
import { eq, desc, inArray, and } from "drizzle-orm";
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
  
  // Questions (user-specific)
  getQuestions(userId: string): Promise<Question[]>;
  getQuestion(id: string, userId: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion, userId: string): Promise<Question>;
  updateQuestion(id: string, question: Partial<InsertQuestion>, userId: string): Promise<Question | undefined>;
  deleteQuestion(id: string, userId: string): Promise<boolean>;
  deleteAllQuestions(userId: string): Promise<number>;
  reorderQuestions(questionIds: string[], userId: string): Promise<void>;
  getQuestionCount(userId: string): Promise<number>;

  // Preferences (user-specific)
  getPreferences(userId: string): Promise<Preferences | undefined>;
  updatePreferences(prefs: Partial<InsertPreferences>, userId: string): Promise<Preferences>;

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

  // Questions (user-specific)
  async getQuestions(userId: string): Promise<Question[]> {
    return await db.select().from(questions)
      .where(eq(questions.userId, userId))
      .orderBy(questions.order);
  }

  async getQuestion(id: string, userId: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions)
      .where(and(
        eq(questions.id, id),
        eq(questions.userId, userId)
      ));
    return question || undefined;
  }

  async createQuestion(question: InsertQuestion, userId: string): Promise<Question> {
    const [created] = await db.insert(questions)
      .values({ ...question, userId } as any)
      .returning();
    return created;
  }

  async updateQuestion(id: string, question: Partial<InsertQuestion>, userId: string): Promise<Question | undefined> {
    const [updated] = await db
      .update(questions)
      .set(question as any)
      .where(and(
        eq(questions.id, id),
        eq(questions.userId, userId)
      ))
      .returning();
    return updated || undefined;
  }

  async deleteQuestion(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(questions)
      .where(and(
        eq(questions.id, id),
        eq(questions.userId, userId)
      ))
      .returning();
    return result.length > 0;
  }

  async deleteAllQuestions(userId: string): Promise<number> {
    const result = await db.delete(questions)
      .where(eq(questions.userId, userId))
      .returning();
    return result.length;
  }

  async reorderQuestions(questionIds: string[], userId: string): Promise<void> {
    // Update order based on position in array
    for (let i = 0; i < questionIds.length; i++) {
      await db
        .update(questions)
        .set({ order: i })
        .where(and(
          eq(questions.id, questionIds[i]),
          eq(questions.userId, userId)
        ));
    }
  }

  async getQuestionCount(userId: string): Promise<number> {
    const result = await db.select().from(questions)
      .where(eq(questions.userId, userId));
    return result.length;
  }

  // Preferences (user-specific)
  async getPreferences(userId: string): Promise<Preferences | undefined> {
    const [prefs] = await db.select().from(preferences)
      .where(eq(preferences.userId, userId))
      .limit(1);
    if (!prefs) {
      // Create default preferences if none exist
      const [created] = await db.insert(preferences)
        .values({ userId })
        .returning();
      return created;
    }
    return prefs;
  }

  async updatePreferences(prefs: Partial<InsertPreferences>, userId: string): Promise<Preferences> {
    const existing = await this.getPreferences(userId);
    if (existing) {
      const [updated] = await db
        .update(preferences)
        .set(prefs as any)
        .where(eq(preferences.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(preferences)
        .values({ ...prefs, userId } as any)
        .returning();
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
