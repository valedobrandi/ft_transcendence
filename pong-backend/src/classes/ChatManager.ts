import ChatStore from "./ChatStore.js";
import { connectedRoom } from "../state/connectedRoom.js";
import { conversationStore } from "../state/conversationStore.js";

class ChatManager {

    constructor(public userId: string) { }

    getConversationId(userA: string, userB: string): string {
        return [userA, userB].sort().join('-');
    }

    sendMessage(toUserId: string, message: string) {
        const chatId = this.getConversationId(this.userId, toUserId);
        let chatKey = conversationStore.get(toUserId);

        if (chatKey === undefined) {
            chatKey = new ChatStore(this.userId, toUserId);
            conversationStore.set(chatId, chatKey);

        }

        chatKey.addMessage(this.userId, toUserId, message);

        const sendTo = connectedRoom.get(toUserId);

        if (sendTo === undefined) return;
        sendTo.chat.receiveMessage(this.userId, message);

        sendTo.socket.send(JSON.stringify({
            message: 'CHAT_MESSAGE',
            from: this.userId,
            chat: message
        }));

    }

    receiveMessage(fromUserId: string, message: string) {
        let chatKey = conversationStore.get(fromUserId);
        if (chatKey === undefined) {
            chatKey = new ChatStore(this.userId, fromUserId);
            const chatId = this.getConversationId(this.userId, fromUserId);
            conversationStore.set(chatId, chatKey);
        }
        chatKey.addMessage(fromUserId, this.userId, message);
    }
}

export default ChatManager;