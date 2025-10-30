import Database from 'better-sqlite3';
import { playerStatus } from '../../src/enum_status/enum_userStatus.js';

const db = new Database('database.db');

db.exec(`DROP TABLE IF EXISTS users`);
// Drop and recreate the table
db.exec(` CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar_url TEXT DEFAULT '../images/default_avatar.png',
    status TEXT DEFAULT '${playerStatus.DISCONNECT}',
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    twoFA_enabled BOOLEAN DEFAULT 0,
    created_at DATE DEFAULT (date('now')),
    updated_at DATE DEFAULT (date('now')))`);

// Prepare insert statement
const insertUser = db.prepare(`
  INSERT INTO users (username, email, password, status, twoFA_enabled)
  VALUES (@username, @email, @password, @status, @twoFA_enabled)
`);

// Sample users
const users = [
  {
    username: 'alice',
    email: 'alice@example.com',
    password: 'hashed_password_1',
    status: playerStatus.DISCONNECT,
    twoFA_enabled: 1,
  },
  {
    username: 'bob',
    email: 'bob@example.com',
    password: 'hashed_password_2',
    status: playerStatus.DISCONNECT,
    twoFA_enabled: 0,
  },
];

// Insert users
const insertMany = db.transaction((users) => {
  for (const user of users) insertUser.run(user);
});

insertMany(users);

const schema = db.prepare("PRAGMA table_info(users)").all();
console.log('🧬 Users Table Schema:');
console.table(schema);

const print = db.prepare('SELECT * FROM users').all();

// Print each user
console.log('📋 Users Table:');
for (const user of print) {
  console.log(user);
}

