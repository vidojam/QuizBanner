require('dotenv/config');
const { neon } = require('@neondatabase/serverless');

async function createTestPremium() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('This script needs to run on Render or with DATABASE_URL set');
    process.exit(1);
  }

  console.log('🔗 Connecting to production database...\n');
  
  try {
    const sql = neon(databaseUrl);
    
    // Check if guest_premium table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'guest_premium'
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  guest_premium table does not exist yet');
      console.log('Creating table...\n');
      
      await sql`
        CREATE TABLE IF NOT EXISTS guest_premium (
          id TEXT PRIMARY KEY,
          guest_id TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          tier TEXT DEFAULT 'free',
          subscription_status TEXT,
          subscription_expires_at TEXT,
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `;
      
      console.log('✅ Table created');
    }
    
    // Generate guest ID
    const guestId = 'guest-' + Math.random().toString(36).substring(2, 9);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year from now
    
    // Check if email already exists
    const existing = await sql`
      SELECT * FROM guest_premium WHERE email = 'vidojam@gmail.com'
    `;
    
    if (existing.length > 0) {
      console.log('⚠️  Premium user already exists for vidojam@gmail.com');
      console.log('Existing record:');
      console.log(existing[0]);
      
      // Update to active if needed
      await sql`
        UPDATE guest_premium 
        SET tier = 'premium',
            subscription_status = 'active',
            subscription_expires_at = ${expiresAt.toISOString()},
            updated_at = ${now}
        WHERE email = 'vidojam@gmail.com'
      `;
      console.log('\n✅ Updated to active premium status');
    } else {
      // Insert new record
      await sql`
        INSERT INTO guest_premium (
          id, guest_id, email, tier, subscription_status,
          subscription_expires_at, created_at, updated_at
        ) VALUES (
          ${id},
          ${guestId},
          'vidojam@gmail.com',
          'premium',
          'active',
          ${expiresAt.toISOString()},
          ${now},
          ${now}
        )
      `;
      
      console.log('✅ Created test premium user on Render production database!');
      console.log('\n📧 Email: vidojam@gmail.com');
      console.log('🎫 Guest ID:', guestId);
      console.log('⏰ Expires:', expiresAt.toLocaleDateString());
    }
    
    // Verify
    const result = await sql`
      SELECT * FROM guest_premium WHERE email = 'vidojam@gmail.com'
    `;
    
    console.log('\n✅ Verified - Premium user in database:');
    console.log(result[0]);
    
    console.log('\n🎉 You can now test with vidojam@gmail.com at:');
    console.log('   https://quizbanner.onrender.com/magic-login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createTestPremium();
