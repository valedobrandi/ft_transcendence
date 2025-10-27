import { globalEventListeners } from "./events/globalEventListeners";
import { addMessage } from "./states/messagerState";
import { renderRoute } from "./utils";
import { initSocket } from "./websocket";
import { websocketReceiver } from "./websocket/websocketReceiver";

export const id = crypto.randomUUID();

export const VITE_BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST;

export function init() {
    initSocket(VITE_BACKEND_HOST, id);
    renderRoute(window.location.pathname);
    websocketReceiver();
    globalEventListeners();
    addMessage("INTRA", `Welcome: ${id}`);
}
