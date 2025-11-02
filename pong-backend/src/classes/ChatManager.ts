import { chatHandler } from "../sockets/handles/CHAT.js";
import { connectedRoomInstance } from "../state/connectedRoom.js";
import { ChatHistory } from "../types/ChatHistory.js";

class ChatManager {

    constructor(public userId: string) { }

    getConversationId(userA: string, userB: string): string {
        return [userA, userB].sort().join('-');
    }

    sendMessage(receiver: string, message: string, sender: string, history: ChatHistory[] = []) {
        const send = connectedRoomInstance.getById(this.userId);

        if (send && send.socket) {
            send.socket.send(JSON.stringify(
                chatHandler.sendSocket().CHAT_MESSAGE(receiver, message, sender, history)
            ));
        };

    }
}

export default ChatManager;