import { socket } from "../app";
import { playerSideState } from "../context";
import { messagerState } from "../states/messagerState";
import { serverState } from "../states/serverState";

export function websocketReceiver() {
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log('Message from server ', data);
        switch (data.message) {
            case 'CONNECT_ROOM':
                serverState.state = data.message;
                break;
            case 'MATCH_ROOM':
                serverState.state = data.message;
                messagerState.state = data.message;
                break;
            case 'GAME_ROOM': {
				playerSideState.side = data.side;
                messagerState.state = data.message;
			}
                break;
            case 'TOURNAMENT_ROOM':
                serverState.state = data.message;
                messagerState.state = data.message;
                break;
            case 'GAME_OVER':
                messagerState.state = data.message;
                break;
            case 'CONNECTED_USERS':
                messagerState.connected = data.users;
                break;
            case 'CHAT_MESSAGE':
                const { from, chat } = data;
                messagerState.state = data.message;
                if (messagerState.messages.has(from) === false) {
                    messagerState.messages.set(from, []);
                }
                messagerState.messages.get(from)!.push(chat);
                messagerState.messages = new Map(messagerState.messages);
                break;
        }
    });
}