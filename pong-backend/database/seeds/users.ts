import { playerStatus } from '../../src/enum_status/enum_userStatus.js';
import db from '../db.js';
import { matchStatus } from '../../src/enum_status/enum_matchStatus.js';



// Drop and recreate the tables
db.exec('BEGIN');
db.exec(`DROP TABLE IF EXISTS messages`);
db.exec(`DROP TABLE IF EXISTS matches`);
db.exec(`DROP TABLE IF EXISTS friends`);
db.exec(`DROP TABLE IF EXISTS users`);
db.exec(`DROP TABLE IF EXISTS chatblock`);
db.exec('COMMIT');

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

db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    match_id TEXT PRIMARY KEY,
    player1 TEXT NOT NULL,
    player2 TEXT NOT NULL,
    score1 INTEGER DEFAULT 0,
    score2 INTEGER DEFAULT 0,
    match_status TEXT DEFAULT '${matchStatus.WAITING}',
    created_at DATE DEFAULT (date('now')))`);


db.exec(` CREATE TABLE IF NOT EXISTS friends (

    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    created_at DATE DEFAULT (date('now')),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(friend_id) REFERENCES users(id),
    UNIQUE(user_id, friend_id)
    )`);

// chatblockusers Table
db.exec(` CREATE TABLE IF NOT EXISTS chatblock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    blocked_user_id INTEGER NOT NULL,
    created_at DATE DEFAULT (date('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, blocked_user_id)
    )`);


db.exec(` CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sender INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE)
    `);

db.exec(` CREATE INDEX IF NOT EXISTS idx_messages_users ON messages (sender_id, receiver_id, timestamp)`);
// # SEED TABLE

// Prepare insert statement
const insertUser = db.prepare(`
  INSERT INTO users (username, email, password, status, twoFA_enabled)
  VALUES (@username, @email, @password, @status, @twoFA_enabled)
`);

// Sample users
const users = [
    {
        username: 'INTRA',
        email: 'admin',
        password: 'hashed_password_admin',
        status: playerStatus.DISCONNECT,
        twoFA_enabled: 0,
    },
    {
        username: 'guest',
        email: 'guest@guest.com',
        password: 'hashed_password_3',
        status: playerStatus.DISCONNECT,
        twoFA_enabled: 0,
    },
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

