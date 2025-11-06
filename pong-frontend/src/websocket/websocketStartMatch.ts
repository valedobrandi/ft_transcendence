import { profile } from "../app";
import { getSocket } from "../websocket";

export function websocketStartMatch() {
	const socket = getSocket();
	if (socket === null) return;

	socket.send(JSON.stringify({
		type: "PLAY",
		username: profile.username,
        userId: profile.id,
	}));
};