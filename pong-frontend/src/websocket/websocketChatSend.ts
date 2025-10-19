import { id, socket } from "../app";

export function websocketChatSend(message: string, to: string) {
    socket.send(JSON.stringify({
        type: "CHAT",
        sender : id,
        receiver: to,
        message
    }));
}