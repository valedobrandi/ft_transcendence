import Database from 'better-sqlite3'
import type { RunResult } from 'better-sqlite3'
import { userModelReturn } from '../types/RouteGuest';
import crypto from 'crypto';

class UsersModel {
	private db: Database.Database;
	private stmFindUser: Database.Statement;
	private stmSaveGuestUsername: Database.Statement;

	constructor(db: Database.Database) {
		this.db = db;
		this.stmFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?');
		this.stmSaveGuestUsername = db.prepare(`
            INSERT INTO users
            (username, email, password, status, twoFA_enabled)
            VALUES (?, ?, ?, ?, ?)`
		);
	}

	findUserByEmailOrUsername(username: string): any | undefined {
		return this.stmFindUser.get("", username);
	}

	saveGuestUsername(username: string): userModelReturn {
		const guestEmail = `${username}@guest.com`;
		const guestPassword = crypto.randomUUID();
		const response: RunResult = this.stmSaveGuestUsername.run(username, guestEmail, guestPassword, 'DISCONNECT', 0);
		return { message: 'success', id: response.lastInsertRowid, username };
	}
}

export { UsersModel };

