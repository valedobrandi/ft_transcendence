import { profile } from "../app";
import { playerSideState } from "../context";
import type { ChatDataHistory } from "../interface/ChatHistory";
import {
  removeIntraMessage,
  newIntraMessage,
  stateProxyHandler,
  findIntraMessage,
  updateIntraMessage,
} from "../states/stateProxyHandler";
import { websocketNewEvents } from "./websocketNewEvents";
import { navigateTo, setTime } from "../utils";
import { EmbeddedButton } from "../components/EmbeddedButton";
import { Alert } from "../components/Alert";

export async function websocketReceiver(socket: WebSocket) {
  socket.addEventListener("message", async (event) => {
    const data = JSON.parse(event.data);
    if (data.message != "STATE") {
      //console.log("[WEBSOCKET RECEIVER] ", data);
    }
    switch (data.message) {
      case "PADDLE_HEIGHT":
        stateProxyHandler.paddle.height = data.payload.height;
        stateProxyHandler.paddle.width = data.payload.width;
        break;
      case "CONNECT_ROOM":
        stateProxyHandler.state = data.message;
        break;
      case "MATCH_ROOM":
        stateProxyHandler.state = data.message;
        newIntraMessage(`You have joined the match room.`);
        break;
      case "GAME_ROOM":
        {
          const alert = new Alert(`Starting game`);
          alert.show();
          newIntraMessage(data.payload.message);
          playerSideState.side = data.side;
          setTime(5000, () => {
            navigateTo("/match");
          });
        }
        break;
      case "TOURNAMENT_ROOM":
        stateProxyHandler.state = data.message;
        const idx = newIntraMessage("");
        updateIntraMessage(
          idx,
          `You have joined the tournament room.
          <button 
          class="bg-red-500 text-white ml-4 p-1 rounded text-xs"
          id="btn-leave-tournament"
          data-eventindex=${idx}
          >
            CANCEL
          </button>`
        );
        break;
      case "GAME_OVER":
        newIntraMessage(data.payload.message);
        stateProxyHandler.state = data.message;
        break;
      case "CONNECTED_USERS":
        //messageState.connected = data.users;
        break;
      case "CHAT_MESSAGE":
        if ("sender" in data && "history" in data) {
          // Get the sender id by filter out my own id
          const sender = data.sender.find((sid: number) => sid !== profile.id);
          if (!sender) return;
          //console.log("[WEBSOCKET RECEIVER] CHAT_MESSAGE from ", data.history);
          stateProxyHandler.messages.set(sender, data.history);
          stateProxyHandler.state = data.message;
        }
        break;
      case "CHAT_HISTORY":
        if ("history" in data) {
          data.history.forEach(({ sender, history }: ChatDataHistory) => {
            const filteredSender = sender.find(
              (sid: number) => sid !== profile.id
            );
            if (filteredSender) {
              stateProxyHandler.messages.set(filteredSender, history);
            }
          });
        }
        break;
      case "SERVER_USERS":
        if ("users" in data) {
          // sort users by name but keep the user at the top
          data.users.sort((a: any, b: any) => {
            if (a.id === profile.id) return -1;
            if (b.id === profile.id) return 1;
            return a.name.localeCompare(b.name);
          });
          stateProxyHandler.serverUsers = data.users;
        }
        break;
      case "FRIEND_STATUS_UPDATE":
        if ("payload" in data) {
          const updateFriend = data.payload;
          const friend = stateProxyHandler.friendList.find(
            (friend) => friend.id === updateFriend.id
          );
          if (friend === undefined) {
            stateProxyHandler.friendList = [
              ...stateProxyHandler.friendList,
              updateFriend,
            ];
            break;
          }
          friend.isConnected = updateFriend.isConnected;
          const newFriendList = stateProxyHandler.friendList.filter(
            (friend) => friend.id !== updateFriend.id
          );
          stateProxyHandler.friendList = [...newFriendList, friend];
        }
        break;
      case "event:new":
        await websocketNewEvents();
        break;
      case "invite:accept":
        {
          const idx = findIntraMessage(data.payload.matchId);
          if (idx !== -1) {
            removeIntraMessage(idx);
          }
        }
        break;
      case "match:list": {
        stateProxyHandler.availableMatches = data.payload.matches;
        break;
      }
      case "MATCH_INVITE": {
        stateProxyHandler.state = data.message;
        
        const getName = stateProxyHandler.serverUsers.find(
          (user) => user.id === data.payload.from
        )?.name;
        const idx = newIntraMessage("");
        updateIntraMessage(
          idx,
          `You have received a game invite from ${getName}.
          ${EmbeddedButton(
            data.payload.matchId,
            "YES",
            `${idx}`,
            "accept-match-invite",
            "accept-match-invite"
          )}
          ${EmbeddedButton(
            data.payload.matchId,
            "NO",
            `${idx}`,
            "cancel-match-invite",
            "deny-match-invite"
          )}`
        );
        stateProxyHandler.state = "MATCH_INVITE";
        break;
      }
      case "MATCH_DECLINED":
        {
          const getName = stateProxyHandler.serverUsers.find(
            (user) => user.id === data.payload.from
          )?.name;
          newIntraMessage(`invitation canceled by ${getName}`);
          const idx = stateProxyHandler.systemMessages.findIndex((msg) =>
            msg.message.includes(`${data.payload.matchId}"`)
          );
          if (idx !== -1) {
            removeIntraMessage(idx);
          }
          stateProxyHandler.state = "CONNECT_ROOM";
        }
        break;
      case "intra:message": {
        newIntraMessage(data.payload.message);
      }
        break;
      case "friend:list:update": {
        stateProxyHandler.friendList = data.payload.friends;
      }
        break;
    }
  });
}
