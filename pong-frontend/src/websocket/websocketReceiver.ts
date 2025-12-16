import { profile } from "../app";
import { playerSideState } from "../context";
import type { ChatDataHistory } from "../interface/ChatHistory";
import {
  stateProxyHandler,
} from "../states/stateProxyHandler";
import { websocketNewEvents } from "./websocketNewEvents";
import { navigateTo } from "../utils";
import { InstanceDisconnect } from "../components/GameStateContainer";
import { disconnectSocket } from "../websocket";

export async function websocketReceiver(socket: WebSocket) {
  socket.addEventListener("message", async (event) => {
    const data = JSON.parse(event.data);
    if (data.message != "STATE") {
      console.log("[WEBSOCKET RECEIVER] ", data);
    }
    switch (data.message) {
      case "PADDLE_HEIGHT":
        stateProxyHandler.paddle.height = data.payload.height;
        stateProxyHandler.paddle.width = data.payload.width;
        const paddle = { height: data.payload.height, width: data.payload.width };
        localStorage.setItem("paddle", JSON.stringify(paddle));
        break;
      case "CONNECTED":
        stateProxyHandler.state = data.message;
        localStorage.setItem("state", JSON.stringify(stateProxyHandler.state));
        break;
      case "MATCH":
        stateProxyHandler.state = data.message;
        localStorage.setItem("state", JSON.stringify(stateProxyHandler.state));
        break;
      case "GAME_ROOM": {
        playerSideState.side = data.side;
        stateProxyHandler.settings = { state: "match.playing" };
        localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));
        navigateTo("/match");
      }
        break;
      case "TOURNAMENT":
        stateProxyHandler.state = data.message;
        localStorage.setItem("state", JSON.stringify(stateProxyHandler.state));
        break;
      case "tournament.queue": {
        const queue = data.payload.queue.map((item: any) => {
          return {
            id: item,
            username: stateProxyHandler.serverUsers.find((user) => user.id === item)?.name || "Unknown",
          };
        });
        stateProxyHandler.tournamentQueue = queue;
        localStorage.setItem("tournamentQueue", JSON.stringify(stateProxyHandler.tournamentQueue));
        stateProxyHandler.settings = { state: "tournament.waiting" };
        localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));
      }
        break;
      case "GAME_OVER": ;
        stateProxyHandler.state = data.message;
        localStorage.setItem("state", JSON.stringify(stateProxyHandler.state));
        stateProxyHandler.settings = { state: "0" };
        localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));
        break;
      case "CHAT_MESSAGE":
        if ("sender" in data && "history" in data) {
          // Get the sender id by filter out my own id
          const sender = data.sender.find((sid: number) => sid !== profile.id);
          if (!sender) return;
          stateProxyHandler.messages = {
            ...stateProxyHandler.messages,
            [sender]: data.history
          };
        }
        break;
      case "CHAT_HISTORY":
        if ("history" in data) {
          data.history.forEach(({ sender, history }: ChatDataHistory) => {
            const filteredSender = sender.find(
              (sid: number) => sid !== profile.id
            );
            if (filteredSender) {
              stateProxyHandler.messages = {
                ...stateProxyHandler.messages,
                [filteredSender]: history
              };
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
      case "event:new":
        await websocketNewEvents();
        break;
      case "match:list": {
        stateProxyHandler.availableMatches = data.payload.matches;
        break;
      }
      case "match.invite": {
        stateProxyHandler.state = "MATCH";
        localStorage.setItem("state", JSON.stringify(stateProxyHandler.state));

        const username = stateProxyHandler.serverUsers.find((user) => user.id === data.payload.from)?.name;
        const invitation = { matchId: data.payload.matchId, id: data.payload.from, username: username || "Unknown" };

        stateProxyHandler.invite = invitation;
        localStorage.setItem("invite", JSON.stringify(stateProxyHandler.invite));

        stateProxyHandler.settings = { state: "invite.receive" };
        localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));
      }
        break;
      case "MATCH_DECLINED": {
        stateProxyHandler.state = "CONNECTED";
        localStorage.setItem("state", JSON.stringify(stateProxyHandler.state));
        stateProxyHandler.settings = { state: "0" };
        localStorage.setItem("settings", JSON.stringify(stateProxyHandler.settings));
      }
        break;
      case "friend:update":
        if ("payload" in data) {
          const newFriendStatus = data.payload;
          // Map through friendList and update the status of the friend
          const newFriendList = stateProxyHandler.friendList.map((friend) => {
            if (friend.id === newFriendStatus.id) {
              return { ...friend, isConnect: newFriendStatus.isConnect };
            }
            return friend;
          });
          stateProxyHandler.friendList = newFriendList;
        }
        break;
      case "friend:new": {
        stateProxyHandler.friendList = data.payload.friends;
      }
        break;
      case "websocket.disconnect":
        disconnectSocket();
        document.body.appendChild(InstanceDisconnect())
        break;
    }
  });
}
