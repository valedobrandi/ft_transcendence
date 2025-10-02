import { renderRoute } from "./utils";

function init() {
    renderRoute(window.location.pathname);
}

window.addEventListener("popstate", () => {
    renderRoute(window.location.pathname);
  });

init();