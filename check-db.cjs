const Database = require('better-sqlite3');

const db = new Database('./database.sqlite');

console.log('Checking database tables...');
const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=?').all('table');
console.log('Tables:', tables);

if (tables.find(t => t.name === 'users')) {
  console.log('\nUsers table columns:');
  const columns = db.prepare('PRAGMA table_info(users)').all();
  console.log(columns.map(c => c.name));
} else {
  console.log('Users table does not exist!');
}

db.close();