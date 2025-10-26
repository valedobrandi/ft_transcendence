import { id } from "../app";
import { messagerState } from "../states/messagerState";
import { renderRoute } from "../utils";
import { getSocket } from "../websocket";
import { setupPaddleListeners } from "./paddleListeners";

export function globalEventListeners() {

    setupPaddleListeners((up, down) => {
        getSocket().send(JSON.stringify({
            type: "MOVE_PADDLE",
            id: id,
            payload: {up, down}
        }))
    });

    window.addEventListener("popstate", () => {
        renderRoute(window.location.pathname);
    });

    // Add event to btn #chat-select-chat
    document.addEventListener("click", (event) => {
        const target = event.target as HTMLButtonElement;
        if (target.tagName === "BUTTON" && target.id === "chat-select-chat") {
            const chatId = target.value;
            messagerState.selectChat = chatId;
        }
    });

    document.addEventListener("change", (event) => {
        const target = event.target as HTMLSelectElement;

        if (target.tagName === "SELECT" && target.id === "user-actions") {
            const action = target.value;
            const parent = target.closest("p");
            if (!parent) return;
            switch (action) {
                case "view-profile":
                    break;
                case "add-friend":
                    break;
                case "block-user":
                    break;
                case "invite-user":
                    break;

            }
            target.value = "select-action";
        }
    });
}