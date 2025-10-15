import { addGlobalEventListeners } from "./events/addEventListeners";
import { setupPaddleListeners } from "./events/paddleListeners";
import { addMessage } from "./states/messagerState";
import { renderRoute } from "./utils";
import { setWebSocketMessage } from "./websocket/setWebSocketMessage";

export const id = crypto.randomUUID();

export const socket = new WebSocket(`ws://localhost:3000/ws?id=${id}`);

addMessage("INTRA", `Welcome: ${id}`);

setupPaddleListeners((up, down) => {
	socket.send(JSON.stringify({
		type: "MOVE_PADDLE",
		id,
		payload: {up, down}
	}));
});

function init() {
    renderRoute(window.location.pathname);
}

init();
setWebSocketMessage();
addGlobalEventListeners();