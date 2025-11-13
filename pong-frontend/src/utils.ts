import { id, jwt } from "./app";
import { CreateAlert } from "./components/CreateAlert";
import { endpoint } from "./endPoints";
import { guestView, intraView, loginView, matchView, registerView, defaultView, twoFactorAuthenticationView } from "./views";

export function navigateTo(path: string) {
    history.pushState({}, "", path);
    renderRoute(path);
}

const routes: Record<string, (root: HTMLElement) => void> = {
    "/match": matchView,
    "/intra": intraView,
    "/": defaultView,
    "/login": loginView,
    "/register": registerView,
    "/guest": guestView,
    "/auth": twoFactorAuthenticationView
};

export function renderRoute(path: string) {
    const protectedRoutes = ["/match", "/intra"];

    console.log(`username: ${id.username}`);
    const root = document.getElementById("root")!;
    const view = routes[path] || defaultView;

    if (protectedRoutes.includes(path) && id.username === "") {
        navigateTo("/");
        const alertBox = CreateAlert("You must be logged in to access this page.", "error");
        const viewContainer = document.getElementById("view-container");
        if (viewContainer) {
            viewContainer.prepend(alertBox);
        }
        return;
    }
    view(root);
}

export function setTime(ms: number, func: () => void): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => { func(); resolve(); }, ms);
    });
}

export async function fetchRequest(
    path: string,
	method: string,
    headers: Record<string, string> = {},
    options: RequestInit = {}) {

    const url = `${endpoint.pong_backend_api}${path}`;
    const defaultHeaders:Record<string, string> = {
        // Add auth token
        'Authorization': `Bearer ${jwt.token}`,
    };
    if (method === 'POST' || method === 'PUT') {
        defaultHeaders['Content-Type'] = 'application/json';
    }
    console.log(`[REQUEST] ${method} ${url} with options:`, options);
    try {
        const response = await fetch(url, {
            method: method,
            headers: { ...defaultHeaders, ...headers },
            ...options,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API error');
        }
        const data = await response.json();
        console.log(`[RESPONSE] ${method} ${url} response:`, data);
        return data;
    } catch (err) {
        console.error(`Fetch error on ${endpoint}:`, err);
        throw err;
    }
}