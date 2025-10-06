import { renderRoute } from "./utils";
import { setWebSocketMessage } from "./websocket/message";

export const id = localStorage.getItem("id");

if (!id) {
  const newId = crypto.randomUUID();
  localStorage.setItem("id", newId);
}

export const socket = new WebSocket(`ws://localhost:3000/ws?id=${id}`);

function init() {
    renderRoute(window.location.pathname);
}

window.addEventListener("popstate", () => {
    renderRoute(window.location.pathname);
});

init();
setWebSocketMessage();