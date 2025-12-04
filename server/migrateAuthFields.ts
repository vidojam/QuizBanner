import Database from 'better-sqlite3';
import { join } from 'path';

/**
 * Migration script to add authentication fields to existing database
 * Run this with: npx tsx server/migrateAuthFields.ts
 */

async function migrateAuthFields() {
  const dbPath = join(process.cwd(), 'quiz-banner.db');
  console.log(`Migrating database at: ${dbPath}`);
  
  const db = new Database(dbPath);
  
  try {
    // Check if columns already exist
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
    const existingColumns = new Set(tableInfo.map(col => col.name));
    
    console.log('Existing columns:', Array.from(existingColumns));
    
    // Begin transaction
    db.prepare('BEGIN').run();
    
    // Add passwordHash column (nullable initially, we'll handle existing users)
    if (!existingColumns.has('passwordHash')) {
      console.log('Adding passwordHash column...');
      db.prepare('ALTER TABLE users ADD COLUMN passwordHash TEXT').run();
    }
    
    // Add emailVerified column
    if (!existingColumns.has('emailVerified')) {
      console.log('Adding emailVerified column...');
      db.prepare('ALTER TABLE users ADD COLUMN emailVerified INTEGER DEFAULT 0').run();
    }
    
    // Add resetToken column
    if (!existingColumns.has('resetToken')) {
      console.log('Adding resetToken column...');
      db.prepare('ALTER TABLE users ADD COLUMN resetToken TEXT').run();
    }
    
    // Add resetTokenExpires column
    if (!existingColumns.has('resetTokenExpires')) {
      console.log('Adding resetTokenExpires column...');
      db.prepare('ALTER TABLE users ADD COLUMN resetTokenExpires TEXT').run();
    }
    
    // Make email NOT NULL if it isn't already
    // Note: SQLite doesn't support ALTER COLUMN, so we need to check if email column allows NULL
    const emailColumn = tableInfo.find(col => col.name === 'email') as any;
    if (emailColumn && emailColumn.notnull === 0) {
      console.log('Email column currently allows NULL. Checking for NULL emails...');
      const nullEmails = db.prepare('SELECT COUNT(*) as count FROM users WHERE email IS NULL').get() as { count: number };
      
      if (nullEmails.count > 0) {
        console.warn(`Warning: Found ${nullEmails.count} users with NULL emails. Please update these manually.`);
      }
    }
    
    // Handle existing users - they need to be migrated
    // For now, we'll just mark their password as NULL and they'll need to use forgot password
    const existingUsers = db.prepare('SELECT id, email FROM users WHERE passwordHash IS NULL').all();
    
    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing user(s) without passwords.`);
      console.log('These users will need to use "Forgot Password" to set a password.');
      console.log('User IDs:', existingUsers.map((u: any) => u.id).join(', '));
    }
    
    // Commit transaction
    db.prepare('COMMIT').run();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update .env with JWT_SECRET and email configuration');
    console.log('2. Existing users will need to use "Forgot Password" to set their password');
    console.log('3. New users can register normally');
    
  } catch (error) {
    // Rollback on error
    db.prepare('ROLLBACK').run();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run migration
migrateAuthFields().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
