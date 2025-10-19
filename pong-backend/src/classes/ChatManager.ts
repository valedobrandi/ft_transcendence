import ChatStore from "./ChatStore.js";
import { connectedRoom } from "../state/connectedRoom.js";
import { conversationStore } from "../state/conversationStore.js";

class ChatManager {

    constructor(public userId: string) { }

    getConversationId(userA: string, userB: string): string {
        return [userA, userB].sort().join('-');
    }

    sendMessage(receiver: string, message: string, sender: string) {
        const send = connectedRoom.get(this.userId);

        if (send) {
            send.socket.send(JSON.stringify({
                message: 'CHAT_MESSAGE',
                receiver: receiver,
                chat: message,
				sender
            }));
        };

    }

    receiveMessage(fromUserId: string, message: string) {
        const chatId = this.getConversationId(this.userId, fromUserId);

        let chatKey = conversationStore.get(chatId);

        if (chatKey === undefined) {
            chatKey = new ChatStore(this.userId, fromUserId);
            const chatId = this.getConversationId(this.userId, fromUserId);
            conversationStore.set(chatId, chatKey);
        }
        chatKey.addMessage(fromUserId, this.userId, message);
    }
}

export default ChatManager;