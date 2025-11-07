import Database from 'better-sqlite3'
import type { RunResult } from 'better-sqlite3'
import { resourceLimits } from 'worker_threads';
import { UserModelTable } from '../types/Tables';
import { SaveUser } from '../types/RouteGuest';


class UsersModel {
    private db: Database.Database;
    private stmFindUser: Database.Statement;
    private stmSaveUser: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?');
        this.stmSaveUser = db.prepare(`
            INSERT INTO users
            (username, email, password, status, twoFA_enabled)
            VALUES (?, ?, ?, ?, ?)`
        );
    }

    findUserByEmailOrUsername(username: string): any | undefined {
        return this.stmFindUser.get("", username);
    }

    insertUser() {
        
    }
    
    //InsertInfo(email, username, hash)
    // {
    //     const insertNewUserInDB = db.prepare('INSERT INTO users (email, username, password) VALUES (?,?,?)');
    //     insertNewUserInDB.run(email, username, hash);
    // }


    saveGuestUsername(username: string): SaveUser {
        try {
            const guestEmail = `${username}@guest.com`;
            const guestPassword = crypto.randomUUID();
            const response: RunResult = this.stmSaveUser.run(username, guestEmail, guestPassword, 'DISCONNECT', 0);
            return { message: 'success', id: response.lastInsertRowid, username };
        } catch (error) {
            console.error('DB error saving guest:', error);
            return { error: 'error saving guest username' };
        }
    }
}

export { UsersModel };

