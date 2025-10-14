import { socket } from "../app";
import { playerSideState } from "../context";
import { messagerState } from "../states/messagerState";
import { serverState } from "../states/serverState";

export function setWebSocketMessage() {
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        switch (data.message) {
            case 'CONNECT_ROOM':
                serverState.state = data.message;
                break;
            case 'MATCHED_ROOM':
                serverState.state = data.message;
                break;
            case 'GAME_ROOM': {
                serverState.state = data.message;
				playerSideState.side = data.side;
			}
                break;
            case 'TOURNAMENT_ROOM':
                serverState.state = data.message;
                messagerState.state = data.message;
                break;
        }
    });
}