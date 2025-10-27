import { id } from "../app";
import { getSocket } from "../websocket";

export function websocketStartMatch() {
	getSocket().send(JSON.stringify({
		type: "PLAY",
		id
	}));
};