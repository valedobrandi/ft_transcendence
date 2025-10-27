import Database from 'better-sqlite3'
import { playerStatus } from './enum_status/enum_userStatus.js';
import { matchStatus } from './enum_status/enum_matchStatus.js';

const db = new Database('database.db');

db.exec(` CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar_url TEXT DEFAULT '../images/default_avatar.png',
    status TEXT DEFAULT '${playerStatus.DISCONNECT}',
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    created_at DATE DEFAULT (date('now')),
    updated_at DATE DEFAULT (date('now')))`);

db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    match_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    score1 INTEGER DEFAULT 0,
    score2 INTEGER DEFAULT 0,
    winner_id INTEGER,
    match_status TEXT DEFAULT '${matchStatus.WAITING}',
    created_at DATE DEFAULT (date('now')),
    FOREIGN KEY(player1_id) REFERENCES users(id),
    FOREIGN KEY(player2_id) REFERENCES users(id)
  )`);

db.exec(` CREATE TABLE IF NOT EXISTS friends (

    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTERGER NOT NULL,
    friend_id INTEGER NOT NULL,
    create_at DATE DEFAULT (date('now')),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(friend_id) REFERENCES users(id)
    UNIQUE(user_id, friend_id)
    )`);
  
export default db