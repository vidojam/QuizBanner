const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'quiz-banner.db');
const db = new Database(dbPath);

console.log('🔄 Adding magic link fields to database...');

try {
  // Check if columns already exist before adding them
  const usersColumns = db.pragma('table_info(users)');
  const hasMagicLinkToken = usersColumns.some(col => col.name === 'magic_link_token');
  
  if (!hasMagicLinkToken) {
    // Add magic link fields to users table
    db.exec(`
      ALTER TABLE users ADD COLUMN magic_link_token TEXT;
    `);
    db.exec(`
      ALTER TABLE users ADD COLUMN magic_link_expires TEXT;
    `);
    console.log('✓ Added magic link fields to users table');
  } else {
    console.log('✓ Magic link fields already exist in users table');
  }

  // Check guest_premium table
  const guestPremiumColumns = db.pragma('table_info(guest_premium)');
  const hasGuestMagicLink = guestPremiumColumns.some(col => col.name === 'magic_link_token');
  
  if (!hasGuestMagicLink) {
    // Add magic link fields to guest_premium table
    db.exec(`
      ALTER TABLE guest_premium ADD COLUMN magic_link_token TEXT;
    `);
    db.exec(`
      ALTER TABLE guest_premium ADD COLUMN magic_link_expires TEXT;
    `);
    console.log('✓ Added magic link fields to guest_premium table');
  } else {
    console.log('✓ Magic link fields already exist in guest_premium table');
  }

  console.log('✅ Magic link migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
