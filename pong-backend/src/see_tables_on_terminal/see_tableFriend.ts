import Database from 'better-sqlite3'

const db = new Database('/home/jelecoq/Documents/popo/pong-backend/database.db')

const friends = db.prepare('SELECT * FROM friends').all();
console.table(friends);