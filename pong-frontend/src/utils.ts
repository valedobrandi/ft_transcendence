import { intraView, loginView, matchView, registerView, singInView, twoFactorAuthenticationView } from "./views";

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
