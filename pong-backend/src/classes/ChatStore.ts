import db from "../../database/db.js";
import { MessagesModel } from "../models/messagesModel.js";
import { ChatHistory } from "../types/ChatHistory.js";
import { ChatMessage } from "../types/ChatMessage.js";
import { MessageModelTable } from "../types/Tables.js";

class ChatStore {
    private messageModelInstance = new MessagesModel(db);

    addMessageToDataBase(senderId: number, receiverId: number, message: string, isBlocked = 1) {
        this.messageModelInstance.saveMessage(Number(senderId), Number(receiverId), message, isBlocked);
    }

    getHistory(senderId: number, receiverId: number) {
        const {status, data} = this.messageModelInstance.getMessages(senderId, receiverId);
        if (status === 'error') return [];

        return data.map(msg => this.formatHistory(msg));
    }

    formatHistory(msg: MessageModelTable) {
        return {
            from: Number(msg.sender_id),
            to: Number(msg.receiver_id),
            senderId: Number(msg.sender_id),
            message: msg.content,
            timestamp: new Date(msg.timestamp).getTime()
        };
    }

    getSenders(history: ChatMessage[]) {
        return history.map(entry => [entry.from, entry.to])[0];
    }

    getChatHistories(userId: number): ChatHistory[] {
        const histories = this.messageModelInstance.getChatHistory(userId) as MessageModelTable[] | [];
        const chatMap: { [key: number]: { sender: [number, number], history: ChatMessage[] } } = {};

        histories.forEach(msg => {
            const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
            if (!chatMap[otherUserId]) {
                chatMap[otherUserId] = { sender: [Number(msg.sender_id), Number(msg.receiver_id)], history: [] };
            }
            chatMap[otherUserId].history.push(this.formatHistory(msg));
        });

        return Object.values(chatMap).map(entry => ({
            sender: entry.sender,
            history: entry.history
        }));
    }
}

export const chatStore = new ChatStore();