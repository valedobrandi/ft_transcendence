import { profile } from "../app";
import { setupPaddleListeners } from "../events/paddleListeners";
import { newIntraMessage } from "../states/stateProxyHandler";
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
		
		newIntraMessage(`${profile.username} connected.`);

		await websocketNewEvents();


		setupPaddleListeners((up, down) => {
			socket.send(JSON.stringify({
				type: "MOVE_PADDLE",
				username: profile.username,
                userId: profile.id,
				payload: { up, down }
			}))
		});

	}
	await waitForSocketOpen(socket);
	return true;
};

