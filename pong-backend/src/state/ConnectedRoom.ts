import db from "../database/db.js";
import ChatManager from "../classes/ChatManager.js";
import { UsersModel } from "../models/usersModel.js";
import { matchServiceInstance } from "../routes/match.js";
import { print } from "../server.js";
import { PlayerType } from "../types/PlayerType.js";
import type { WebSocket } from "ws";
import { NewMatch, newMatchesQueue } from "./gameRoom.js";
import FriendsModel from "../routes/friend.js";

export class ConnectedRoom {
  private room = new Map<number | bigint, PlayerType>();
  private usersModelsInstance = new UsersModel(db);
  private friendsModelInstance = new FriendsModel(db);

  joinRoom(name: string, id: number | bigint) {
    const user: PlayerType = {
      id: id,
      username: name,
      socket: undefined,
      status: "CONNECTED",
      matchId: undefined,
      tournamentId: undefined,
      chat: new ChatManager(Number(id), name),
      state: "0"
    };
    console.log(`[CONNECTED ROOM] ${name} is connected: ${this.room.has(id)}`);
    if (this.room.has(id)) {
      // DISCONNECT PREVIOUS WEBSOCKET
      console.log(`[CONNECTED ROOM] ${name} is already connected. Disconnecting previous websocket.`);
      const connected = this.getById(id);
      if (connected && connected.socket) {
        this.sendWebsocketMessage(id, "websocket.disconnect");
      }
    } else {
      this.room.set(id, user);
    }
  }

  friendListManager(useServiceRequestId: number | bigint) {
    return {

      updateNewFriend: (id: number | bigint) => {
        // send a the new friend list to the user
        this.broadcastWebsocketMessage(
          useServiceRequestId,
          "friend:new", {
            friends: this.friendListManager(useServiceRequestId).getEveryFriends()
          }
        )
      },

      getEveryFriends: () => {
        // get friend list form database
        const friendsList = this.friendsModelInstance.getFriendsList(Number(useServiceRequestId));
        // format in {id: isConnected:}
        return friendsList.data.map(friend => {
          return { id: friend, isConnect: this.has(friend) }
        })

      },

      broadcastFriendUpdates: () => {
        this.broadcastWebsocketMessage(
          useServiceRequestId,
          "friend:new", {
          friends: this.friendListManager(useServiceRequestId).getEveryFriends()
        }
        )
      }
    };
  }

  addWebsocket(id: number, socket: WebSocket) {
    const player = this.room.get(Number(id));

    if (player === undefined) throw new Error("disconnected");

    player.socket = socket;

    this.broadcastRegisteredUsers();
    this.broadcastEachFriend(Number(player.id), true);
    this.broadcastNewMatchesList();
  }

  dropWebsocket(id: number) {
    const player = this.room.get(Number(id));
    if (player && player.socket) player.socket.close();
  }

  disconnect(id: number | bigint) {
    this.broadcastEachFriend(id, false);
    this.dropWebsocket(Number(id));
    const connected = this.getById(id);
    if (connected && connected.matchId) {
      if (connected.status === "MATCH") {
        const matchId = connected.matchId;
        matchServiceInstance.matchRemove(matchId, Number(id));
      }
      matchServiceInstance.removeMatch(Number(id), connected.matchId);

    }
    this.room.delete(Number(id));
  }

  broadcastRegisteredUsers() {
    const registeredUsers = this.usersModelsInstance
      .getAllUsers()
      .map((user) => ({
        id: user.id,
        name: user.username,
      }));
    //print(`[BROADCAST USERS REGISTER]: ${registeredUsers.length}`);
    // SORT OUT ADMIN INTRA
    registeredUsers.sort((a, b) => (a.id === 1 ? -1 : 1)).splice(0, 1);
    this.room.forEach(({ socket }) => {
      if (socket)
        socket.send(
          JSON.stringify({
            status: 200,
            message: "SERVER_USERS",
            users: registeredUsers,
          })
        );
    });
  }

  broadcastNewMatchesList() {
    const matches: NewMatch[] = Array.from(newMatchesQueue.values());
    //print(`[BROADCAST NEW MATCHES LIST]: ${matches.length}`);
    this.room.forEach(({ socket }) => {
      if (socket !== undefined) {
        socket.send(
          JSON.stringify({
            status: 200,
            message: "match:list",
            payload: { matches }
          })
        )
      }
    });
  }

  sendUpdateStatus(
    senderId: number | bigint,
    status: { id: number | bigint, isConnect: boolean },
  ) {
    const sender = this.getById(senderId);
    if (sender && sender.socket) {
      sender.socket.send(
        JSON.stringify({
          statusCode: 200,
          message: "friend:update",
          payload: status,
        })
      );
    }
  }

  broadcastEachFriend(id: number | bigint, disconnect: boolean) {
    const friends = connectedRoomInstance.friendListManager(id).getEveryFriends();
    for (const friend of friends) {
      if (friend.isConnect === false) continue;
      //print(`[BROADCAST FRIEND STATUS] to ${friend.id} about ${id} isConnect: ${!disconnect}`);
      this.sendUpdateStatus(friend.id, { id: Number(id), isConnect: disconnect });
    }
  }

  getById(id: number | bigint) {
    return this.room.get(Number(id));
  }

  getByUsername(username: string) {
    for (const player of this.room.values()) {
      if (player.username === username) {
        return player;
      }
    }
    return undefined;
  }

  getBySocket(socket: WebSocket) {
    for (const player of this.room.values()) {
      if (player.socket === socket) {
        return player;
      }
    }
    return undefined;
  }

  sendWebsocketMessage(id: number | bigint, message: string): boolean {
    const connected = this.getById(id);
    if (connected && connected.socket) {
      connected.socket.send(
        JSON.stringify({
          status: 200,
          message,
        })
      );
      return true;
    }
    return false;
  }

  broadcastWebsocketMessage(id: number | bigint, message: string, payload: any) {
    const connected = this.getById(id);
    if (connected && connected.socket) {
      connected.socket.send(
        JSON.stringify({
          status: 200,
          message,
          payload: payload,
        })
      );
    }
  }

  has(id: number | bigint) {
    return this.room.has(Number(id)) ? true : false;
  }

  size() {
    return this.room.size;
  }

  clear() {
    this.room.clear();
  }
}

export const connectedRoomInstance = new ConnectedRoom();
