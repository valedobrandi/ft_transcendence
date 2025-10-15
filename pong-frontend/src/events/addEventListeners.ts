import { playLinkHandler } from "../states/messagerState";
import { renderRoute } from "../utils";

export function addGlobalEventListeners() {
    document.addEventListener('click', playLinkHandler);

    window.addEventListener("popstate", () => {
        renderRoute(window.location.pathname);
    });
}