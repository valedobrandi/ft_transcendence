import { profile } from "../app";
import { newIntraMessage, removeIntraMessage, stateProxyHandler } from "../states/stateProxyHandler";
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

  // Add event to btn #chat-select-chat
  document.addEventListener("click", async (event) => {
    const target = event.target as HTMLButtonElement;
    const button = target.closest("button");
    if (!button) return;
    console.log("Button clicked:", button.id);

    switch (button.id) {
      case "accept-match-invite": {
        const eventId = button.dataset.eventid;
        const response = await fetchRequest(`/match-invite-accept?matchId=${eventId}`, 'GET', {});
        if (response.message === 'success') {
          removeIntraMessage(Number(eventId));
        }
      }
      break;
      case "decline-match-invite": {
        const eventId = button.dataset.eventid;
        const response = await fetchRequest(
          `/match-invite?matchId=${eventId}`,
          'DELETE')
        if (response.message === 'success') {
          const getMatch = await fetchRequest(`/match-invite?matchId=${eventId}`, 'GET', {});
          if (getMatch.message === 'error') {
            console.log("[DELETE MESSAGE]", button);
            const parentMsg = button.closest("p");
            if (parentMsg) {
              const tagId = parentMsg.id.replace("msg-index-", "");
              parentMsg.remove();
              removeIntraMessage(Number(tagId));
            }
            stateProxyHandler.state = "CONNECT_ROOM"
          }
        }
      }
        break;
      case "btn-block-user": {
        const response = await fetchRequest(`/add-block`, "POST", {},
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
          await fetchRequest('/block-list', 'GET', {}).then((data) => {
            if (data.message === 'success') {
              stateProxyHandler.chatBlockList = data.payload;
            }
          });
        }
      }
        break
      case "btn-unblock-user":
        {
          const response = await fetchRequest(`/remove-block?id=${stateProxyHandler.selectChat.id}`, "DELETE", {});

          if (response.message === "success") {
            newIntraMessage(
              `User ${stateProxyHandler.selectChat.name} has been unblocked.`
            );
            await fetchRequest('/block-list', 'GET', {}).then((data) => {
              if (data.message === 'success') {
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
          Array.from(document.getElementsByClassName(chatName)).forEach((elem) => {
            elem.classList.add("bg-gray-100");
          });
        }
        break;
      case "accept-friend-request":
        {
          const tagName = button.name;
          const eventId = button.getAttribute("eventid");
          const action = button.getAttribute("action");

          if (action === "accept") {
            const response = await fetchRequest('/add-friend', 'POST', {},
              { body: JSON.stringify({ id: tagName }) })
            if (response.message === "success") {
              await fetchRequest(`/delete-event?eventId=${eventId}`, 'DELETE');
            }
          }

          if (action === "decline") {
            await fetchRequest(`/delete-event?eventId=${eventId}`, 'DELETE');
          }

          const parentMsg = button.closest("p");
            if (parentMsg) {
              const tagId = parentMsg.id.replace("msg-index-", "");
              parentMsg.remove();
              removeIntraMessage(Number(tagId));
            }

        }
        break;
      case "btn-friend-list":
        {
          var response = await fetchRequest(`/add-event`, "POST", {},
            {
              body: JSON.stringify({
                to_id: stateProxyHandler.selectChat.id,
                from_id: Number(profile.id),
                type: "friend:add",
                message: "",
              }),
            }
          );

          if (response.status === "success") {
            newIntraMessage(
              `Friend request sent to ${stateProxyHandler.selectChat.name}`
            );
          }
        }
        break;
    }
  });
}
