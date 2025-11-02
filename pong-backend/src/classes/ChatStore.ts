import db from "../../database/db.js";
import { MessagesModel } from "../models/messagesModel.js";
import { MessageModelTable } from "../types/Tables.js";

class ChatStore {
    private messageModelInstance = new MessagesModel(db);
    
    addMessageToDataBase(senderId: number, receiverId: number, message: string) {
        this.messageModelInstance.saveMessage(Number(senderId), Number(receiverId), message);
    }

    getHistory(senderId: number, receiverId: number) {
        const history = this.messageModelInstance.getMessages(senderId, receiverId) as MessageModelTable[] | [];
        return history.map(msg => ({
            from: msg.sender_id.toString(),
            to: msg.receiver_id.toString(),
            message: msg.content,
            timestamp: new Date(msg.timestamp).getTime()
        }));
    }
}

export const chatStore = new ChatStore();