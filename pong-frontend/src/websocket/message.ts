import { socket } from "../app";
import { playerSide } from "../gameState";
import { serverState } from "../state";


export function setWebSocketMessage() {
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log('Message from server ', data);
        switch (data.message) {
            case 'CONNECT_ROOM':
                serverState.state = data.message;
                break;
            case 'MATCHED_ROOM':
                serverState.state = data.message;
                break;
            case 'GAME_ROOM': {
                serverState.state = data.message;
				playerSide.side = data.side;
			}
                break;
        }
    });
}