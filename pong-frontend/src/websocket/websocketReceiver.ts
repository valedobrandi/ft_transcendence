import { id } from "../app";
import { playerSideState } from "../context";
import type { ChatDataHistory } from "../interface/ChatHistory";
import { messageState } from "../states/messageState";
import { serverState } from "../states/serverState";
import { websocketNewEvents } from "./websocketNewEvents";
import { websocketChatSend } from "./websocketChatSend";
import { fetchRequest } from "../utils";

export async function websocketReceiver(socket: WebSocket) {
	socket.addEventListener('message', async (event) => {
		const data = JSON.parse(event.data);
		if (data.message != 'STATE') {
			console.log('Message from server ', data);
		}
		switch (data.message) {
			case 'CONNECT_ROOM':
				serverState.state = data.message;
				break;
			case 'MATCH_ROOM':
				serverState.state = data.message;
				messageState.state = data.message;
				break;
			case 'GAME_ROOM': {
				websocketChatSend(data.payload.message, 'INTRA', 1);
				playerSideState.side = data.side;
				messageState.state = data.message;

			}
				break;
			case 'TOURNAMENT_ROOM':
				serverState.state = data.message;
				messageState.state = data.message;
				break;
			case 'GAME_OVER':
				websocketChatSend(data.payload.message, 'INTRA', 1);
				messageState.state = data.message;
				break;
			case 'CONNECTED_USERS':
				//messageState.connected = data.users;
				break;
			case 'CHAT_MESSAGE':
				if ('sender' in data && 'history' in data) {
					// Get the sender id by filter out my own id
					const sender = data.sender.find((sid: number) => sid !== id.id);
					if (!sender) return;
					messageState.messages.set(sender, data.history);
					messageState.state = data.message;
				}
				break;
			case 'CHAT_HISTORY':
				if ('history' in data) {
					data.history.forEach(({ sender, history }: ChatDataHistory) => {
						const filteredSender = sender.find((sid: number) => sid !== id.id);
						if (filteredSender) {
							messageState.messages.set(filteredSender, history);
						}
					});
					messageState.state = data.message;
				}
				break;
			case 'SERVER_USERS':
				if ('users' in data) {
					messageState.serverUsers = data.users;
				}
				break;
			case 'FRIEND_STATUS_UPDATE':
				if ('payload' in data) {
					messageState.friendList = messageState.friendList
						.map((user) => user.id === data.payload.id
							? { ...user, isConnected: data.payload.isConnected }
							: user);
				}
				break;
			case 'event:new':
				await websocketNewEvents();
				break;
		}
	});
}