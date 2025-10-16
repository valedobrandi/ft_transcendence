import { messagerState, playLinkHandler } from "../states/messagerState";
import { renderRoute } from "../utils";
import { websocketChatSend } from "../websocket/websocketChatSend";

export function globalEventListeners() {
    document.addEventListener('click', playLinkHandler);

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
            const toSend = parent.id;
            switch (action) {
                case "send-message":
                    websocketChatSend("", toSend);
                    break;
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