import { socket } from "../app";
import { playerSideState } from "../context";
import { messagerState } from "../states/messagerState";
import { serverState } from "../states/serverState";

export function setWebSocketMessage() {
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
        }
    });
}