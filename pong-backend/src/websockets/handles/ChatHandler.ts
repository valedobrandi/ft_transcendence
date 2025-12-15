import db from "../../database/db.js";
import { chatStore } from "../../classes/ChatStore.js";
import { ChatBlockModel } from "../../models/chatBlockModel.js";
import { print } from "../../server.js";
import { connectedRoomInstance } from "../../state/ConnectedRoom.js";
import { ChatHistory } from "../../types/ChatHistory.js";
import { ChatMessage } from "../../types/ChatMessage.js";
import { ChatType } from "../types.js";

class ChatHandler {
    private chatBlockModel = new ChatBlockModel(db);

    service(data: ChatType) {
        const {receiverId, senderId, message} = data;

        //print(`[CHAT] senderId: ${senderId} receiverId: ${receiverId}: ${message}`);

        const to = connectedRoomInstance.getById(Number(receiverId));
        const from = connectedRoomInstance.getById(Number(senderId));

        // Check the chatBlock database to see if the receiver has blocked the sender
        const chatBlockDB = this.chatBlockModel.getBlockedUsers(Number(receiverId))
            .data.includes(Number(senderId))

        const isBlocked = chatBlockDB ? 1 : 0;

        chatStore.addMessageToDataBase(Number(senderId), Number(receiverId), message, isBlocked);

        const history = chatStore.getHistory(Number(senderId), Number(receiverId));
		const senderHistory = chatStore.getHistory(senderId, receiverId);
		const receiverHistory = chatStore.getHistory(receiverId, senderId);

        // Extract [senderId, receiverId] from history
        const participants = chatStore.getSenders(history);

        if (to !== undefined && !isBlocked) {
            to.chat.sendMessage( participants, receiverHistory);
        }

        if (from !== undefined) {
            from.chat.sendMessage(participants, senderHistory);
        }
    }

    controller() {
        return {
            'CHAT_MESSAGE': (sender: number[], history: ChatMessage[] ) => ({
                message: 'CHAT_MESSAGE',
                sender: sender,
                history: history
            }),
            'CHAT_HISTORY': (data: ChatHistory[]) => ({
                status: 200,
                message: 'CHAT_HISTORY',
                history: data
            })
        }
    }
}

export const chatHandler = new ChatHandler();