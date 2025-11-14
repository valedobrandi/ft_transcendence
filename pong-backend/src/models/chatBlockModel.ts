import Database from 'better-sqlite3'
import { ChatModelTable } from '../types/Tables.js';

export type AddUserToBlockList = {
    status: "error" | "success",
    data: {}
};

export type DeleteUserFromBlockList = {
    status: "error" | "success",
    data: {}
};

export type GetBlockedUsers = {
    status: "error" | "success",
    data: number[]
}


class ChatBlockModel {
    private db: Database.Database;
    private stmAddToBlockList: Database.Statement;
    private stmDeleteFromBlockList: Database.Statement;
    private stmGetBlockList: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmAddToBlockList = db.prepare(
            `INSERT INTO chatblock (user_id, blockedId) VALUES (?, ?)`
        );
        this.stmDeleteFromBlockList = db.prepare(
            `DELETE FROM chatblock WHERE user_id = ? AND blockedId = ?`
        );
        this.stmGetBlockList = db.prepare(
            `SELECT blockedId FROM chatblock WHERE user_id = ?`
        );
    }

    addUserToBlockList(userId: number, blockedUserId: number): AddUserToBlockList {
        const response = this.stmAddToBlockList.run(userId, blockedUserId);
        if (response.changes > 0) return { status: "success", data: { } };
        return { status: "error", data: {} };
    }

    deleteUserFromBlockList(userId: number, blockedUserId: number): DeleteUserFromBlockList {
        const response = this.stmDeleteFromBlockList.run(userId, blockedUserId);
        if (response.changes > 0) return { status: "success", data: {} };
        return { status: "error", data: {} };
    }

    getBlockedUsers(userId: number): GetBlockedUsers {
        const rows = this.stmGetBlockList.all(userId) as ChatModelTable[] | [];
        if (rows === undefined) {
            return { status: "error", data: []};
        }
        return { status: "success", data: rows.map((user) => user.blockedId) };
    }
}
export { ChatBlockModel };