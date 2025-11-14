import Database from "better-sqlite3";
import { print } from "../server";

export type GetMessages ={
    status: 'success' | 'error';
    data: [] |
    {
        id: number;
        sender_id: number;
        receiver_id: number;
        content: string;
        timestamp: string;
        isBlocked: number;
        sender: number;
    }[];
}

class MessagesModel {
    private db: Database.Database;
    private stmSaveMessage: Database.Statement;
    private stmGetMessages: Database.Statement;
    private stmGetChatHistory: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmSaveMessage = db.prepare(`
            INSERT INTO messages (sender_id, receiver_id, content, sender, isBlocked)
            VALUES (?, ?, ?, ?, ?)
            `)
        this.stmGetChatHistory = db.prepare(`
            SELECT * FROM messages
            WHERE sender_id = ? 
            OR (receiver_id = ? AND isBlocked = 0)
            ORDER BY timestamp ASC`);
        this.stmGetMessages = db.prepare(`
            SELECT * FROM messages m
            WHERE (m.sender_id = ? AND m.receiver_id = ?)
                OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.timestamp ASC`)
    }

    getChatHistory(userId: number): unknown[] {
        const response = this.stmGetChatHistory.all(Number(userId), Number(userId));
        return response;
    }

    getMessages(senderId: number, receiverId: number): GetMessages {
        const response =  this.stmGetMessages.all(Number(senderId), Number(receiverId), Number(receiverId), Number(senderId));
        if (response.length === 0) {
            
            return {status: 'error', data: []};
        }
        const data = response.filter((msg: any) => {
            if (msg.sender_id === senderId) return true;
            if (msg.receiver_id === senderId && msg.isBlocked === 0) return true;
            return false;
        })
        return {status: 'success', data: data};
    }

    saveMessage(senderId: number, receiverId: number, content: string, isBlocked = 0): void {
        this.stmSaveMessage.run(Number(senderId), Number(receiverId), content, Number(senderId), isBlocked);
    }
}

export { MessagesModel };