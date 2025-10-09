import Database from 'better-sqlite3';
const db = new Database('database.db');
db.exec(` CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    created_at DATE DEFAULT (date('now','localtime')))`);
export default db;
