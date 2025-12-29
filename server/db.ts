import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres';
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import { 
  sqliteTable, 
  text as sqliteText, 
  integer as sqliteInteger, 
  real as sqliteReal 
} from 'drizzle-orm/sqlite-core';
import {
  pgTable,
  text as pgText,
  integer as pgInteger,
  real as pgReal,
  timestamp as pgTimestamp,
  uuid as pgUuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = !!DATABASE_URL;

// Define schema based on environment
let users: any, questions: any, preferences: any, templates: any, studySessions: any, guestPremium: any, contactMessages: any;

if (isProduction) {
  // PostgreSQL schema for production
  users = pgTable("users", {
    id: pgUuid("id").primaryKey().defaultRandom(),
    email: pgText("email").unique().notNull(),
    passwordHash: pgText("password_hash").notNull(),
    firstName: pgText("first_name"),
    lastName: pgText("last_name"),
    profileImageUrl: pgText("profile_image_url"),
    tier: pgText("tier").notNull().default("free"),
    emailVerified: pgInteger("email_verified").notNull().default(0),
    resetToken: pgText("reset_token"),
    resetTokenExpires: pgTimestamp("reset_token_expires"),
    magicLinkToken: pgText("magic_link_token"),
    magicLinkExpires: pgTimestamp("magic_link_expires"),
    stripeCustomerId: pgText("stripe_customer_id"),
    stripePaymentIntentId: pgText("stripe_payment_intent_id"),
    stripeSubscriptionId: pgText("stripe_subscription_id"),
    subscriptionExpiresAt: pgTimestamp("subscription_expires_at"),
    subscriptionStatus: pgText("subscription_status").default("none"),
    lastPaymentDate: pgTimestamp("last_payment_date"),
    upgradedAt: pgTimestamp("upgraded_at"),
    createdAt: pgTimestamp("created_at").defaultNow(),
    updatedAt: pgTimestamp("updated_at").defaultNow(),
  });

  questions = pgTable("questions", {
    id: pgUuid("id").primaryKey().defaultRandom(),
    userId: pgText("user_id").notNull(),
    question: pgText("question").notNull(),
    answer: pgText("answer").notNull(),
    category: pgText("category"),
    tags: pgText("tags").default("[]"),
    duration: pgInteger("duration").notNull().default(5),
    customColor: pgText("custom_color"),
    timesReviewed: pgInteger("times_reviewed").notNull().default(0),
    lastReviewed: pgTimestamp("last_reviewed"),
    performanceScore: pgReal("performance_score").notNull().default(0.5),
    order: pgInteger("order").notNull().default(0),
  });

  preferences = pgTable("preferences", {
    id: pgUuid("id").primaryKey().defaultRandom(),
    userId: pgText("user_id").notNull().unique(),
    defaultDuration: pgInteger("default_duration").notNull().default(5),
    bannerHeight: pgInteger("banner_height").notNull().default(48),
    fontSize: pgInteger("font_size").notNull().default(24),
    enableSoundNotifications: pgInteger("enable_sound_notifications").notNull().default(0),
    shuffleQuestions: pgInteger("shuffle_questions").notNull().default(0),
    enableSpacedRepetition: pgInteger("enable_spaced_repetition").notNull().default(0),
    colorScheme: pgText("color_scheme").notNull().default("random"),
    customColors: pgText("custom_colors").notNull().default("[]"),
    selectedCategories: pgText("selected_categories").notNull().default("[]"),
    createdAt: pgTimestamp("created_at").defaultNow(),
    updatedAt: pgTimestamp("updated_at").defaultNow(),
  });

  templates = pgTable("templates", {
    id: pgUuid("id").primaryKey().defaultRandom(),
    name: pgText("name").notNull(),
    description: pgText("description"),
    category: pgText("category").notNull(),
    questions: pgText("questions").notNull(),
  });

  studySessions = pgTable("study_sessions", {
    id: pgUuid("id").primaryKey().defaultRandom(),
    userId: pgText("user_id"),
    guestId: pgText("guest_id"),
    startTime: pgTimestamp("start_time").notNull(),
    endTime: pgTimestamp("end_time"),
    questionsReviewed: pgInteger("questions_reviewed").notNull().default(0),
    totalDuration: pgInteger("total_duration").notNull().default(0),
  });

  guestPremium = pgTable("guest_premium", {
    id: pgUuid("id").primaryKey().defaultRandom(),
    guestId: pgText("guest_id").notNull().unique(),
    email: pgText("email"),
    tier: pgText("tier").notNull().default("premium"),
    stripePaymentIntentId: pgText("stripe_payment_intent_id"),
    stripeCustomerId: pgText("stripe_customer_id"),
    linkedUserId: pgText("linked_user_id"),
    magicLinkToken: pgText("magic_link_token"),
    magicLinkExpires: pgTimestamp("magic_link_expires"),
    subscriptionExpiresAt: pgTimestamp("subscription_expires_at"),
    subscriptionStatus: pgText("subscription_status").default("active"),
    createdAt: pgTimestamp("created_at").defaultNow(),
    updatedAt: pgTimestamp("updated_at").defaultNow(),
  });

  contactMessages = pgTable("contact_messages", {
    id: pgUuid("id").primaryKey().defaultRandom(),
    name: pgText("name").notNull(),
    email: pgText("email").notNull(),
    message: pgText("message").notNull(),
    status: pgText("status").notNull().default("new"),
    createdAt: pgTimestamp("created_at").defaultNow(),
  });
} else {
  // SQLite schema for local development
  users = sqliteTable("users", {
    id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: sqliteText("email").unique().notNull(),
    passwordHash: sqliteText("password_hash").notNull(),
    firstName: sqliteText("first_name"),
    lastName: sqliteText("last_name"),
    profileImageUrl: sqliteText("profile_image_url"),
    tier: sqliteText("tier").notNull().default("free"),
    emailVerified: sqliteInteger("email_verified").notNull().default(0),
    resetToken: sqliteText("reset_token"),
    resetTokenExpires: sqliteText("reset_token_expires"),
    magicLinkToken: sqliteText("magic_link_token"),
    magicLinkExpires: sqliteText("magic_link_expires"),
    stripeCustomerId: sqliteText("stripe_customer_id"),
    stripePaymentIntentId: sqliteText("stripe_payment_intent_id"),
    stripeSubscriptionId: sqliteText("stripe_subscription_id"),
    subscriptionExpiresAt: sqliteText("subscription_expires_at"),
    subscriptionStatus: sqliteText("subscription_status").default("none"),
    lastPaymentDate: sqliteText("last_payment_date"),
    upgradedAt: sqliteText("upgraded_at"),
    createdAt: sqliteText("created_at").$defaultFn(() => new Date().toISOString()),
    updatedAt: sqliteText("updated_at").$defaultFn(() => new Date().toISOString()),
  });

  questions = sqliteTable("questions", {
    id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: sqliteText("user_id").notNull(),
    question: sqliteText("question").notNull(),
    answer: sqliteText("answer").notNull(),
    category: sqliteText("category"),
    tags: sqliteText("tags").default("[]"),
    duration: sqliteInteger("duration").notNull().default(5),
    customColor: sqliteText("custom_color"),
    timesReviewed: sqliteInteger("times_reviewed").notNull().default(0),
    lastReviewed: sqliteText("last_reviewed"),
    performanceScore: sqliteReal("performance_score").notNull().default(0.5),
    order: sqliteInteger("order").notNull().default(0),
  });

  preferences = sqliteTable("preferences", {
    id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: sqliteText("user_id").notNull().unique(),
    defaultDuration: sqliteInteger("default_duration").notNull().default(5),
    bannerHeight: sqliteInteger("banner_height").notNull().default(48),
    fontSize: sqliteInteger("font_size").notNull().default(24),
    enableSoundNotifications: sqliteInteger("enable_sound_notifications").notNull().default(0),
    shuffleQuestions: sqliteInteger("shuffle_questions").notNull().default(0),
    enableSpacedRepetition: sqliteInteger("enable_spaced_repetition").notNull().default(0),
    colorScheme: sqliteText("color_scheme").notNull().default("random"),
    customColors: sqliteText("custom_colors").notNull().default("[]"),
    selectedCategories: sqliteText("selected_categories").notNull().default("[]"),
    createdAt: sqliteText("created_at").$defaultFn(() => new Date().toISOString()),
    updatedAt: sqliteText("updated_at").$defaultFn(() => new Date().toISOString()),
  });

  templates = sqliteTable("templates", {
    id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: sqliteText("name").notNull(),
    description: sqliteText("description"),
    category: sqliteText("category").notNull(),
    questions: sqliteText("questions").notNull(),
  });

  studySessions = sqliteTable("study_sessions", {
    id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: sqliteText("user_id"),
    guestId: sqliteText("guest_id"),
    startTime: sqliteText("start_time").notNull(),
    endTime: sqliteText("end_time"),
    questionsReviewed: sqliteInteger("questions_reviewed").notNull().default(0),
    totalDuration: sqliteInteger("total_duration").notNull().default(0),
  });

  guestPremium = sqliteTable("guest_premium", {
    id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    guestId: sqliteText("guest_id").notNull().unique(),
    email: sqliteText("email"),
    tier: sqliteText("tier").notNull().default("premium"),
    stripePaymentIntentId: sqliteText("stripe_payment_intent_id"),
    stripeCustomerId: sqliteText("stripe_customer_id"),
    linkedUserId: sqliteText("linked_user_id"),
    magicLinkToken: sqliteText("magic_link_token"),
    magicLinkExpires: sqliteText("magic_link_expires"),
    subscriptionExpiresAt: sqliteText("subscription_expires_at"),
    subscriptionStatus: sqliteText("subscription_status").default("active"),
    createdAt: sqliteText("created_at").$defaultFn(() => new Date().toISOString()),
    updatedAt: sqliteText("updated_at").$defaultFn(() => new Date().toISOString()),
  });

  contactMessages = sqliteTable("contact_messages", {
    id: sqliteText("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: sqliteText("name").notNull(),
    email: sqliteText("email").notNull(),
    message: sqliteText("message").notNull(),
    status: sqliteText("status").notNull().default("new"),
    createdAt: sqliteText("created_at").$defaultFn(() => new Date().toISOString()),
  });
}

export { users, questions, preferences, templates, studySessions, guestPremium, contactMessages };

const schema = {
  users,
  questions,
  preferences,
  templates,
  studySessions,
  guestPremium,
  contactMessages
};

// Initialize database connection based on environment
export let db: any;

if (isProduction && DATABASE_URL) {
  // Use PostgreSQL for production
  console.log('🐘 Connecting to PostgreSQL database...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  db = drizzlePostgres(pool, { schema });
  
  // Initialize PostgreSQL tables
  (async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          profile_image_url TEXT,
          tier TEXT NOT NULL DEFAULT 'free',
          email_verified INTEGER NOT NULL DEFAULT 0,
          reset_token TEXT,
          reset_token_expires TIMESTAMP,
          magic_link_token TEXT,
          magic_link_expires TIMESTAMP,
          stripe_customer_id TEXT,
          stripe_payment_intent_id TEXT,
          stripe_subscription_id TEXT,
          subscription_expires_at TIMESTAMP,
          subscription_status TEXT DEFAULT 'none',
          last_payment_date TIMESTAMP,
          upgraded_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          category TEXT,
          tags TEXT DEFAULT '[]',
          duration INTEGER NOT NULL DEFAULT 5,
          custom_color TEXT,
          times_reviewed INTEGER NOT NULL DEFAULT 0,
          last_reviewed TIMESTAMP,
          performance_score REAL NOT NULL DEFAULT 0.5,
          "order" INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS preferences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          questions TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS study_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT,
          guest_id TEXT,
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP,
          questions_reviewed INTEGER NOT NULL DEFAULT 0,
          total_duration INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS guest_premium (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          guest_id TEXT NOT NULL UNIQUE,
          email TEXT,
          tier TEXT NOT NULL DEFAULT 'premium',
          stripe_payment_intent_id TEXT,
          stripe_customer_id TEXT,
          linked_user_id TEXT,
          magic_link_token TEXT,
          magic_link_expires TIMESTAMP,
          subscription_expires_at TIMESTAMP,
          subscription_status TEXT DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS contact_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'new',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('✅ PostgreSQL database initialized');
    } catch (error) {
      console.error('❌ Error initializing PostgreSQL:', error);
    }
  })();
} else {
  // Use SQLite for local development
  console.log('📁 Using SQLite database for local development...');
  const sqlite = new Database('quiz-banner.db');
  db = drizzleSqlite(sqlite, { schema });

  // Create SQLite tables
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
        INSERT INTO users (id, email, first_name, last_name, tier, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'dev-user-123',
        'dev@example.com',
        'Developer',
        'User',
        'premium',
        'dummy-hash',
        new Date().toISOString(),
        new Date().toISOString()
      );
      console.log('✅ Development user created');
    }
  } catch (error) {
    console.error('Error creating development user:', error);
  }

  console.log('✅ SQLite database initialized');
}
