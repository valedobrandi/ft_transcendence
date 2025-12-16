import { jwt, profile } from "../app";
import { Alert } from "../components/Alert";
import {
	removeLocalStorage,
	stateProxyHandler,
} from "../states/stateProxyHandler";
import { fetchRequest, navigateTo, renderRoute } from "../utils";
import { getSocket } from "../websocket";
import { websocketNewEvents } from "../websocket/websocketNewEvents";
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
			await fetchRequest(
				`/match-cancel?matchId=${matchId}`,
				"DELETE"
			);
		}
	});

	document.addEventListener("click", async (event) => {
		const target = event.target as HTMLElement;
		const btn = target.closest("button[data-action]");
		if (!btn || !(btn instanceof HTMLButtonElement)) return;

		if (btn.id !== "") return;

		const action = btn.dataset.action;

		if (action === "accept-friend") {
			await friendInviteAccept(btn);
		}

		if (action === "deny-friend") {
			await friendInviteDeny(btn);
		}

		if (action === "accept-invitation") {
			await acceptInvite(btn);
		}

		if (action === "refuse-invitation") {
			await refuseInvite(btn);
		}

		if (action === "cancel-invitation") {
			await refuseInvite(btn);
		}

		if (action === "quitMatch") {
			fetchRequest(`/match/quitMatch`, "GET");
		}
	});

	async function friendInviteAccept(button: HTMLButtonElement) {
		console.log("[ACCEPT FRIEND CLICKED]");
		const eventId = button.dataset.eventid;
		const userId = button.dataset.userid;

		let response = await fetchRequest(
			"/add-friend",
			"POST",
			{},
			{ body: JSON.stringify({ id: userId }) }
		);

		if (response.message === "success") {
			await fetchRequest(`/delete-event?eventId=${eventId}`, "DELETE");
			await websocketNewEvents();

		}
	}

	async function friendInviteDeny(button: HTMLButtonElement) {
		const eventId = button.dataset.eventid;


		await fetchRequest(`/delete-event?eventId=${eventId}`, "DELETE");
		await websocketNewEvents();

	}

	// Add event to btn #chat-select-chat
	document.addEventListener("click", async (event) => {
		const target = event.target as HTMLButtonElement;
		const button = target.closest("button");
		if (!button) return;
		console.log("Button clicked:", button.id);

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
				stateProxyHandler.chat = { name: profile.username, id: profile.id };
			}
				break;
			case "btn-block-user": { await blockUser(); }
				break;
			case "btn-unblock-user": { await unblockUser(); }
				break;
			case "btn-invite-match": { await inviteSend(); }
				break;
			case "select-chat-btn": { selectChat(button); }
				break;
			case "btn-friend-list": { await inviteFriendList(); }
				break;
			case "tournament-btn": {
				await joinTournament();
				stateProxyHandler.settings = { state: "tournament.waiting" };
				localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));
			}
				break;
			case "btn-leave-tournament": {
				await leaveTournament(button);
				stateProxyHandler.settings = { state: "0" };
				localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));
			}
				break;
			case "match-btn": {
				stateProxyHandler.settings = { state: "game.settings" };
				localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));	
			}
				break;
			case "btn-logout": { await disconnect(); }
				break;
			case "btn-remove-friend": { removeFriend(); }
				break;
			case "go-to-match": { navigateTo('/match'); }
				break;
			case "websocket-disconnect": {
				// REDIRECT
				window.location.href = "/";
			}
				break;
			case "qr-close-button": {
				const qrModal = document.getElementById("qr-code-modal");
				if (qrModal) { qrModal.remove(); }
			}
				break;
		}
	});
}


function getSelectValue(id: string): string {
	return (document.getElementById(id) as HTMLSelectElement).value;
}

async function removeFriend() {
	await fetchRequest(
		`/friend?id=${stateProxyHandler.chat.id}`,
		"DELETE",
	);
};

async function onSendSettingsVsHuman(event: Event) {
	event.preventDefault();
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
	stateProxyHandler.settings = { state: "match.waiting" };
	localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));
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
	stateProxyHandler.settings = { state: "0" };
	localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));
}


function selectChat(button: HTMLButtonElement) {
	const chatName = button.value;
	const chatId = button.name;

	console.log("Selected chat:", chatName, chatId);

	stateProxyHandler.chat = { name: chatName, id: Number(chatId) };

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
		`/remove-block?id=${stateProxyHandler.chat.id}`,
		"DELETE",
		{}
	);

	if (response.message === "success") {
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
				id: stateProxyHandler.chat.id,
			}),
		}
	);

	if (response.message === "success") {
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
				to_id: stateProxyHandler.chat.id,
				from_id: Number(profile.id),
				type: "friend:add",
				message: "",
			}),
		}
	);

	if (response.message === "success") {
	}
};

async function joinTournament() {
	const response = await fetchRequest(
		`/tournament`,
		"POST",
		{},
		{ body: JSON.stringify({}) }
	);

	if (response.message === "error") {
		const alert = new Alert(`${response.data}`);
		alert.show();
	}
}

async function leaveTournament(button: HTMLButtonElement) {
	const eventId = button.dataset.eventindex;
	console.log("EVENT ID LEAVE TOURNEY =", eventId);
	await fetchRequest(
		`/tournament/quit`,
		"GET"
	);
}

export async function disconnect() {
	const response = await fetchRequest(`/logout`,"GET");

	if (response.message === "success") {
		localStorage.removeItem("jwt_token");
		removeLocalStorage();
		profile.username = "";
		profile.id = -1;
		profile.email = "";
		profile.avatar_url = "";
		profile.twoFA_enabled = 0;
		jwt.token = "";
		stateProxyHandler.reset();
		window.location.href = "/";
	}

}

async function acceptInvite(button: HTMLButtonElement) {
	const matchId = button.dataset.matchid;

	await fetchRequest(
		`/match-invite-accept?matchId=${matchId}`,
		"GET"
	);

}

async function refuseInvite(button: HTMLButtonElement) {
	const matchId = button.dataset.matchid;

	const response = await fetchRequest(
		`/match-invite?matchId=${matchId}`,
		"DELETE"
	);
	if (response.message === "success") {
		stateProxyHandler.settings = { state: "0" };
		localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));
	}
}

const profileOnclick = async () => {

	console.log("(opt.value === view-profile")
	try {
		const data = await fetchRequest('/profile', 'GET', {});
		console.log("DATA PROFILE = ", data);
		if (data.message === 'success') {
			profile.username = data.existUser.username;
			profile.id = data.existUser.id;
			profile.email = data.existUser.email;
			profile.avatar_url = data.existUser.avatar_url;
			profile.twoFA_enabled = data.existUser.twoFA_enabled ? 1 : 0


			console.log("PROFIL = ", profile.username);
			console.log("EMAIL IIII = ", profile.email);
			console.log("AVATAR IIII = ", profile.avatar_url);
			console.log("AVATAR IIII = ", profile.twoFA_enabled);

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

const inviteSend = async () => {
	console.log("[INVITE USER]: ", stateProxyHandler.chat.id);
	const response = await fetchRequest('/match-invite', 'POST', {}, {
		body: JSON.stringify({
			invitedId: stateProxyHandler.chat.id,
		})
	});
	if (response.message === 'success') {
		const getMatch = await fetchRequest(`/match-invite?matchId=${response.data.matchId}`, 'GET', {});
		if (getMatch.message === "success") {
			
			stateProxyHandler.invite = {
				matchId: response.data.matchId,
				id: -1,
				username: ""
			};
			localStorage.setItem("invite", JSON.stringify(stateProxyHandler.invite))

			stateProxyHandler.state = "MATCH";
			localStorage.setItem("state", JSON.stringify(stateProxyHandler.state));

			stateProxyHandler.settings = { state: "invite.sent" };
			localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));

		}
	}

}
