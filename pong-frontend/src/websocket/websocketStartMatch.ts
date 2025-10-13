import { socket, id } from "../app";

export function websocketStartMatch() {
	socket.send(JSON.stringify({
		type: "PLAY",
		id
	}));
};