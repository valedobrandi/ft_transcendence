import { id } from "../app";
import { setupPaddleListeners } from "../events/paddleListeners";
import { getSocket } from "../websocket";
import { websocketReceiver } from "./websocketReceiver";

export function websocketConnect() {
	const socket = getSocket();
	if (socket === null) return;
	socket.onopen = () => {
		socket.send(JSON.stringify({
			type: "CONNECT",
			username: id.username,
            userId: id.id,
		}));
		websocketReceiver(socket);
		setupPaddleListeners((up, down) => {
			socket.send(JSON.stringify({
				type: "MOVE_PADDLE",
				username: id.username,
                userId: id.id,
				payload: { up, down }
			}))
		});
	}
};