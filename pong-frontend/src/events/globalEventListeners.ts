import { id } from "../app";
import { messagerState } from "../states/messagerState";
import { renderRoute } from "../utils";
import { getSocket } from "../websocket";
import { setupPaddleListeners } from "./paddleListeners";

export function globalEventListeners() {
    setupPaddleListeners((up, down) => {
        const socket = getSocket();
        if (socket === null) return;
        socket.send(JSON.stringify({
            type: "MOVE_PADDLE",
            id: id,
            payload: { up, down }
        }))
    });

    window.addEventListener("popstate", () => {
        renderRoute(window.location.pathname);
    });

    // Add event to btn #chat-select-chat
    document.addEventListener("click", (event) => {
        const target = event.target as HTMLButtonElement;
        if (target.tagName === "BUTTON" && target.id === "chat-select") {
            const chatName = target.value;
            const chatId = target.name;
            console.log("Selected chat:", chatName, chatId);
            messagerState.selectChat = { name: chatName, id: Number(chatId) };
			const buttons = document.querySelectorAll("#chat-select");
				buttons.forEach(button => {
					button.classList.remove("bg-blue-300");
				});
				Array.from(document.getElementsByClassName( chatName)).forEach((elem) => {
					elem.classList.add("bg-blue-300");
				});
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