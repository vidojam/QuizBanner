import { z } from "zod";
import { pgTable, text, integer, real, timestamp, json, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

// User table with tier tracking
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  tier: varchar("tier").notNull().default("free"), // "free" or "premium"
  emailVerified: integer("email_verified").notNull().default(0), // 0 = false, 1 = true
  resetToken: varchar("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"), // When premium expires
  subscriptionStatus: varchar("subscription_status").default("none"), // none, active, expired, cancelled
  lastPaymentDate: timestamp("last_payment_date"), // Last successful payment
  upgradedAt: timestamp("upgraded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Drizzle Tables
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"),
  tags: json("tags").$type<string[]>().default([]),
  duration: integer("duration").notNull().default(5),
  customColor: text("custom_color"),
  timesReviewed: integer("times_reviewed").notNull().default(0),
  lastReviewed: timestamp("last_reviewed"),
  performanceScore: real("performance_score").notNull().default(0.5),
  order: integer("order").notNull().default(0),
});

export const preferences = pgTable("preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  defaultDuration: integer("default_duration").notNull().default(5),
  bannerHeight: integer("banner_height").notNull().default(48),
  fontSize: integer("font_size").notNull().default(24),
  enableSoundNotifications: integer("enable_sound_notifications").notNull().default(0), // 0 = false, 1 = true
  shuffleQuestions: integer("shuffle_questions").notNull().default(0),
  enableSpacedRepetition: integer("enable_spaced_repetition").notNull().default(0),
  colorScheme: text("color_scheme").notNull().default("random"),
  customColors: json("custom_colors").$type<string[]>().default([]),
  selectedCategories: json("selected_categories").$type<string[]>().default([]),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  questions: json("questions").$type<InsertQuestionAnswer[]>().notNull(),
});

export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  questionsReviewed: integer("questions_reviewed").notNull().default(0),
  totalDuration: integer("total_duration").notNull().default(0),
});

// Zod Schemas from Drizzle
export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  userId: true, // Server-managed
  timesReviewed: true,
  lastReviewed: true,
  performanceScore: true,
});

export const selectQuestionSchema = createSelectSchema(questions);

export const insertPreferencesSchema = createInsertSchema(preferences).omit({ 
  id: true,
  userId: true, // Server-managed
});
export const selectPreferencesSchema = createSelectSchema(preferences);

export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true });
export const selectTemplateSchema = createSelectSchema(templates);

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true });
export const selectStudySessionSchema = createSelectSchema(studySessions);

// User schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Types
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Preferences = typeof preferences.$inferSelect;
export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

// Legacy type aliases for backward compatibility
export type QuestionAnswer = Question;
export type InsertQuestionAnswer = InsertQuestion;

// Tier constants and helpers
export const TIER_LIMITS = {
  free: 10,
  premium: 50,
} as const;

export type UserTier = "free" | "premium";
