import Database from 'better-sqlite3'
import type { RunResult } from 'better-sqlite3'
import { SaveUser } from '../types/RouteGuest';
import { print } from '../server';
import { connectedRoomInstance } from '../state/ConnectedRoom';
import db from '../database/db';

export type UserReturnDB = {
	id: number;
	username: string;
	email: string;
	password: string;
	status: string;
	twoFA_enabled: number;
	avatar_url: string | null;
}

class UsersModel {
    private db: Database.Database;
    private stmFindUser: Database.Statement;
    private stmGetAllUsers: Database.Statement;
    private stmGetProfileById: Database.Statement;
    private stmGetAvatarURLById: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?');
        this.stmGetAllUsers = db.prepare('SELECT id, username FROM users');
        this.stmGetProfileById = db.prepare('SELECT id, username, avatar_url FROM users WHERE id = ?');
        this.stmGetAvatarURLById = db.prepare('SELECT avatar_url FROM users WHERE id = ?');
    }

    findUserByUsername(username: string): any | undefined {
        return this.stmFindUser.get("", username);
    }

    findUserByEmail(email: string): any | undefined {
        return this.stmFindUser.get(email, "");
    }

    getProfileById(id: number): any | undefined {
        const returnDB = this.stmGetProfileById.get(id) as { id: number; username: string; avatar: string } | undefined;
        if (!returnDB) {
            return { message: 'error', data: 'user not found' };
        }
        return { message: 'success', data: returnDB };
    }

    getAllUsers(): Array<{ id: number | bigint; username: string }> {
        return this.stmGetAllUsers.all() as UserReturnDB[];
    }

    getAvatarURLById(id: number): string | null | undefined {
        const result = this.stmGetAvatarURLById.get(id) as { avatar_url: string | null } | undefined;
        return result?.avatar_url;
    }
}

const dbUsersInstance = new UsersModel(db);

export { UsersModel, dbUsersInstance };
