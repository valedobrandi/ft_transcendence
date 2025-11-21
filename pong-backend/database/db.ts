import Database from 'better-sqlite3'
import path from 'path';

// Database docker path
const db = new Database(path.resolve('/app/database.db'))

export default db