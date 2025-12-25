import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';

// SQLite-compatible schema for local development
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  tier: text("tier").notNull().default("free"),
  emailVerified: integer("email_verified").notNull().default(0), // 0 = false, 1 = true
  resetToken: text("reset_token"),
  resetTokenExpires: text("reset_token_expires"), // ISO date string
  magicLinkToken: text("magic_link_token"),
  magicLinkExpires: text("magic_link_expires"), // ISO date string
  stripeCustomerId: text("stripe_customer_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionExpiresAt: text("subscription_expires_at"), // ISO date string when premium expires
  subscriptionStatus: text("subscription_status").default("none"), // none, active, expired, cancelled
  lastPaymentDate: text("last_payment_date"), // ISO date string of last successful payment
  upgradedAt: text("upgraded_at"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"),
  tags: text("tags").default("[]"), // JSON string
  duration: integer("duration").notNull().default(5),
  customColor: text("custom_color"),
  timesReviewed: integer("times_reviewed").notNull().default(0),
  lastReviewed: text("last_reviewed"),
  performanceScore: real("performance_score").notNull().default(0.5),
  order: integer("order").notNull().default(0),
});

export const preferences = sqliteTable("preferences", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  defaultDuration: integer("default_duration").notNull().default(5),
  bannerHeight: integer("banner_height").notNull().default(48),
  fontSize: integer("font_size").notNull().default(24),
  enableSoundNotifications: integer("enable_sound_notifications").notNull().default(0),
  shuffleQuestions: integer("shuffle_questions").notNull().default(0),
  enableSpacedRepetition: integer("enable_spaced_repetition").notNull().default(0),
  colorScheme: text("color_scheme").notNull().default("random"),
  customColors: text("custom_colors").notNull().default("[]"), // JSON string for SQLite
  selectedCategories: text("selected_categories").notNull().default("[]"), // JSON string for SQLite
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const templates = sqliteTable("templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  questions: text("questions").notNull(), // JSON string for SQLite
});

export const studySessions = sqliteTable("study_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id"),
  guestId: text("guest_id"), // For guest sessions
  startTime: text("start_time").notNull(), // ISO string for SQLite
  endTime: text("end_time"),
  questionsReviewed: integer("questions_reviewed").notNull().default(0),
  totalDuration: integer("total_duration").notNull().default(0),
});

// Guest premium purchases - tracks premium status for guests
export const guestPremium = sqliteTable("guest_premium", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  guestId: text("guest_id").notNull().unique(),
  email: text("email"),
  tier: text("tier").notNull().default("premium"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCustomerId: text("stripe_customer_id"),
  linkedUserId: text("linked_user_id"), // Set when guest converts to account
  magicLinkToken: text("magic_link_token"),
  magicLinkExpires: text("magic_link_expires"), // ISO date string
  subscriptionExpiresAt: text("subscription_expires_at"),
  subscriptionStatus: text("subscription_status").default("active"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

// Contact form submissions
export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new, read, resolved
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

const schema = {
  users,
  questions,
  preferences,
  templates,
  studySessions,
  guestPremium,
  contactMessages
};

// Use SQLite for local development
const sqlite = new Database('quiz-banner.db');
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
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
    email_verified INTEGER NOT NULL DEFAULT 0,
    reset_token TEXT,
    reset_token_expires TEXT,
    magic_link_token TEXT,
    magic_link_expires TEXT,
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
    user_id TEXT,
    guest_id TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT,
    questions_reviewed INTEGER NOT NULL DEFAULT 0,
    total_duration INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS guest_premium (
    id TEXT PRIMARY KEY,
    guest_id TEXT NOT NULL UNIQUE,
    email TEXT,
    tier TEXT NOT NULL DEFAULT 'premium',
    stripe_payment_intent_id TEXT,
    stripe_customer_id TEXT,
    linked_user_id TEXT,
    magic_link_token TEXT,
    magic_link_expires TEXT,
    subscription_expires_at TEXT,
    subscription_status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL
  );

`);

// Insert development user if it doesn't exist
try {
  const existingUser = sqlite.prepare('SELECT id FROM users WHERE id = ?').get('dev-user-123');
  if (!existingUser) {
    sqlite.prepare(`
      INSERT INTO users (id, email, first_name, last_name, tier, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'dev-user-123',
      'dev@example.com', 
      'Developer',
      'User',
      'premium',
      new Date().toISOString(),
      new Date().toISOString()
    );
    console.log('✅ Development user created');
  }
} catch (error) {
  console.error('Error creating development user:', error);
}

console.log('✅ SQLite database initialized');
