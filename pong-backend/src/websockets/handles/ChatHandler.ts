import { chatStore } from "../../classes/ChatStore.js";
import { connectedRoomInstance } from "../../state/connectedRoom.js";
import { ChatHistory } from "../../types/ChatHistory.js";
import { ChatMessage } from "../../types/ChatMessage.js";
import { ChatType } from "../types.js";

class ChatHandler {

    service(data: ChatType) {
        const {receiverId, senderId, receiver, sender, message} = data;

        var isBlocked;
        const to = connectedRoomInstance.getByName(receiver);
        const from = connectedRoomInstance.getByName(sender);

        if (to !== undefined) isBlocked = to.chat.isUserBlocked(senderId) ? 1 : 0;
        
        chatStore.addMessageToDataBase(senderId, receiverId, message, isBlocked);
        const history = chatStore.getHistory(senderId, receiverId);

        // Extract [senderId, receiverId] from history
        const participants = chatStore.getSenders(history);

        if (to !== undefined && !isBlocked) {
            to.chat.sendMessage(receiver, message, participants, history);
        }

        if (from !== undefined) {
            from.chat.sendMessage(sender, message, participants, history);
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

// export function CHAT(data: ChatType) {

//     const to = connectedRoomInstance.getById(data.receiver);

//     const from = connectedRoomInstance.getById(data.sender);

//     if (!from || !to) return

//     to.chat.sendMessage(data.sender, data.message, data.sender);

//     from.chat.sendMessage(data.receiver, data.message, data.sender);


// }

export const chatHandler = new ChatHandler();