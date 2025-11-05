import { chatHandler } from "../websockets/handles/ChatHandler.js";
import { connectedRoomInstance } from "../state/connectedRoom.js";
import { ChatMessage } from "../types/ChatMessage.js";
import { chatStore } from "./ChatStore.js";

class ChatManager {
    private id: number;
    private username: string;

    constructor(id: number, username: string) {
        this.id = id;
        this.username = username;
    }

    getConversationId(userA: string, userB: string): string {
        return [userA, userB].sort().join('-');
    }

    sendMessage(receiver: string, message: string, sender: number[], history: ChatMessage[] = []) {
        const send = connectedRoomInstance.getByName(this.username);

        if (send && send.socket) {
            send.socket.send(JSON.stringify(
                chatHandler.sendSocket().CHAT_MESSAGE(sender, history)
            ));
        };

    }

    sendHistory() {
        const user = connectedRoomInstance.getByName(this.username);
        if (!user || !user.socket) return;

        const getChatHistory = chatStore.getChatHistories(this.id);
        user.socket.send(JSON.stringify(
            chatHandler.sendSocket().CHAT_HISTORY(getChatHistory)
        ));
    }
}

export default ChatManager;