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

  addUser(name: string, id: number | bigint): Boolean {
    const user: PlayerType = {
      id: id,
      username: name,
      socket: undefined,
      status: "CONNECT_ROOM",
      matchId: undefined,
      tournamentId: undefined,
      chat: new ChatManager(Number(id), name),
    };

    print(`[ONLINE]: ${name} (${id})`);
    if (this.room.has(id) === false) {
      this.room.set(id, user);
      return true;
    }
    return false;
  }

  friendListSet(useServiceRequestId: number | bigint) {
    return {
      add: (id: number | bigint) => {

        this.sendUpdateStatus(id, useServiceRequestId, false);
        this.sendUpdateStatus(useServiceRequestId, id, false);
      },
      delete: (friendId: number | bigint) => {
        this.sendUpdateStatus( friendId, useServiceRequestId, true);
      },
      get: () => {
        // get friend list form database
        const friendsModelInstance = new FriendsModel(db);
        const friendsList = friendsModelInstance.getFriendsList(Number(useServiceRequestId));
        return friendsList.data;
      },
    };
  }

  addWebsocket(id: number, socket: WebSocket) {
    const player = this.room.get(Number(id));

    if (player === undefined) throw new Error("disconnected");

    player.socket = socket;
    this.broadcastRegisteredUsers();
    this.broadcastFriendStatus(Number(player.id));
    this.broadcastNewMatchesList();
  }

  dropWebsocket(id: number) {
    const player = this.room.get(Number(id));
    if (player && player.socket) player.socket.close();
  }

  disconnect(id: number | bigint) {
    this.broadcastFriendStatus(id, true);
    this.dropWebsocket(Number(id));
    const connected = this.getById(id);
    if (connected && connected.matchId) {
      if (connected.status === "SEND_INVITE" || connected.status === "MATCH_INVITE") {
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
    print(`[BROADCAST USERS REGISTER]: ${registeredUsers.length}`);
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
	const matchesArray: NewMatch[] = Array.from(newMatchesQueue.values());
    this.room.forEach(({ socket }) => {
      if (socket !== undefined) {
        socket.send(
			JSON.stringify({
				status: 200,
				message: "match:list",
				payload: {matches: matchesArray}
			})
		)
      }
    });
  }

  sendUpdateStatus(
    senderId: number | bigint,
    userListId: number | bigint,
    disconnect: boolean
  ) {
    const sender = this.getById(senderId);
    if (sender && sender.socket) {
      const isConnected = disconnect
        ? !this.has(userListId)
        : this.has(userListId);
      sender.socket.send(
        JSON.stringify({
          statusCode: 200,
          message: "FRIEND_STATUS_UPDATE",
          payload: { id: userListId, isConnected },
        })
      );
    }
  }

  broadcastFriendStatus(id: number | bigint, disconnect = false) {
    const connected = this.getById(id);
    if (connected === undefined) return;
    const userList = connectedRoomInstance.friendListSet(id).get();
   
    userList.forEach((senderId) => {
      this.sendUpdateStatus(senderId, id, disconnect);
    });
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
    return this.room.has(Number(id));
  }

  size() {
    return this.room.size;
  }

  clear() {
    this.room.clear();
  }
}

export const connectedRoomInstance = new ConnectedRoom();
