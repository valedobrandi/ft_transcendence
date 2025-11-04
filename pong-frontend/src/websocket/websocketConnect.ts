import { id } from "../app";
import { setupPaddleListeners } from "../events/paddleListeners";
import { getSocket } from "../websocket";
import { websocketChatSend } from "./websocketChatSend";
import { websocketReceiver } from "./websocketReceiver";

export function waitForSocketOpen(socket: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.readyState === WebSocket.OPEN) {
      resolve();
    } else {
      socket.addEventListener('open', () => resolve(), { once: true });
      socket.addEventListener('error', err => reject(err), { once: true });
    }
  });
}

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
		websocketChatSend(`Welcome ${id.username}`, 'INTRA', 1);

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