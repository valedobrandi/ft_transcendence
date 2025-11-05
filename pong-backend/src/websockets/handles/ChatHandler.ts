import { chatStore } from "../../classes/ChatStore.js";
import { connectedRoomInstance } from "../../state/connectedRoom.js";
import { ChatHistory } from "../../types/ChatHistory.js";
import { ChatMessage } from "../../types/ChatMessage.js";
import { ChatType } from "../types.js";

class ChatHandler {

    receiver(data: ChatType) {

        const {receiverId, senderId, receiver, sender, message} = data;
        
        chatStore.addMessageToDataBase(senderId, receiverId, message);
        const history = chatStore.getHistory(senderId, receiverId);

        // Extract [senderId, receiverId] from history
        const participants = chatStore.getSenders(history);

        const to = connectedRoomInstance.getByName(receiver);
        if (to) to.chat.sendMessage(receiver, message, participants, history);

        const from = connectedRoomInstance.getByName(sender);
        if (from) from.chat.sendMessage(sender, message, participants, history);
    }

    sendSocket() {
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

// export function CHAT(data: ChatType) {

//     const to = connectedRoomInstance.getById(data.receiver);

//     const from = connectedRoomInstance.getById(data.sender);

//     if (!from || !to) return

//     to.chat.sendMessage(data.sender, data.message, data.sender);

//     from.chat.sendMessage(data.receiver, data.message, data.sender);


// }

export const chatHandler = new ChatHandler();