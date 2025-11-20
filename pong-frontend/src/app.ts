import { eventListeners } from "./events/eventListeners";
import { renderRoute } from "./utils";

// export const profile = {
// 	username: "", id: -1, email: "", avatar_url: "", twoFA_enabled: 0 as 0 | 1 
// }

export const profile: {
    username: string;
    id: number;
    email: string;
    avatar_url: string;
    twoFA_enabled: boolean | 0 | 1;
} = {
    username: "",
    id: -1,
    email: "",
    avatar_url: "",
    twoFA_enabled: 0
};

export const jwt = {token: ""};

export function init() {
    renderRoute(window.location.pathname);
    eventListeners();
}
