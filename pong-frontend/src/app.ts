import { globalEventListeners } from "./events/globalEventListeners";
import { renderRoute } from "./utils";

export const profile = {
	username: "", id: -1, email: ""
}

export const jwt = {token: ""};

export function init() {
    renderRoute(window.location.pathname);
    globalEventListeners();
}
