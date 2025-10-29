import { id } from "../app";
import { getSocket } from "../websocket";

export function websocketStartMatch() {
	const socket = getSocket();
	if (socket === null) return;

	socket.send(JSON.stringify({
		type: "PLAY",
		usernamer: id.username
	}));
};