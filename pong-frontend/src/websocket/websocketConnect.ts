import { profile } from "../app";
import { setupPaddleListeners } from "../events/paddleListeners";
import { getSocket } from "../websocket";
import { websocketNewEvents } from "./websocketNewEvents";
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

export async function websocketConnect() {
	const socket = getSocket();
	if (socket === null) return;

	socket.onopen = async () => {
		socket.send(JSON.stringify({
			type: "CONNECT",
			username: profile.username,
            userId: profile.id,
		}));

		websocketReceiver(socket);


		await websocketNewEvents();


		setupPaddleListeners((up, down) => {
			if (socket.readyState !== WebSocket.OPEN) return;
			socket.send(JSON.stringify({
				type: "MOVE_PADDLE",
				username: profile.username,
                userId: profile.id,
				payload: { up, down }
			}))
		});

		socket.onclose = async () => {
			console.log(`[WEBSOCKET] Disconnected from server.`);
		};

		socket.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

	}
	await waitForSocketOpen(socket);
	return true;
};

