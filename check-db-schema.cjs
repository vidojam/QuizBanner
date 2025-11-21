const Database = require('better-sqlite3');
const db = new Database('quiz-banner.db');

console.log('Users table schema:');
const schema = db.prepare("PRAGMA table_info(users)").all();
console.log(schema);

console.log('\nAll users:');
const users = db.prepare("SELECT * FROM users").all();
console.log(users);

db.close();
