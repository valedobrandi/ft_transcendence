import { profile } from "../app";
import { playerSideState } from "../context";
import type { ChatDataHistory } from "../interface/ChatHistory";
import { deleteIntraMessage, newIntraMessage, stateProxyHandler } from "../states/stateProxyHandler";
import { serverState } from "../states/serverState";
import { websocketNewEvents } from "./websocketNewEvents";
import { navigateTo, setTime } from "../utils";
import { EmbedButton } from "../components/EmbebedButton";

export async function websocketReceiver(socket: WebSocket) {
	socket.addEventListener('message', async (event) => {
		const data = JSON.parse(event.data);
		if (data.message != 'STATE') {
			console.log('[WEBSOCKET RECEIVER] ', data);
		}
		switch (data.message) {
			case 'CONNECT_ROOM':
				serverState.state = data.message;
				stateProxyHandler.state = data.message;
				break;
			case 'MATCH_ROOM':
				serverState.state = data.message;
				newIntraMessage(`You have joined the match room.`);
				break;
			case 'GAME_ROOM': {
				newIntraMessage(data.payload.message);
				playerSideState.side = data.side;
				setTime(5000, () => {
					navigateTo("/match");
				});
			}
				break;
			case 'TOURNAMENT_ROOM':
				serverState.state = data.message;
				newIntraMessage(`You have joined the tournament room.`);
				break;
			case 'GAME_OVER':
				newIntraMessage(data.payload.message);
				stateProxyHandler.state = data.message;
				break;
			case 'CONNECTED_USERS':
				//messageState.connected = data.users;
				break;
			case 'CHAT_MESSAGE':
				if ('sender' in data && 'history' in data) {
					// Get the sender id by filter out my own id
					const sender = data.sender.find((sid: number) => sid !== profile.id);
					if (!sender) return;
					stateProxyHandler.messages.set(sender, data.history);
					stateProxyHandler.state = data.message;
				}
				break;
			case 'CHAT_HISTORY':
				if ('history' in data) {
					data.history.forEach(({ sender, history }: ChatDataHistory) => {
						const filteredSender = sender.find((sid: number) => sid !== profile.id);
						if (filteredSender) {
							stateProxyHandler.messages.set(filteredSender, history);
						}
					});
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
			case 'MATCH_INVITE':
				var getName = stateProxyHandler.serverUsers.find(user => user.id === data.payload.from)?.name;
				newIntraMessage(`You have received a game invite from ${getName}.
				${EmbedButton(0, "YES", data.payload.matchId, "accept-match-invite")} 
				${EmbedButton(0, "NO", data.payload.matchId, "decline-match-invite")}`);
				stateProxyHandler.state = "MATCH_INVITE";
				break;
			case 'MATCH_DECLINED':
				getName = stateProxyHandler.serverUsers.find(user => user.id === data.payload.from)?.name;
				newIntraMessage(`invitation canceled by ${getName}`)
				const idx = stateProxyHandler.systemMessages.findIndex(
					msg => msg.message.includes(`${data.payload.matchId}"`)
				);
				if (idx !== -1) {
					deleteIntraMessage(idx);
				}
				stateProxyHandler.state = "CONNECT_ROOM";
		}
	});
}