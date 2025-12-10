import { removeIntraMessage } from "../states/stateProxyHandler";
import { fetchRequest } from "../utils";
import DOMPurify from 'dompurify';


function EmbeddedButton(friendId: number, text: string, eventId: string, msgId: string, action: string): string {
	const btnBg = text === "YES" ? "bg-green-500" : "bg-red-500";
	const html = `<button
					data-userid="${friendId}"
					data-msgid="${msgId}"
					data-eventid="${eventId}"
					data-action="${action}"
					class="${btnBg} text-white ml-4 p-1 rounded text-xs"
				>
					${text}
				</button>`
	const safeText = DOMPurify.sanitize(html);
	return safeText
}

async function acceptFriendOnClick(button: HTMLButtonElement) {
	//console.log("[ACCEPT FRIEND CLICKED]");
	const eventId = button.dataset.eventid;
	const userId = button.dataset.userid;
	const msgId = button.dataset.msgid;

	let response = await fetchRequest(
		"/add-friend",
		"POST",
		{},
		{ body: JSON.stringify({ id: userId }) }
	);

	if (response.message === "success") {
		response = await fetchRequest(`/delete-event?eventId=${eventId}`, "DELETE");
		if (response.message === "success") {
			removeIntraMessage(Number(msgId));
		}
	}
}

async function denyFriendOnClick(button: HTMLButtonElement) {

	const eventId = button.dataset.eventid;
	const msgId = button.dataset.msgid;

	//console.log("[DENY FRIEND CLICKED]");

	const response = await fetchRequest(`/delete-event?eventId=${eventId}`, "DELETE");
	if (response.message === "success") {
		removeIntraMessage(Number(msgId));
	}
}

export { EmbeddedButton, acceptFriendOnClick, denyFriendOnClick };