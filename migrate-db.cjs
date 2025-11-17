const Database = require('better-sqlite3');

const db = new Database('./quiz-banner.db');

console.log('Adding subscription columns to users table...');

try {
  // Add subscription_expires_at column
  db.exec('ALTER TABLE users ADD COLUMN subscription_expires_at TEXT');
  console.log('✓ Added subscription_expires_at column');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('✓ subscription_expires_at column already exists');
  } else {
    console.log('Error adding subscription_expires_at:', e.message);
  }
}

try {
  // Add subscription_status column  
  db.exec('ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT "none"');
  console.log('✓ Added subscription_status column');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('✓ subscription_status column already exists');
  } else {
    console.log('Error adding subscription_status:', e.message);
  }
}

try {
  // Add last_payment_date column
  db.exec('ALTER TABLE users ADD COLUMN last_payment_date TEXT');
  console.log('✓ Added last_payment_date column');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('✓ last_payment_date column already exists');
  } else {
    console.log('Error adding last_payment_date:', e.message);
  }
}

db.close();
console.log('Migration completed!');