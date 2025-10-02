import { IntraView, MatchView } from "./views";

export function navigateTo(path: string, viewFn: (root: HTMLElement) => void) {
    history.pushState({}, "", path);
    const root = document.getElementById("root")!;
    viewFn(root);
}

const routes: Record<string, (root: HTMLElement) => void> = {
    "/match": MatchView,
    "/intra": IntraView,
};
  
export function renderRoute(path: string) {
    const root = document.getElementById("root")!;
    const view = routes[path] || IntraView;
    view(root);
}