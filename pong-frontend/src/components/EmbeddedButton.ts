import { removeIntraMessage } from "../states/stateProxyHandler";
import { fetchRequest } from "../utils";

function EmbeddedButton(friendId: number, text: string, eventId: string, id: string): string {
    const btnBg = text === "YES" ? "bg-green-500" : "bg-red-500";
    return (
        `<button
			id="${id}"
			data-userid="${friendId}"
			data-eventid="${eventId}"
			data-action="${text === "YES" ? "accept" : "decline"}"
			class="${btnBg} text-white ml-4 p-1 rounded text-xs"
		>
			${text}
		</button>`
    )
}

async function acceptFriendOnClick(button: HTMLButtonElement) {
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
	  response = await fetchRequest(`/delete-event?eventId=${eventId}`, "DELETE");
	  if (response.message === "success") {
		removeIntraMessage(Number(eventId));
	  }
	}
  }

  async function denyFriendOnClick(button: HTMLButtonElement) {

    const eventId = button.dataset.eventid;

    const response = await fetchRequest(`/delete-event?eventId=${eventId}`, "DELETE");
    if (response.message === "success") {
      removeIntraMessage(Number(eventId));
    }
  }

export { EmbeddedButton, acceptFriendOnClick, denyFriendOnClick };