import { guestView, intraView, loginView, matchView, registerView, singInView, twoFactorAuthenticationView } from "./views";

export function navigateTo(path: string, viewFn: (root: HTMLElement) => void) {
    history.pushState({}, "", path);
    const root = document.getElementById("root")!;
    viewFn(root);
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
    const root = document.getElementById("root")!;
    const view = routes[path] || loginView;
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