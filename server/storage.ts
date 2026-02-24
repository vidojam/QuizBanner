import { db } from "./db";
import { eq, desc, inArray, and } from "drizzle-orm";
import type { 
  Question, InsertQuestion,
  Preferences, InsertPreferences,
  Template, InsertTemplate,
  StudySession, InsertStudySession,
  User, UpsertUser
} from "@shared/schema";
import { questions, preferences, templates, studySessions, users, guestPremium, contactMessages } from "./db";

export interface GuestPremium {
  id: string;
  guestId: string;
  email: string | null;
  tier: string;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  linkedUserId: string | null;
  subscriptionExpiresAt: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getUserByMagicLinkToken(token: string): Promise<User | undefined>;
  createUser(userData: Omit<UpsertUser, 'id'>): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  setResetToken(userId: string, token: string, expires: Date): Promise<void>;
  clearResetToken(userId: string): Promise<void>;
  setMagicLinkToken(userId: string, token: string, expires: Date): Promise<void>;
  clearMagicLinkToken(userId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  
  // Guest premium operations
  getGuestPremium(guestId: string): Promise<GuestPremium | undefined>;
  getGuestPremiumByEmail(email: string): Promise<GuestPremium | undefined>;
  getGuestPremiumByMagicLinkToken(token: string): Promise<GuestPremium | undefined>;
  createGuestPremium(data: { guestId: string; email?: string; stripePaymentIntentId?: string }): Promise<GuestPremium>;
  setGuestMagicLinkToken(guestId: string, token: string, expires: Date): Promise<void>;
  clearGuestMagicLinkToken(guestId: string): Promise<void>;
  linkGuestToUser(guestId: string, userId: string): Promise<void>;
  
  // Questions (user-specific or guest-specific)
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
  
  // Contact messages
  createContactMessage(data: { name: string; email: string; message: string }): Promise<{ id: string; createdAt: string }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    
    // Check if token is expired
    if (user && user.resetTokenExpires) {
      const expires = new Date(user.resetTokenExpires);
      if (expires < new Date()) {
        return undefined; // Token expired
      }
    }
    
    return user || undefined;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async setResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpires: expires.toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
  }

  async clearResetToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
  }

  async setMagicLinkToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({
        magicLinkToken: token,
        magicLinkExpires: expires.toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
  }

  async clearMagicLinkToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        magicLinkToken: null,
        magicLinkExpires: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
  }

  async getUserByMagicLinkToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.magicLinkToken, token));
    
    // Check if token is expired
    if (user && user.magicLinkExpires) {
      const expires = new Date(user.magicLinkExpires);
      if (expires < new Date()) {
        return undefined; // Token expired
      }
    }
    
    return user || undefined;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
  }

  // Guest premium operations
  async getGuestPremium(guestId: string): Promise<GuestPremium | undefined> {
    const [guest] = await db.select().from(guestPremium).where(eq(guestPremium.guestId, guestId));
    return guest || undefined;
  }

  async getGuestPremiumByEmail(email: string): Promise<GuestPremium | undefined> {
    const [guest] = await db.select().from(guestPremium).where(eq(guestPremium.email, email));
    return guest || undefined;
  }

  async getGuestPremiumByMagicLinkToken(token: string): Promise<GuestPremium | undefined> {
    const [guest] = await db.select().from(guestPremium).where(eq(guestPremium.magicLinkToken, token));
    
    // Check if token is expired
    if (guest && guest.magicLinkExpires) {
      const expires = new Date(guest.magicLinkExpires);
      if (expires < new Date()) {
        return undefined; // Token expired
      }
    }
    
    return guest || undefined;
  }

  async setGuestMagicLinkToken(guestId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(guestPremium)
      .set({
        magicLinkToken: token,
        magicLinkExpires: expires.toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(guestPremium.guestId, guestId));
  }

  async clearGuestMagicLinkToken(guestId: string): Promise<void> {
    await db
      .update(guestPremium)
      .set({
        magicLinkToken: null,
        magicLinkExpires: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(guestPremium.guestId, guestId));
  }

  async createGuestPremium(data: { 
    guestId: string; 
    email?: string; 
    stripePaymentIntentId?: string;
  }): Promise<GuestPremium> {
    const now = new Date().toISOString();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month

    const [created] = await db.insert(guestPremium).values({
      guestId: data.guestId,
      email: data.email || null,
      tier: 'premium',
      stripePaymentIntentId: data.stripePaymentIntentId || null,
      subscriptionExpiresAt: expiresAt.toISOString(),
      subscriptionStatus: 'active',
      createdAt: now,
      updatedAt: now,
    }).returning();
    return created as GuestPremium;
  }

  async linkGuestToUser(guestId: string, userId: string): Promise<void> {
    const now = new Date().toISOString();
    await db.update(guestPremium)
      .set({ linkedUserId: userId, updatedAt: now })
      .where(eq(guestPremium.guestId, guestId));
    
    // Also transfer the guest's premium status to the user
    const guest = await this.getGuestPremium(guestId);
    if (guest && guest.subscriptionExpiresAt) {
      await this.updateUser(userId, {
        tier: 'premium',
        subscriptionExpiresAt: guest.subscriptionExpiresAt,
        subscriptionStatus: 'active',
        stripePaymentIntentId: guest.stripePaymentIntentId || undefined,
      });
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData as any)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date().toISOString(),
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

  // Contact messages
  async createContactMessage(data: { name: string; email: string; message: string }): Promise<{ id: string; createdAt: string }> {
    const [created] = await db.insert(contactMessages).values({
      ...data,
      createdAt: new Date().toISOString(),
    }).returning({ id: contactMessages.id, createdAt: contactMessages.createdAt });
    return created;
  }
}

export const storage = new DatabaseStorage();
