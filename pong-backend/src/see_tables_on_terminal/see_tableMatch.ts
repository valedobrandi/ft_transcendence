import Database from 'better-sqlite3'

const db = new Database('/home/jelecoq/Documents/popo/pong-backend/database.db')

const matches = db.prepare('SELECT * FROM matches').all();
console.table(matches);