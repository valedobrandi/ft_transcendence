import { globalEventListeners } from "./events/globalEventListeners";
import { renderRoute } from "./utils";

export const id = {
	username: "", id: -1
}

export function init() {
    renderRoute(window.location.pathname);
    globalEventListeners();
}
