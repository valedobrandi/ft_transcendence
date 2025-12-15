import { profile } from "../app";
import { getSocket } from "../websocket";


export function websocketChatSend(message: string, to: string, toId: number) {
    const socket = getSocket();
    if (socket === null) return;
    socket.send(JSON.stringify({
        type: "CHAT",
        sender: profile.username,
        senderId: profile.id,
        receiverId: toId,
        receiver: to,
        message
    }));
}