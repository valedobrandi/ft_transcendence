import { id } from "../app";
import { getSocket } from "../websocket";

export function websocketChatSend(message: string, to: string) {
    getSocket().send(JSON.stringify({
        type: "CHAT",
        sender : id,
        receiver: to,
        message
    }));
}