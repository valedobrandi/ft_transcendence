import Database from 'better-sqlite3'
import type { RunResult } from 'better-sqlite3'
import { SaveUser } from '../types/RouteGuest';
import { print } from '../server';
import { connectedRoomInstance } from '../state/ConnectedRoom';

class UsersModel {
    private db: Database.Database;
    private stmFindUser: Database.Statement;
    private stmSaveUser: Database.Statement;
    private stmGetAllUsers: Database.Statement;
	private stmSaveGuestUsername: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?');
        this.stmSaveUser = db.prepare(`
            INSERT INTO users
            (username, email, password, status, twoFA_enabled)
            VALUES (?, ?, ?, ?, ?)`
        );
        this.stmGetAllUsers = db.prepare('SELECT id, username FROM users');
    }

    findUserByUsername(username: string): any | undefined {
        return this.stmFindUser.get("", username);
    }

    findUserByEmail(email: string): any | undefined {
        return this.stmFindUser.get(email, "");
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
            const response: RunResult = this.stmSaveGuestUsername.run(username, guestEmail, guestPassword, 'DISCONNECT', 0);
            connectedRoomInstance.broadcastRegisteredUsers();
            return { message: 'success', id: response.lastInsertRowid, username };
        } catch (error) {
            print('error saving guest username');
            return { status:'error', error: 'error saving guest username' };
        }
    }

    getAllUsers(): Array<{ id: number | bigint; username: string }> {
        return this.stmGetAllUsers.all();
    }
}

export { UsersModel };

