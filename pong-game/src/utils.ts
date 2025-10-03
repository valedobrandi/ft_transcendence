import { IntraView, LoginView, MatchView, RegisterView, SingInView, twoFactorAuthenticationView } from "./views";

export function navigateTo(path: string, viewFn: (root: HTMLElement) => void) {
    history.pushState({}, "", path);
    const root = document.getElementById("root")!;
    viewFn(root);
}

const routes: Record<string, (root: HTMLElement) => void> = {
    "/match": MatchView,
    "/intra": IntraView,
	"/login": LoginView,
	"/sing-in": SingInView,
	"/register": RegisterView,
	"/twoFactorAuthentication": twoFactorAuthenticationView
};

export function renderRoute(path: string) {
    const root = document.getElementById("root")!;
    const view = routes[path] || LoginView;
    view(root);
}