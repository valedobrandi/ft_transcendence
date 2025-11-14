import { profile } from "../app";
import { messageState } from "../states/messageState";
import { renderRoute } from "../utils";
import { getSocket } from "../websocket";
import { setupPaddleListeners } from "./paddleListeners";

export function globalEventListeners() {
	setupPaddleListeners((up, down) => {
		const socket = getSocket();
		if (socket === null) return;
		socket.send(JSON.stringify({
			type: "MOVE_PADDLE",
			id: profile,
			payload: { up, down }
		}))
	});

	window.addEventListener("popstate", () => {
		renderRoute(window.location.pathname);
	});

	// Add event to btn #chat-select-chat
	document.addEventListener("click", (event) => {
		const target = event.target as HTMLButtonElement;

		if (target.tagName === "BUTTON" && target.id.startsWith("chat-select-")) {
			const chatName = target.value;
			const chatId = target.name;
			console.log("Selected chat:", chatName, chatId);
			messageState.selectChat = { name: chatName, id: Number(chatId) };
			const buttons = document.querySelectorAll("[id^='chat-select-']");
			buttons.forEach(button => {
				button.classList.remove("bg-gray-100");
			});
			Array.from(document.getElementsByClassName(chatName)).forEach((elem) => {
				elem.classList.add("bg-gray-100");
			});
		}
	});

}
