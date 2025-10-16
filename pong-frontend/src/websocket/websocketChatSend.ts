import { id, socket } from "../app";

export function websocketChatSend(message: string, to: string) {
    socket.send(JSON.stringify({
        type: "CHAT",
        from : id,
        to,
        message
    }));
}