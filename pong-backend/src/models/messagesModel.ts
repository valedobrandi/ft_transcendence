import Database from "better-sqlite3";
import { print } from "../server";

/*  id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE) */

class MessagesModel {
    private db: Database.Database;
    private stmSaveMessage: Database.Statement;
    private stmGetMessages: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmSaveMessage = db.prepare(`
            INSERT INTO messages (sender_id, receiver_id, content, sender)
            VALUES (?, ?, ?, ?)
            `)
        this.stmGetMessages = db.prepare(`
            SELECT
            m.*,
            se.username AS sender_username,
            rc.username AS receiver_username
            FROM messages m
            JOIN users se ON m.sender_id = se.id
            JOIN users rc ON m.receiver_id = rc.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?)
                OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.timestamp ASC`)
    }

    saveMessage(senderId: number, receiverId: number, content: string): void {
        console.log('Saving message:', { senderId, receiverId, content });
        this.stmSaveMessage.run(senderId, receiverId, content, Number(senderId));
    }

    getMessages(userId1: number, userId2: number): unknown[] {
        const response =  this.stmGetMessages.all(userId1, userId2, userId2, userId1);
		print(`Messages between ${userId1} and ${userId2}: ${JSON.stringify(response)}`);
        return response;
    }
}

export { MessagesModel };