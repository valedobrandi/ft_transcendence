import Database from 'better-sqlite3'
import type { RunResult } from 'better-sqlite3'
import { UserModelTable } from '../types/Tables';
import { SaveUser } from '../types/RouteGuest';

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

    findUserByEmailOrUsername(email: string, username: string): any | undefined {
        return this.stmFindUser.get(email, username);
    }

    saveGuestUsername(username: string): SaveUser {
        try {
            const guestEmail = `${username}@guest.com`;
            const guestPassword = crypto.randomUUID();
            const response: RunResult = this.stmSaveGuestUsername.run(username, guestEmail, guestPassword, 'DISCONNECT', 0);
            return { message: 'success', id: response.lastInsertRowid, username };
        } catch (error) {
            console.error('DB error saving guest:', error);
            return { error: 'error saving guest username' };
        }
    }
}

export { UsersModel };

