import Database from 'better-sqlite3'

const db = new Database('/home/jelecoq/Documents/popo/pong-backend/database.db')

const users = db.prepare('SELECT * FROM users').all();
console.table(users);