import { setupPaddleListeners } from "./events/paddleListeners";
import { renderRoute } from "./utils";
import { setWebSocketMessage } from "./websocket/message";

export const id = localStorage.getItem("id");

if (!id) {
  const newId = crypto.randomUUID();
  localStorage.setItem("id", newId);
}

export const socket = new WebSocket(`ws://localhost:3000/ws?id=${id}`);

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

window.addEventListener("popstate", () => {
    renderRoute(window.location.pathname);
});

init();
setWebSocketMessage();