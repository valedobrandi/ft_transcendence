import db from "../database/db.js";
import { MessagesModel } from "../models/messagesModel.js";
import { print } from "../server.js";
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
		//print(`[CHAT STORE] Fetched ${data.length} messages between ${senderId} and ${receiverId}`);
        if (status === 'error') return [];

        return data.map(msg => this.formatHistory(msg));
    }

    formatHistory(msg: MessageModelTable) {
        return {
            id: msg.id,
            from: Number(msg.sender_id),
            to: Number(msg.receiver_id),
            senderId: Number(msg.sender_id),
            message: msg.content,
            timestamp: new Date(msg.timestamp).getTime(),
            isRead: msg.isRead,
        };
    }

    getSenders(history: ChatMessage[]) {
        return history.map(entry => [entry.from, entry.to])[0];
    }

    getChatHistories(userId: number): ChatHistory[] {
        const histories = this.messageModelInstance.getChatHistory(Number(userId)) as MessageModelTable[] | [];
        //print(`[CHAT STORE] Fetched ${histories.length} messages for user ID ${userId}`);
        const chatMap: { [key: number]: { sender: [number, number], history: ChatMessage[] } } = {};

        histories.forEach(msg => {
            const otherUserId = msg.sender_id === Number(userId) ? msg.receiver_id : msg.sender_id;
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