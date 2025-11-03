import Database from 'better-sqlite3'
import { ChatModelTable } from '../types/Tables.js';


class ChatBlockModel {
    private db: Database.Database;
    private stmAddToBlockList: Database.Statement;
    private stmDeleteFromBlockList: Database.Statement;
    private stmGetBlockList: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmAddToBlockList = db.prepare(
            `INSERT INTO chatblock (user_id, blocked_user_id) VALUES (?, ?)`);
        this.stmDeleteFromBlockList = db.prepare(
            `DELETE FROM chatblock WHERE user_id = ? AND blocked_user_id = ?`
        );
        this.stmGetBlockList = db.prepare(
            `SELECT blocked_user_id FROM chatblock WHERE user_id = ?`
        );
    }

    addUserToBlockList(userId: number, blockedUserId: number): void {
        try {
            this.stmAddToBlockList.run(userId, blockedUserId);
        } catch (error) {
            console.error('Error adding user to block list:', error);
            throw error;
        }
    }

    deleteUserFromBlockList(userId: number, blockedUserId: number): void {
        try {
            this.stmDeleteFromBlockList.run(userId, blockedUserId);
        } catch (error) {
            console.error('Error deleting user from block list:', error);
            throw error;
        }
    }



    getBlockedUsers(userId: number): ChatModelTable[] {
        try {
            const rows = this.stmGetBlockList.all(userId) as ChatModelTable[];

            return rows;
        } catch (error) {
            console.error('Error retrieving blocked users:', error);
            throw error;
        }
    }
}

export { ChatBlockModel };