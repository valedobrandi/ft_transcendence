import { eventListeners } from "./events/eventListeners";
import { renderRoute } from "./utils";

export const profile = {
	username: "", id: -1, email: "", avatar_url: ""
}

export const jwt = {token: ""};

export function init() {
    renderRoute(window.location.pathname);
    eventListeners();
}
