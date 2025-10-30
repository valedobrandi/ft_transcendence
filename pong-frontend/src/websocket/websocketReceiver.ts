import { playerSideState } from "../context";
import { addMessage, messagerState } from "../states/messagerState";
import { serverState } from "../states/serverState";

export function websocketReceiver(socket: WebSocket) {
	socket.addEventListener('message', (event) => {
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
				messagerState.state = data.message;
				break;
			case 'GAME_ROOM': {
				addMessage('INTRA', data.payload.message);
				playerSideState.side = data.side;
				messagerState.state = data.message;

			}
				break;
			case 'TOURNAMENT_ROOM':
				serverState.state = data.message;
				messagerState.state = data.message;
				break;
			case 'GAME_OVER':
				addMessage('INTRA', data.payload.message);
				messagerState.state = data.message;
				break;
			case 'CONNECTED_USERS':
				messagerState.connected = data.users;
				break;
			case 'CHAT_MESSAGE':
				const { receiver, chat, sender } = data;
				addMessage(receiver, chat, sender);
				break;
		}
	});


}