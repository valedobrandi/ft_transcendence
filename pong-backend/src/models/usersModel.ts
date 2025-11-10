import Database from 'better-sqlite3'
import type { RunResult } from 'better-sqlite3'
import { SaveUser } from '../types/RouteGuest';
import { print } from '../server';
import { connectedRoomInstance } from '../state/ConnectedRoom';

class UsersModel {
    private db: Database.Database;
    private stmFindUser: Database.Statement;
    private stmSaveGuestUsername: Database.Statement;
    private stmGetAllUsers: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?');
        this.stmSaveGuestUsername = db.prepare(`
            INSERT INTO users
            (username, email, password, status, twoFA_enabled)
            VALUES (?, ?, ?, ?, ?)`
        );
        this.stmGetAllUsers = db.prepare('SELECT id, username FROM users');
    }

    findUserByEmailOrUsername(username: string): any | undefined {
        return this.stmFindUser.get("", username);
    }

    saveGuestUsername(username: string): SaveUser {
        try {
            const guestEmail = `${username}@guest.com`;
            const guestPassword = crypto.randomUUID();
            const response: RunResult = this.stmSaveGuestUsername.run(username, guestEmail, guestPassword, 'DISCONNECT', 0);
            connectedRoomInstance.broadCastRegisteredUsers();
            return { message: 'success', id: response.lastInsertRowid, username };
        } catch (error) {
            print('error saving guest username');
            return { error: 'error saving guest username' };
        }
    }

    getAllUsers(): Array<{ id: number | bigint; username: string }> {
        return this.stmGetAllUsers.all();
    }
}

export { UsersModel };

