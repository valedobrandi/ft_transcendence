import Database from 'better-sqlite3'
import path from 'path';

const db = new Database(path.resolve('/app/database.db'),{ verbose: console.log })

export default db