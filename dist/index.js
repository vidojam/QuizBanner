var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
var users, questions, preferences, templates, studySessions, schema, sqlite, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    users = sqliteTable("users", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      email: text("email").unique(),
      firstName: text("first_name"),
      lastName: text("last_name"),
      profileImageUrl: text("profile_image_url"),
      tier: text("tier").notNull().default("free"),
      stripeCustomerId: text("stripe_customer_id"),
      stripePaymentIntentId: text("stripe_payment_intent_id"),
      stripeSubscriptionId: text("stripe_subscription_id"),
      subscriptionExpiresAt: text("subscription_expires_at"),
      // ISO date string when premium expires
      subscriptionStatus: text("subscription_status").default("none"),
      // none, active, expired, cancelled
      lastPaymentDate: text("last_payment_date"),
      // ISO date string of last successful payment
      upgradedAt: text("upgraded_at"),
      createdAt: text("created_at").$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
      updatedAt: text("updated_at").$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
    });
    questions = sqliteTable("questions", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      userId: text("user_id").notNull(),
      question: text("question").notNull(),
      answer: text("answer").notNull(),
      category: text("category"),
      tags: text("tags").default("[]"),
      // JSON string
      duration: integer("duration").notNull().default(5),
      customColor: text("custom_color"),
      timesReviewed: integer("times_reviewed").notNull().default(0),
      lastReviewed: text("last_reviewed"),
      performanceScore: real("performance_score").notNull().default(0.5),
      order: integer("order").notNull().default(0)
    });
    preferences = sqliteTable("preferences", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      userId: text("user_id").notNull().unique(),
      defaultDuration: integer("default_duration").notNull().default(5),
      bannerHeight: integer("banner_height").notNull().default(48),
      fontSize: integer("font_size").notNull().default(24),
      enableSoundNotifications: integer("enable_sound_notifications").notNull().default(0),
      shuffleQuestions: integer("shuffle_questions").notNull().default(0),
      enableSpacedRepetition: integer("enable_spaced_repetition").notNull().default(0),
      colorScheme: text("color_scheme").notNull().default("random"),
      customColors: text("custom_colors").notNull().default("[]"),
      // JSON string for SQLite
      selectedCategories: text("selected_categories").notNull().default("[]"),
      // JSON string for SQLite
      createdAt: text("created_at").$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
      updatedAt: text("updated_at").$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
    });
    templates = sqliteTable("templates", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      name: text("name").notNull(),
      description: text("description"),
      category: text("category").notNull(),
      questions: text("questions").notNull()
      // JSON string for SQLite
    });
    studySessions = sqliteTable("study_sessions", {
      id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
      startTime: text("start_time").notNull(),
      // ISO string for SQLite
      endTime: text("end_time"),
      questionsReviewed: integer("questions_reviewed").notNull().default(0),
      totalDuration: integer("total_duration").notNull().default(0)
    });
    schema = {
      users,
      questions,
      preferences,
      templates,
      studySessions
    };
    sqlite = new Database("quiz-banner.db");
    db = drizzle(sqlite, { schema });
    sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    tier TEXT NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_payment_intent_id TEXT,
    stripe_subscription_id TEXT,
    subscription_expires_at TEXT,
    subscription_status TEXT DEFAULT 'none',
    last_payment_date TEXT,
    upgraded_at TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    tags TEXT DEFAULT '[]',
    duration INTEGER NOT NULL DEFAULT 5,
    custom_color TEXT,
    times_reviewed INTEGER NOT NULL DEFAULT 0,
    last_reviewed TEXT,
    performance_score REAL NOT NULL DEFAULT 0.5,
    "order" INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    default_duration INTEGER NOT NULL DEFAULT 5,
    banner_height INTEGER NOT NULL DEFAULT 48,
    font_size INTEGER NOT NULL DEFAULT 24,
    enable_sound_notifications INTEGER NOT NULL DEFAULT 0,
    shuffle_questions INTEGER NOT NULL DEFAULT 0,
    enable_spaced_repetition INTEGER NOT NULL DEFAULT 0,
    color_scheme TEXT NOT NULL DEFAULT 'random',
    custom_colors TEXT NOT NULL DEFAULT '[]',
    selected_categories TEXT NOT NULL DEFAULT '[]',
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    questions TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    start_time TEXT NOT NULL,
    end_time TEXT,
    questions_reviewed INTEGER NOT NULL DEFAULT 0,
    total_duration INTEGER NOT NULL DEFAULT 0
  );


`);
    try {
      const existingUser = sqlite.prepare("SELECT id FROM users WHERE id = ?").get("dev-user-123");
      if (!existingUser) {
        sqlite.prepare(`
      INSERT INTO users (id, email, first_name, last_name, tier, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
          "dev-user-123",
          "dev@example.com",
          "Developer",
          "User",
          "premium",
          (/* @__PURE__ */ new Date()).toISOString(),
          (/* @__PURE__ */ new Date()).toISOString()
        );
        console.log("\u2705 Development user created");
      }
    } catch (error) {
      console.error("Error creating development user:", error);
    }
    console.log("\u2705 SQLite database initialized");
  }
});

// server/subscriptionManager.ts
var subscriptionManager_exports = {};
__export(subscriptionManager_exports, {
  SubscriptionManager: () => SubscriptionManager,
  default: () => subscriptionManager_default
});
import { eq as eq2, sql as sql2 } from "drizzle-orm";
var SubscriptionManager, subscriptionManager_default;
var init_subscriptionManager = __esm({
  "server/subscriptionManager.ts"() {
    "use strict";
    init_db();
    SubscriptionManager = class {
      /**
       * Check if user's subscription is active and not expired
       */
      static async checkSubscriptionStatus(userId) {
        const user = await db.select().from(users).where(eq2(users.id, userId)).limit(1);
        if (!user.length) {
          return {
            isActive: false,
            expiresAt: null,
            daysUntilExpiry: null,
            status: "none",
            needsRenewal: false
          };
        }
        const userData = user[0];
        const now = /* @__PURE__ */ new Date();
        const expiresAt = userData.subscriptionExpiresAt ? new Date(userData.subscriptionExpiresAt) : null;
        const status = userData.subscriptionStatus || "none";
        let isActive = false;
        let daysUntilExpiry = null;
        let needsRenewal = false;
        if (expiresAt) {
          daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
          isActive = expiresAt > now && status === "active";
          needsRenewal = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        }
        return {
          isActive,
          expiresAt,
          daysUntilExpiry,
          status,
          needsRenewal
        };
      }
      /**
       * Update user's subscription after successful payment
       */
      static async activateSubscription(userId, stripeSubscriptionId, stripeCustomerId) {
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        const updateData = {
          tier: "premium",
          subscriptionStatus: "active",
          subscriptionExpiresAt: expiresAt.toISOString(),
          stripeSubscriptionId,
          lastPaymentDate: (/* @__PURE__ */ new Date()).toISOString(),
          upgradedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (stripeCustomerId) {
          updateData.stripeCustomerId = stripeCustomerId;
        }
        await db.update(users).set(updateData).where(eq2(users.id, userId));
      }
      /**
       * Handle subscription expiry - downgrade to free tier
       */
      static async expireSubscription(userId) {
        await db.update(users).set({
          tier: "free",
          subscriptionStatus: "expired",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, userId));
      }
      /**
       * Cancel subscription - user can still use premium until expiry
       */
      static async cancelSubscription(userId) {
        await db.update(users).set({
          subscriptionStatus: "cancelled",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, userId));
      }
      /**
       * Check and update expired subscriptions for all users
       * This should be run periodically (e.g., daily cron job)
       */
      static async processExpiredSubscriptions() {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const expiredUsers = await db.select({ id: users.id }).from(users).where(sql2`
        subscription_expires_at IS NOT NULL 
        AND subscription_expires_at < ${now}
        AND subscription_status = 'active'
      `);
        for (const user of expiredUsers) {
          await this.expireSubscription(user.id);
          console.log(`Subscription expired for user ${user.id}, downgraded to free tier`);
        }
      }
      /**
       * Get users who need renewal reminders (subscription expires within 7 days)
       */
      static async getUsersNeedingRenewalReminder() {
        const sevenDaysFromNow = /* @__PURE__ */ new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const usersNeedingReminder = await db.select({ id: users.id }).from(users).where(sql2`
        subscription_expires_at IS NOT NULL 
        AND subscription_expires_at <= ${sevenDaysFromNow.toISOString()}
        AND subscription_expires_at > ${(/* @__PURE__ */ new Date()).toISOString()}
        AND subscription_status = 'active'
      `);
        return usersNeedingReminder.map((user) => user.id);
      }
    };
    subscriptionManager_default = SubscriptionManager;
  }
});

// server/stripeWebhooks.ts
var stripeWebhooks_exports = {};
__export(stripeWebhooks_exports, {
  handleStripeWebhook: () => handleStripeWebhook,
  stripe: () => stripe
});
import Stripe from "stripe";
import { eq as eq3 } from "drizzle-orm";
async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res.status(400).send("Webhook signature verification failed");
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
}
async function handlePaymentSucceeded(paymentIntent) {
  console.log("Payment succeeded:", paymentIntent.id);
  const userResults = await db.select().from(users).where(eq3(users.stripePaymentIntentId, paymentIntent.id)).limit(1);
  if (userResults.length === 0) {
    console.error("User not found for payment intent:", paymentIntent.id);
    return;
  }
  const user = userResults[0];
  await subscriptionManager_default.activateSubscription(
    user.id,
    paymentIntent.id,
    // Using payment intent as subscription ID for one-time payments
    paymentIntent.customer
  );
  console.log(`Activated premium subscription for user ${user.id}`);
}
async function handleSubscriptionUpdated(subscription) {
  console.log("Subscription updated:", subscription.id);
  const userResults = await db.select().from(users).where(eq3(users.stripeCustomerId, subscription.customer)).limit(1);
  if (userResults.length === 0) {
    console.error("User not found for customer:", subscription.customer);
    return;
  }
  const user = userResults[0];
  if (subscription.status === "active") {
    const expiresAt = new Date(subscription.current_period_end * 1e3);
    await db.update(users).set({
      tier: "premium",
      subscriptionStatus: "active",
      subscriptionExpiresAt: expiresAt.toISOString(),
      stripeSubscriptionId: subscription.id,
      lastPaymentDate: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).where(eq3(users.id, user.id));
    console.log(`Updated subscription for user ${user.id}, expires at ${expiresAt}`);
  }
}
async function handleSubscriptionDeleted(subscription) {
  console.log("Subscription cancelled:", subscription.id);
  const userResults = await db.select().from(users).where(eq3(users.stripeSubscriptionId, subscription.id)).limit(1);
  if (userResults.length === 0) {
    console.error("User not found for subscription:", subscription.id);
    return;
  }
  const user = userResults[0];
  await subscriptionManager_default.cancelSubscription(user.id);
  console.log(`Cancelled subscription for user ${user.id}`);
}
async function handleInvoicePaymentSucceeded(invoice) {
  console.log("Invoice payment succeeded:", invoice.id);
  if (invoice.subscription) {
    const userResults = await db.select().from(users).where(eq3(users.stripeSubscriptionId, invoice.subscription)).limit(1);
    if (userResults.length > 0) {
      const user = userResults[0];
      const currentExpiry = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : /* @__PURE__ */ new Date();
      const newExpiry = new Date(Math.max(currentExpiry.getTime(), (/* @__PURE__ */ new Date()).getTime()));
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      await db.update(users).set({
        subscriptionExpiresAt: newExpiry.toISOString(),
        subscriptionStatus: "active",
        lastPaymentDate: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq3(users.id, user.id));
      console.log(`Renewed subscription for user ${user.id}, new expiry: ${newExpiry}`);
    }
  }
}
async function handleInvoicePaymentFailed(invoice) {
  console.error("Invoice payment failed:", invoice.id);
  if (invoice.subscription) {
    const userResults = await db.select().from(users).where(eq3(users.stripeSubscriptionId, invoice.subscription)).limit(1);
    if (userResults.length > 0) {
      const user = userResults[0];
      console.log(`Payment failed for user ${user.id} - subscription may be at risk`);
    }
  }
}
var stripe;
var init_stripeWebhooks = __esm({
  "server/stripeWebhooks.ts"() {
    "use strict";
    init_db();
    init_subscriptionManager();
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-06-20"
    });
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_db();
init_db();
import { eq, desc, and } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Questions (user-specific)
  async getQuestions(userId) {
    return await db.select().from(questions).where(eq(questions.userId, userId)).orderBy(questions.order);
  }
  async getQuestion(id, userId) {
    const [question] = await db.select().from(questions).where(and(
      eq(questions.id, id),
      eq(questions.userId, userId)
    ));
    return question || void 0;
  }
  async createQuestion(question, userId) {
    const [created] = await db.insert(questions).values({ ...question, userId }).returning();
    return created;
  }
  async updateQuestion(id, question, userId) {
    const [updated] = await db.update(questions).set(question).where(and(
      eq(questions.id, id),
      eq(questions.userId, userId)
    )).returning();
    return updated || void 0;
  }
  async deleteQuestion(id, userId) {
    const result = await db.delete(questions).where(and(
      eq(questions.id, id),
      eq(questions.userId, userId)
    )).returning();
    return result.length > 0;
  }
  async deleteAllQuestions(userId) {
    const result = await db.delete(questions).where(eq(questions.userId, userId)).returning();
    return result.length;
  }
  async reorderQuestions(questionIds, userId) {
    for (let i = 0; i < questionIds.length; i++) {
      await db.update(questions).set({ order: i }).where(and(
        eq(questions.id, questionIds[i]),
        eq(questions.userId, userId)
      ));
    }
  }
  async getQuestionCount(userId) {
    const result = await db.select().from(questions).where(eq(questions.userId, userId));
    return result.length;
  }
  // Preferences (user-specific)
  async getPreferences(userId) {
    const [prefs] = await db.select().from(preferences).where(eq(preferences.userId, userId)).limit(1);
    if (!prefs) {
      const [created] = await db.insert(preferences).values({ userId }).returning();
      return created;
    }
    return prefs;
  }
  async updatePreferences(prefs, userId) {
    const existing = await this.getPreferences(userId);
    if (existing) {
      const [updated] = await db.update(preferences).set(prefs).where(eq(preferences.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(preferences).values({ ...prefs, userId }).returning();
      return created;
    }
  }
  // Templates
  async getTemplates() {
    return await db.select().from(templates);
  }
  async getTemplate(id) {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || void 0;
  }
  async createTemplate(template) {
    const [created] = await db.insert(templates).values(template).returning();
    return created;
  }
  async deleteTemplate(id) {
    const result = await db.delete(templates).where(eq(templates.id, id)).returning();
    return result.length > 0;
  }
  // Study Sessions
  async createStudySession(session) {
    const [created] = await db.insert(studySessions).values(session).returning();
    return created;
  }
  async updateStudySession(id, session) {
    const [updated] = await db.update(studySessions).set(session).where(eq(studySessions.id, id)).returning();
    return updated || void 0;
  }
  async getRecentSessions(limit = 10) {
    return await db.select().from(studySessions).orderBy(desc(studySessions.startTime)).limit(limit);
  }
};
var storage = new DatabaseStorage();

// shared/schema.ts
import { pgTable, text as text2, integer as integer2, real as real2, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
var users2 = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  tier: varchar("tier").notNull().default("free"),
  // "free" or "premium"
  stripeCustomerId: varchar("stripe_customer_id"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  // When premium expires
  subscriptionStatus: varchar("subscription_status").default("none"),
  // none, active, expired, cancelled
  lastPaymentDate: timestamp("last_payment_date"),
  // Last successful payment
  upgradedAt: timestamp("upgraded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var questions2 = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
  question: text2("question").notNull(),
  answer: text2("answer").notNull(),
  category: text2("category"),
  tags: json("tags").$type().default([]),
  duration: integer2("duration").notNull().default(5),
  customColor: text2("custom_color"),
  timesReviewed: integer2("times_reviewed").notNull().default(0),
  lastReviewed: timestamp("last_reviewed"),
  performanceScore: real2("performance_score").notNull().default(0.5),
  order: integer2("order").notNull().default(0)
});
var preferences2 = pgTable("preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users2.id, { onDelete: "cascade" }),
  defaultDuration: integer2("default_duration").notNull().default(5),
  bannerHeight: integer2("banner_height").notNull().default(48),
  fontSize: integer2("font_size").notNull().default(24),
  enableSoundNotifications: integer2("enable_sound_notifications").notNull().default(0),
  // 0 = false, 1 = true
  shuffleQuestions: integer2("shuffle_questions").notNull().default(0),
  enableSpacedRepetition: integer2("enable_spaced_repetition").notNull().default(0),
  colorScheme: text2("color_scheme").notNull().default("random"),
  customColors: json("custom_colors").$type().default([]),
  selectedCategories: json("selected_categories").$type().default([])
});
var templates2 = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text2("name").notNull(),
  description: text2("description"),
  category: text2("category").notNull(),
  questions: json("questions").$type().notNull()
});
var studySessions2 = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  questionsReviewed: integer2("questions_reviewed").notNull().default(0),
  totalDuration: integer2("total_duration").notNull().default(0)
});
var insertQuestionSchema = createInsertSchema(questions2).omit({
  id: true,
  userId: true,
  // Server-managed
  timesReviewed: true,
  lastReviewed: true,
  performanceScore: true
});
var selectQuestionSchema = createSelectSchema(questions2);
var insertPreferencesSchema = createInsertSchema(preferences2).omit({
  id: true,
  userId: true
  // Server-managed
});
var selectPreferencesSchema = createSelectSchema(preferences2);
var insertTemplateSchema = createInsertSchema(templates2).omit({ id: true });
var selectTemplateSchema = createSelectSchema(templates2);
var insertStudySessionSchema = createInsertSchema(studySessions2).omit({ id: true });
var selectStudySessionSchema = createSelectSchema(studySessions2);
var TIER_LIMITS = {
  free: 10,
  premium: 50
};

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.post("/api/stripe/webhook", async (req, res) => {
    const { handleStripeWebhook: handleStripeWebhook2 } = await Promise.resolve().then(() => (init_stripeWebhooks(), stripeWebhooks_exports));
    await handleStripeWebhook2(req, res);
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.user.id;
      let user = await storage.getUser(userId);
      if (user) {
        const SubscriptionManager2 = await Promise.resolve().then(() => (init_subscriptionManager(), subscriptionManager_exports));
        const subscriptionInfo = await SubscriptionManager2.default.checkSubscriptionStatus(user.id);
        if (user.tier === "premium" && !subscriptionInfo.isActive && subscriptionInfo.status === "expired") {
          await SubscriptionManager2.default.expireSubscription(user.id);
          user = await storage.getUser(userId);
        }
        user.subscriptionInfo = subscriptionInfo;
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/subscription/status", async (req, res) => {
    try {
      const userId = req.user.id;
      const SubscriptionManager2 = await Promise.resolve().then(() => (init_subscriptionManager(), subscriptionManager_exports));
      const subscriptionInfo = await SubscriptionManager2.default.checkSubscriptionStatus(userId);
      res.json(subscriptionInfo);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });
  app2.post("/api/subscription/create-payment-intent", async (req, res) => {
    try {
      const { stripe: stripe2 } = await Promise.resolve().then(() => (init_stripeWebhooks(), stripeWebhooks_exports));
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const paymentIntent = await stripe2.paymentIntents.create({
        amount: 199,
        // $1.99 in cents
        currency: "usd",
        metadata: {
          userId: user.id,
          tier: "premium",
          duration: "12months"
        }
      });
      await storage.updateUser(user.id, {
        stripePaymentIntentId: paymentIntent.id
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });
  app2.post("/api/subscription/cancel", async (req, res) => {
    try {
      const userId = req.user.id;
      const SubscriptionManager2 = await Promise.resolve().then(() => (init_subscriptionManager(), subscriptionManager_exports));
      await SubscriptionManager2.default.cancelSubscription(userId);
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });
  app2.get("/api/questions", async (req, res) => {
    try {
      const userId = req.user.id;
      const questions3 = await storage.getQuestions(userId);
      res.json(questions3);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/questions/:id", async (req, res) => {
    try {
      const userId = req.user.id;
      const id = req.params.id;
      const question = await storage.getQuestion(id, userId);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/questions", async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const currentCount = await storage.getQuestionCount(userId);
      const limit = TIER_LIMITS[user.tier];
      if (currentCount >= limit) {
        return res.status(403).json({
          error: `Question limit reached. ${user.tier === "free" ? "Upgrade to premium for up to 50 questions." : "Maximum of 50 questions reached."}`,
          currentCount,
          limit,
          tier: user.tier
        });
      }
      const validatedData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(validatedData, userId);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/questions/:id", async (req, res) => {
    try {
      const userId = req.user.id;
      const id = req.params.id;
      const question = await storage.updateQuestion(id, req.body, userId);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/questions", async (req, res) => {
    try {
      const userId = req.user.id;
      const count = await storage.deleteAllQuestions(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/questions/:id", async (req, res) => {
    try {
      const userId = req.user.id;
      const id = req.params.id;
      const success = await storage.deleteQuestion(id, userId);
      if (!success) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/questions/reorder", async (req, res) => {
    try {
      const userId = req.user.id;
      const { questionIds } = req.body;
      if (!Array.isArray(questionIds)) {
        return res.status(400).json({ error: "questionIds must be an array" });
      }
      await storage.reorderQuestions(questionIds, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/preferences", async (req, res) => {
    try {
      const userId = req.user.id;
      const prefs = await storage.getPreferences(userId);
      res.json(prefs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/preferences", async (req, res) => {
    try {
      const userId = req.user.id;
      const prefs = await storage.updatePreferences(req.body, userId);
      res.json(prefs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/templates", async (req, res) => {
    try {
      const templates3 = await storage.getTemplates();
      res.json(templates3);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/templates/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/templates", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteTemplate(id);
      if (!success) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/sessions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const session = await storage.updateStudySession(id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/sessions/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const sessions = await storage.getRecentSessions(limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/backgroundTasks.ts
init_subscriptionManager();
async function processExpiredSubscriptions() {
  try {
    console.log("Starting expired subscription check...");
    await subscriptionManager_default.processExpiredSubscriptions();
    console.log("Expired subscription check completed");
  } catch (error) {
    console.error("Error processing expired subscriptions:", error);
  }
}
async function sendRenewalReminders() {
  try {
    console.log("Checking for users needing renewal reminders...");
    const userIds = await subscriptionManager_default.getUsersNeedingRenewalReminder();
    for (const userId of userIds) {
      console.log(`User ${userId} needs renewal reminder - subscription expires within 7 days`);
      console.log(`Renewal reminder needed for user: ${userId}`);
    }
    console.log(`Processed ${userIds.length} renewal reminders`);
  } catch (error) {
    console.error("Error sending renewal reminders:", error);
  }
}
function startBackgroundTasks() {
  const runDaily = () => {
    const now = /* @__PURE__ */ new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    setTimeout(() => {
      processExpiredSubscriptions();
      sendRenewalReminders();
      setInterval(() => {
        processExpiredSubscriptions();
        sendRenewalReminders();
      }, 24 * 60 * 60 * 1e3);
    }, msUntilMidnight);
  };
  console.log("Background subscription tasks scheduled");
  runDaily();
  if (process.env.NODE_ENV === "development") {
    console.log("Running initial subscription check (development mode)");
    setTimeout(() => {
      processExpiredSubscriptions();
      sendRenewalReminders();
    }, 5e3);
  }
}

// server/index.ts
var app = express2();
app.use((req, res, next) => {
  req.user = {
    id: "dev-user-1",
    email: "dev@example.com",
    firstName: "Dev",
    lastName: "User",
    profileImageUrl: null
  };
  next();
});
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0";
  server.listen(port, host, () => {
    log(`serving on ${host}:${port}`);
    startBackgroundTasks();
  });
})();
