import { id } from "../app";
import { setupPaddleListeners } from "../events/paddleListeners";
import { addIntraMessage, messageState } from "../states/messageState";
import { fetchRequest } from "../utils";
import { getSocket } from "../websocket";
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
			username: id.username,
            user_id: id.id,
		}));

		websocketReceiver(socket);
		addIntraMessage(`${id.username} connected.`);

		const {status, data} = await fetchRequest('/to-events', 'GET')
		if (status === 'success') {
			for (const event of data) {
				const { type, from_id, id: eventId } = event;
				switch (type) {
					case 'friend:add':
						const getSender = messageState.serverUsers
							.find(({ id }) => Number(id) === Number(from_id))
						if (getSender === undefined) break;
						addIntraMessage(
							`${getSender.name} has send a friend request
								${btnLink(getSender.id, "YES", eventId)}
								${btnLink(getSender.id, "NO", eventId)}`
						);
						break;
				}
			}
		}


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

function btnLink(friendId: number, text: string, eventId: number): string {
	const btnBg = text === "YES" ? "bg-green-500" : "bg-red-500";
    return (
        `<button
			id="accept-friend-request"
			name="${friendId}"
			eventid="${eventId}"
			class="${btnBg} text-white ml-4 p-1 rounded text-xs"
		>
			${text}
		</button>`
    )
}