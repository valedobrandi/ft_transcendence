import { id } from "../app";
import { getSocket } from "../websocket";

export function websocketChatSend(message: string, to: string) {
	const socket = getSocket();
	if (socket === null) return;
    socket.send(JSON.stringify({
        type: "CHAT",
        sender : id.username,
        receiver: to,
        message
    }));
}