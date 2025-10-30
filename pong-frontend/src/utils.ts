import { id } from "./app";
import { CreateAlert } from "./components/CreateAlert";
import { guestView, intraView, loginView, matchView, registerView, singInView, twoFactorAuthenticationView } from "./views";

export function navigateTo(path: string) {
    history.pushState({}, "", path);
    renderRoute(path);
}

const routes: Record<string, (root: HTMLElement) => void> = {
    "/match": matchView,
    "/intra": intraView,
    "/login": loginView,
    "/sing-in": singInView,
    "/register": registerView,
    "/guest": guestView,
    "/auth": twoFactorAuthenticationView
};

export function renderRoute(path: string) {
    const protectedRoutes = ["/match", "/intra"];

    console.log(`username: ${id.username}`);
    const root = document.getElementById("root")!;
    const view = routes[path] || loginView;

    if (protectedRoutes.includes(path) && id.username === "") {
        navigateTo("/login");
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
    endpoint: string,
	method: string,
    headers: Record<string, string>,
    options: Record<string, string> = {}) {

    const url = `http://${endpoint}`;
    const defaultHeaders = {
        'Content-Type': 'application/json',
        // Add auth token
        // 'Authorization': `Bearer ${token}`,
    };

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

        return await response.json();
    } catch (err) {
        console.error(`Fetch error on ${endpoint}:`, err);
        throw err;
    }
}