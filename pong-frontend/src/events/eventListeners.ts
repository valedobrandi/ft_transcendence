import { profile } from "../app";
import { Alert } from "../components/Alert";
import {
	acceptFriendOnClick,
	denyFriendOnClick,
} from "../components/EmbeddedButton";
import {
	newIntraMessage,
	removeIntraMessage,
	stateProxyHandler,
} from "../states/stateProxyHandler";
import { fetchRequest, renderRoute } from "../utils";
import { getSocket } from "../websocket";
import { setupPaddleListeners } from "./paddleListeners";

export function eventListeners() {
	// Skip if not in game page
	if (window.location.pathname === "/match") {
		setupPaddleListeners((up, down) => {
			const socket = getSocket();
			if (socket === null) return;
			socket.send(
				JSON.stringify({
					type: "MOVE_PADDLE",
					id: profile.id,
					payload: { up, down },
				})
			);
		});
	}

	window.addEventListener("popstate", () => {
		renderRoute(window.location.pathname);
	});

	document.addEventListener("click", async (event) => {
		const target = event.target as HTMLElement;
		const btn = target.closest("button[data-context='match-list']");
		if (!btn || !(btn instanceof HTMLButtonElement)) return;

		const action = btn.dataset.action;
		const matchId = btn.dataset.id;

		if (action === "true") {
			// Join match
			const response = await fetchRequest(
				`/match/join?matchId=${matchId}`,
				"GET"
			);
			if (response.message === "error") {
				const alert = new Alert(`${response.data}`);
				alert.show();
			}
		} else {
			// Cancel match
			const response = await fetchRequest(
				`/match-cancel?matchId=${matchId}`,
				"DELETE"
			);
			if (response.message === "error") {
				const alert = new Alert(`${response.data}`);
				alert.show();
			}
		}
	});

	document.addEventListener("click", async (event) => {
		const target = event.target as HTMLElement;
		const btn = target.closest("button[data-action]");
		if (!btn || !(btn instanceof HTMLButtonElement)) return;

		if (btn.id !== "") return;

		const action = btn.dataset.action;

		if (action === "accept") {
			await acceptFriendOnClick(btn);
		}

		if (action === "decline") {
			await denyFriendOnClick(btn);
		}
	});

	// Add event to btn #chat-select-chat
	document.addEventListener("click", async (event) => {
		const target = event.target as HTMLButtonElement;
		const button = target.closest("button");
		if (!button) return;
		console.log("Button clicked:", button.id);

		switch (button.id) {
			case "accept-match-invite": {
				await onClickAcceptMatchInvite(button);
			}
				break;
			case "btn-block-user":
				{
					const response = await fetchRequest(
						`/add-block`,
						"POST",
						{},
						{
							body: JSON.stringify({
								id: stateProxyHandler.selectChat.id,
							}),
						}
					);

					if (response.message === "success") {
						newIntraMessage(
							`User ${stateProxyHandler.selectChat.name} has been blocked.`
						);
						await fetchRequest("/block-list", "GET", {}).then((data) => {
							if (data.message === "success") {
								stateProxyHandler.chatBlockList = data.payload;
							}
						});
					}
				}
				break;
			case "btn-unblock-user":
				{
					const response = await fetchRequest(
						`/remove-block?id=${stateProxyHandler.selectChat.id}`,
						"DELETE",
						{}
					);

					if (response.message === "success") {
						newIntraMessage(
							`User ${stateProxyHandler.selectChat.name} has been unblocked.`
						);
						await fetchRequest("/block-list", "GET", {}).then((data) => {
							if (data.message === "success") {
								stateProxyHandler.chatBlockList = data.payload;
							}
						});
					}
				}
				break;
			case "select-chat-btn":
				{
					const chatName = button.value;
					const chatId = button.name;

					console.log("Selected chat:", chatName, chatId);
					stateProxyHandler.selectChat = { name: chatName, id: Number(chatId) };
					const buttons = document.querySelectorAll("#select-chat-btn");
					buttons.forEach((button) => {
						button.classList.remove("bg-gray-100");
					});
					Array.from(document.getElementsByClassName(chatName)).forEach(
						(elem) => {
							elem.classList.add("bg-gray-100");
						}
					);
				}
				break;
			case "cancel-match-invite": {
				await onClickCancelMatchInvite(button);
			}
				break;
			case "btn-friend-list":
				{
					var response = await fetchRequest(
						`/add-event`,
						"POST",
						{},
						{
							body: JSON.stringify({
								to_id: stateProxyHandler.selectChat.id,
								from_id: Number(profile.id),
								type: "friend:add",
								message: "",
							}),
						}
					);

					if (response.message === "success") {
						newIntraMessage(
							`Friend request sent to ${stateProxyHandler.selectChat.name}`
						);
					}
				}
				break;
			case "tournament-btn": {
					await joinTournament();
				}
				break;
		}
	});
}

async function joinTournament() {
	const response = await fetchRequest(
		`/tournament/join`,
		"GET"
	);

	if (response.message === "error") {
		const alert = new Alert(`${response.data}`);
		alert.show();
	}
}

async function onClickAcceptMatchInvite(button: HTMLButtonElement) {
	const eventId = button.dataset.eventid;
	const userId = button.dataset.userid;

	const response = await fetchRequest(
		`/match-invite-accept?matchId=${userId}`,
		"GET"
	);
	if (response.message === "success") {
		removeIntraMessage(Number(eventId));
	}
}

async function onClickCancelMatchInvite(button: HTMLButtonElement) {
	const eventId = button.dataset.eventid;
	const userId = button.dataset.userid;

	const response = await fetchRequest(
		`/match-invite?matchId=${userId}`,
		"DELETE"
	);
	if (response.message === "success") {
		removeIntraMessage(Number(eventId));
	}
}

