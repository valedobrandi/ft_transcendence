import { id } from "../app";
import { playerSideState } from "../context";
import type { ChatDataHistory } from "../interface/ChatHistory";
import { addIntraMessage, stateProxyHandler } from "../states/stateProxyHandler";
import { serverState } from "../states/serverState";
import { websocketNewEvents } from "./websocketNewEvents";

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
				stateProxyHandler.state = data.message;
				break;
			case 'GAME_ROOM': {
				addIntraMessage(data.payload.message);
				playerSideState.side = data.side;
				stateProxyHandler.state = data.message;

			}
				break;
			case 'TOURNAMENT_ROOM':
				serverState.state = data.message;
				stateProxyHandler.state = data.message;
				break;
			case 'GAME_OVER':
				addIntraMessage(data.payload.message);
				stateProxyHandler.state = data.message;
				break;
			case 'CONNECTED_USERS':
				//messageState.connected = data.users;
				break;
			case 'CHAT_MESSAGE':
				if ('sender' in data && 'history' in data) {
					// Get the sender id by filter out my own id
					const sender = data.sender.find((sid: number) => sid !== id.id);
					if (!sender) return;
					stateProxyHandler.messages.set(sender, data.history);
					stateProxyHandler.state = data.message;
				}
				break;
			case 'CHAT_HISTORY':
				if ('history' in data) {
					data.history.forEach(({ sender, history }: ChatDataHistory) => {
						const filteredSender = sender.find((sid: number) => sid !== id.id);
						if (filteredSender) {
							stateProxyHandler.messages.set(filteredSender, history);
						}
					});
					stateProxyHandler.state = data.message;
				}
				break;
			case 'SERVER_USERS':
				if ('users' in data) {
					stateProxyHandler.serverUsers = data.users;
				}
				break;
			case 'FRIEND_STATUS_UPDATE':
				if ('payload' in data) {
					const updateFriend = data.payload;
					const friend = stateProxyHandler.friendList.find(friend => friend.id === updateFriend.id);
					if (friend === undefined) {
						stateProxyHandler.friendList = [...stateProxyHandler.friendList, updateFriend];
						break;
					}
					friend.isConnected = updateFriend.isConnected;
					const newFriendList = stateProxyHandler.friendList.filter(friend => friend.id !== updateFriend.id);
					stateProxyHandler.friendList = [...newFriendList, friend];;
				}
				break;
			case 'event:new':
				await websocketNewEvents();
				break;
		}
	});
}