import { newIntraMessage, onStateChange, stateProxyHandler, updateIntraMessage } from "../states/stateProxyHandler";
import { profile } from "../app";
import { fetchRequest, navigateTo } from "../utils";
import { EmbeddedButton } from "./EmbeddedButton";

export function ChatHeader(): HTMLDivElement {

	const chatMenu = document.createElement("div");
	chatMenu.id = "chat-menu";
	chatMenu.className = "flex border-b bg-gray-100 h-10";

	const options = [
		{ value: "view-profile", text: "View Profile" },
		{ value: "friend-list", text: "add a friend" },
		{ value: "block-user", text: "Block User" },
		{ value: "invite-user", text: "Invite to Game" }
	]

	function onRender() {
		chatMenu.innerHTML = "";
		options.forEach(opt => {
			const btn = document.createElement("button");
			btn.className = `px-4 py-2 bg-gray-200 hover:bg-gray-300
			 uppercase w-full text-xs min-w-32 rounded cursor-pointer focus:outline-none`;
			btn.id = `btn-${opt.value}`;
			btn.value = opt.value;
			btn.textContent = opt.text;

			if (opt.value === "block-user") {
				const isBlocked = stateProxyHandler.chatBlockList?.includes(stateProxyHandler.selectChat?.id || -1);
				setButtonToUnblockState(btn);
				if (isBlocked) {
					setButtonToBlockState(btn);
				}
			}

			if (opt.value === "friend-list") {
				btn.classList.remove("opacity-50", "cursor-not-allowed");
				btn.setAttribute("disable", "false");
				const isFriend = stateProxyHandler.friendList?.some(friend => friend.id === stateProxyHandler.selectChat?.id);
				if (isFriend) {
					btn.classList.add("opacity-50", "cursor-not-allowed");
					btn.setAttribute("disabled", "true");
				}
			}

			if (opt.value === "view-profile") {
				btn.onclick = profileOnclick;
			}

			if (opt.value === "invite-user") {
				btn.onclick = inviteUserOnclick;
			}

			chatMenu.appendChild(btn);
		})
	}

	onRender();
	onStateChange("chatBlockList", onRender);
	onStateChange("selectChat", onRender);
	return chatMenu;
}

export function setButtonToBlockState(button: HTMLButtonElement) {
	button.setAttribute("id", "btn-unblock-user");
	button.classList.add("text-red-500");
	button.textContent = "UNBLOCK USER";
}

export function setButtonToUnblockState(button: HTMLButtonElement) {
	button.setAttribute("id", "btn-block-user");
	button.classList.remove("text-red-500");
	button.textContent = "BLOCK USER";
}

const inviteUserOnclick = async () => {
	//console.log("[INVITE USER]: ", stateProxyHandler.selectChat.id);
	const response = await fetchRequest('/match-invite', 'POST', {}, {
		body: JSON.stringify({
			invitedId: stateProxyHandler.selectChat.id,
			settings: {
				mode: "NORMAL",
				ballSpeed: "MEDIUM",
				paddleSize: "MEDIUM"
			}
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