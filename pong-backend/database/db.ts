import Database from 'better-sqlite3'
import path from 'path';

const dbPath = path.resolve("/app/database/pong.db");
const db = new Database(dbPath);

export default db
