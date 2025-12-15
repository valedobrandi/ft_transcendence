import { chatHandler } from "../websockets/handles/ChatHandler.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { ChatMessage } from "../types/ChatMessage.js";
import { chatStore } from "./ChatStore.js";

class ChatManager {
    private id: number;
    private username: string;
    private blockedSet: Set<number | bigint>;

    constructor(id: number, username: string) {
        this.id = id;
        this.username = username;
        this.blockedSet = new Set();
    }

    addToBlockedUsers(blockedUsers: number[]) {
        this.blockedSet = new Set(blockedUsers);
    }

    removeFromBlockedUsers(blockedUserId: number) {
        this.blockedSet.delete(blockedUserId);
    }

    isUserBlocked(userId: number): boolean {
        return this.blockedSet.has(userId);
    }

    getConversationId(userA: string, userB: string): string {
        return [userA, userB].sort().join('-');
    }

    sendMessage(sender: number[], history: ChatMessage[] = []) {
        const send = connectedRoomInstance.getById(this.id);

        if (send && send.socket) {
            send.socket.send(JSON.stringify(
                chatHandler.controller().CHAT_MESSAGE(sender, history)
            ));
        };

    }

    sendHistory() {
        const user = connectedRoomInstance.getById(this.id);
        if (user && user.socket) {
            const getChatHistory = chatStore.getChatHistories(this.id);
            user.socket.send(JSON.stringify(
                chatHandler.controller().CHAT_HISTORY(getChatHistory)
            ));
        }
    }
}

export default ChatManager;