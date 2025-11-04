import { id } from "../app";
import { getSocket } from "../websocket";

/* type: 'CHAT';
    senderId: number;
    sender: string;
    receiverId: number;
    receiver: string;
    message: string; */

export function websocketChatSend(message: string, to: string, toId: number) {
    const socket = getSocket();
    if (socket === null) return;
    socket.send(JSON.stringify({
        type: "CHAT",
        sender: id.username,
        senderId: id.id,
        receiverId: toId,
        receiver: to,
        message
    }));
}