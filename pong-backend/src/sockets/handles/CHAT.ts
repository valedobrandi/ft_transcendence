import { chatStore } from "../../classes/ChatStore.js";
import { connectedRoomInstance } from "../../state/connectedRoom.js";
import { ChatHistory } from "../../types/ChatHistory.js";
import { ChatType } from "../types.js";

class ChatHandler {

    receiver(data: ChatType) {

        const {receiverId, senderId, receiver, sender, message} = data;
        
        chatStore.addMessageToDataBase(senderId, receiverId, message);
        const history = chatStore.getHistory(senderId, receiverId);

        const to = connectedRoomInstance.getById(receiver);
        if (to) to.chat.sendMessage(receiver, message, sender, history);

        const from = connectedRoomInstance.getById(sender);
        if (from) from.chat.sendMessage(sender, message, sender, history);
    }

    sendSocket() {
        return {
            'CHAT_MESSAGE': (receiver: string, message: string, sender: string, history: ChatHistory[] ) => ({
                message: 'CHAT_MESSAGE',
                receiver: receiver,
                chat: message,
                sender: sender,
                history: history
            })
        }
    }
}

export function CHAT(data: ChatType) {

    const to = connectedRoomInstance.getById(data.receiver);

    const from = connectedRoomInstance.getById(data.sender);

    if (!from || !to) return

    to.chat.sendMessage(data.sender, data.message, data.sender);

    from.chat.sendMessage(data.receiver, data.message, data.sender);


}

export const chatHandler = new ChatHandler();