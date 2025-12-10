import { profile } from "../app";
import { Alert } from "../components/Alert";
import {
	acceptFriendOnClick,
	denyFriendOnClick,
	EmbeddedButton,
} from "../components/EmbeddedButton";
import {
	newIntraMessage,
	removeIntraMessage,
	stateProxyHandler,
	updateIntraMessage,
} from "../states/stateProxyHandler";
import { fetchRequest, navigateTo, renderRoute } from "../utils";
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

		if (action === "accept-friend") {
			await acceptFriendOnClick(btn);
		}

		if (action === "deny-friend") {
			await denyFriendOnClick(btn);
		}

		if (action === "accept-match-invite") {
			await onClickAcceptMatchInvite(btn);
		}

		if (action === "cancel-match-invite") {
			await onClickCancelMatchInvite(btn);
		}
	});

	// Add event to btn #chat-select-chat
	document.addEventListener("click", async (event) => {
		const target = event.target as HTMLButtonElement;
		const button = target.closest("button");
		if (!button) return;
		//console.log("Button clicked:", button.id);

		switch (button.id) {
			case "save-settings": { await onSendSettingsVsHuman(event); }
				break;
			case "save-settings-computer": { await onSendSettingsVsComputer(event); }
				break;
			case "cancel-settings": { onCancelSettings(event); }
				break;
			case "update-profile": { await profileOnclick(); }
				break;
			case "view-profile": {
				stateProxyHandler.selectChat = { name: profile.username, id: profile.id };
			}
				break;
			case "btn-block-user": { await blockUser(); }
				break;
			case "btn-unblock-user": { await unblockUser(); }
				break;
			case "btn-invite-match": { await inviteToMatch(); }
				break;
			case "select-chat-btn": { selectChat(button); }
				break;
			case "btn-friend-list": { await inviteFriendList(); }
				break;
			case "tournament-btn": { await joinTournament(); }
				break;
			case "btn-leave-tournament": { await leaveTournament(button); }
				break;
			case "match-btn": {
				const socket = getSocket();
				if (!socket) return;
				socket.send(JSON.stringify({ type: 'MATCH', username: profile.username, userId: profile.id }));
			}
				break;
			case "create-match-btn": {
				stateProxyHandler.settings = { state: '1' };
			}
				break;
			case "btn-logout": { await joinLogout(); }
				break;
			case "btn-remove-friend": { removeFriend(); }
				break;
		}
	});
}

function getSelectValue(id: string): string {
	return (document.getElementById(id) as HTMLSelectElement).value;
}

async function removeFriend() {
	const response = await fetchRequest(
		`/friend?id=${stateProxyHandler.selectChat.id}`,
		"DELETE",
	);

	if (response.message === "success") {
		newIntraMessage(
			`User ${stateProxyHandler.selectChat.name} has been removed from your friend list.`
		);
	}
};

async function onSendSettingsVsHuman(event: Event) {
	event.preventDefault();

	const settingsContainer = document.getElementById("settings-container");

	const formData = document.getElementById("settings-form") as HTMLFormElement;
	if (!formData) return;

	const gameSetting = {
		settings: {
			ball: {
				speed: getSelectValue("BALL SPEED"),
				size: getSelectValue("BALL SIZE"),
			},
			paddle: {
				size: getSelectValue("PADDLE SIZE"),
				speed: getSelectValue("PADDLE SPEED"),
			},
			score: getSelectValue("MATCH POINTS"),
			IA: false
		}
	};

	await fetchRequest("/match-create", "POST", {}, {
		body: JSON.stringify(gameSetting)
	});

	if (settingsContainer) {
		settingsContainer.remove();
	}
}

async function onSendSettingsVsComputer(event: Event) {
	event.preventDefault();

	const settingsContainer = document.getElementById("settings-container");

	const formData = document.getElementById("settings-form") as HTMLFormElement;
	if (!formData) return;

	const gameSetting = {
		settings: {
			ball: {
				speed: getSelectValue("BALL SPEED"),
				size: getSelectValue("BALL SIZE"),
			},
			paddle: {
				size: getSelectValue("PADDLE SIZE"),
				speed: getSelectValue("PADDLE SPEED"),
			},
			score: getSelectValue("MATCH POINTS"),
			IA: true
		}
	};

	await fetchRequest("/match-create", "POST", {}, {
		body: JSON.stringify(gameSetting)
	});

	if (settingsContainer) {
		settingsContainer.remove();
	}
}

function onCancelSettings(event: Event) {
	event.preventDefault();
	stateProxyHandler.settings = { state: '0' };
}


function selectChat(button: HTMLButtonElement) {
	const chatName = button.value;
	const chatId = button.name;

	//console.log("Selected chat:", chatName, chatId);

	stateProxyHandler.selectChat = { name: chatName, id: Number(chatId) };

	const buttons = document.querySelectorAll("#select-chat-btn");
	buttons.forEach((button) => {
		button.classList.remove("bg-gray-700");
	});
	Array.from(document.getElementsByClassName(chatName)).forEach(
		(elem) => {
			elem.classList.add("bg-[#424549]");
		}
	);
}

async function unblockUser() {
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

async function blockUser() {
	var response = await fetchRequest(
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
};

async function inviteFriendList() {
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
};

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

async function leaveTournament(button: HTMLButtonElement) {
	const eventId = button.dataset.eventindex;
	//console.log("EVENT ID LEAVE TOURNEY =", eventId);
	const response = await fetchRequest(
		`/tournament/quit`,
		"GET"
	);

	if (response.message === "success") {
		newIntraMessage(`You have left the tournament room.`);
		removeIntraMessage(Number(eventId));
	}
}

async function joinLogout() {
	const response = await fetchRequest(
		`/logout`,
		"GET"
	);
	if (response.message === "success") {
		navigateTo('/');
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
	const idx = button.dataset.eventid;
	const userId = button.dataset.userid;

	const response = await fetchRequest(
		`/match-invite?matchId=${userId}`,
		"DELETE"
	);
	if (response.message === "success") {
		removeIntraMessage(Number(idx));
	}
}

const profileOnclick = async () => {

	//console.log("(opt.value === view-profile")
	try {
		const data = await fetchRequest('/profile', 'GET', {});
		//console.log("DATA PROFILE = ", data);
		if (data.message === 'success') {
			profile.username = data.existUser.username;
			profile.id = data.existUser.id;
			profile.email = data.existUser.email;
			profile.avatar_url = data.existUser.avatar_url;
			profile.twoFA_enabled = data.existUser.twoFA_enabled ? 1 : 0


			//console.log("PROFIL = ", profile.username);
			//console.log("EMAIL IIII = ", profile.email);
			//console.log("AVATAR IIII = ", profile.avatar_url);
			//console.log("AVATAR IIII = ", profile.twoFA_enabled);

			navigateTo("/profile");
		}
		else {
			console.error("Erreur lors du chargement du profil :", data);
		}
	}
	catch (err) {
		console.error("Erreur réseau :", err);
	}

}

const inviteToMatch = async () => {
	//console.log("[INVITE USER]: ", stateProxyHandler.selectChat.id);
	const response = await fetchRequest('/match-invite', 'POST', {}, {
		body: JSON.stringify({
			invitedId: stateProxyHandler.selectChat.id,
		})
	});
	if (response.message === 'success') {
		const getMatch = await fetchRequest(`/match-invite?matchId=${response.data.matchId}`, 'GET', {});
		if (getMatch.message === "success") {
			const getTo = stateProxyHandler.serverUsers.find(user => user.id === Number(getMatch.data.to))
			const idx = newIntraMessage("");
			updateIntraMessage(idx, `Invite sent to ${getTo?.name} 
				${EmbeddedButton(getMatch.data.matchId, 'CANCEL', `${idx}`, 'cancel-match-invite', "cancel-match-invite")}`);
			stateProxyHandler.state = "SEND_INVITE"
		}
	} else if (response.message = 'error') {
		newIntraMessage(response.data);
	}
}