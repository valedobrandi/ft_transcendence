import db from "./db.js";

export async function createSchema() {
	db.exec(` CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			avatar_url TEXT DEFAULT 'avatar_default.jpg',
			authToken TEXT DEFAULT '',
			twoFA_enabled BOOLEAN DEFAULT 0,
			created_at DATE DEFAULT (date('now')),
			updated_at DATE DEFAULT (date('now')))`);

	db.exec(`CREATE TABLE IF NOT EXISTS matches (
			match_id TEXT PRIMARY KEY,
			player1 TEXT NOT NULL,
			player2 TEXT NOT NULL,
			match_status TEXT DEFAULT 'waiting',
			created_at DATE DEFAULT (date('now')))`);

	db.exec(` CREATE TABLE IF NOT EXISTS friends (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			friend_id INTEGER NOT NULL,
			created_at DATE DEFAULT (date('now')),
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(friend_id) REFERENCES users(id)
			)`);

	db.exec(` CREATE TABLE IF NOT EXISTS chatblock (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			blockedId INTEGER NOT NULL,
			created_at DATE DEFAULT (date('now')),
			FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY(blockedId) REFERENCES users(id) ON DELETE CASCADE
			)`);

	db.exec(` CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender_id INTEGER NOT NULL,
			receiver_id INTEGER NOT NULL,
			content TEXT NOT NULL,
			sender INTEGER NOT NULL,
			isBlocked BOOLEAN DEFAULT 0,
			isRead BOOLEAN DEFAULT 0,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE)
			`);

	db.exec(` CREATE INDEX IF NOT EXISTS idx_messages_users ON messages (sender_id, receiver_id, timestamp)`);

	db.exec(`CREATE TABLE IF NOT EXISTS events (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			type TEXT NOT NULL,
			from_id INTEGER,
			to_id INTEGER,
			payload TEXT,
			status TEXT DEFAULT 'pending',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(from_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY(to_id) REFERENCES users(id) ON DELETE CASCADE)`
		);
}