import { id } from "../app";
import { addIntraMessage, deleteIntraMessage, messageState } from "../states/messageState";
import { fetchRequest, renderRoute } from "../utils";
import { getSocket } from "../websocket";
import { setupPaddleListeners } from "./paddleListeners";

export function globalEventListeners() {
  // Skip if not in game page
  if (window.location.pathname === "/match") {
    setupPaddleListeners((up, down) => {
      const socket = getSocket();
      if (socket === null) return;
      socket.send(
        JSON.stringify({
          type: "MOVE_PADDLE",
          id: id,
          payload: { up, down },
        })
      );
    });
  }

  window.addEventListener("popstate", () => {
    renderRoute(window.location.pathname);
  });

  // Add event to btn #chat-select-chat
  document.addEventListener("click", async (event) => {
    const target = event.target as HTMLButtonElement;
    const button = target.closest("button");

    if (button && button.id === `accept-friend-request`) {
      var tagName = button.name;
	  const eventId = button.getAttribute("eventid");

	  var response = await fetchRequest('/add-friend', 'POST', {},
		{ body:JSON.stringify({id: tagName, event_id: eventId}) })

	  const parentMsg = button.closest("p");
	  if (parentMsg) {
		  parentMsg.remove();
		  const tagId = parentMsg.id.replace("msg-index-", "");
		  deleteIntraMessage(Number(tagId));
	  }
    }

    if (button && button.id === "btn-friend-list") {
      var response = await fetchRequest(`/add-event`, "POST", {},
        {
          body: JSON.stringify({
            to_id: messageState.selectChat.id,
            from_id: Number(id.id),
            type: "friend:add",
            message: "",
          }),
        }
      );
	  button.disabled = true;
      if (response.status === "success") {
        addIntraMessage(
          `Friend request sent to ${messageState.selectChat.name}`
        );
      }
      return;
    }

    if (button && button.id === "select-chat-btn") {

      const chatName = button.value;
      const chatId = button.name;

      console.log("Selected chat:", chatName, chatId);
      messageState.selectChat = { name: chatName, id: Number(chatId) };
      const buttons = document.querySelectorAll("#select-chat-btn");
      buttons.forEach((button) => {
        button.classList.remove("bg-gray-100");
      });
      Array.from(document.getElementsByClassName(chatName)).forEach((elem) => {
        elem.classList.add("bg-gray-100");
      });
      return;
    }
  });
}
