import db from "../database/db.js";
import ChatManager from "../classes/ChatManager.js";
import { UsersModel } from "../models/usersModel.js";
import { matchServiceInstance } from "../routes/match.js";
import { print } from "../server.js";
import { PlayerType } from "../types/PlayerType.js";
import type { WebSocket } from "ws";
import { NewMatch, newMatchesQueue } from "./gameRoom.js";

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
      friendSet: new Set<number | bigint>(),
    };

    print(`[ONLINE]: ${name} (${id})`);
    if (this.room.has(id) === false) {
      this.room.set(id, user);
      return true;
    }
    return false;
  }

  friendListSet(useServiceRequestId: number | bigint) {
    const sender = this.getById(useServiceRequestId);
    if (sender === undefined) throw new Error("disconnected");
    return {
      add: (id: number | bigint) => {
        //print(`Adding friend ${id}`);
        sender.friendSet.add(id);
        this.sendUpdateStatus(id, sender.id, false);
        this.sendUpdateStatus(sender.id, id, false);
      },
      delete: (friendId: number | bigint) => {
        sender.friendSet.delete(friendId);
        this.broadcastFriendStatus(friendId);
      },
      save: (payload: number[]) => {
        sender.friendSet = new Set(payload);
      },
      get: () => {
        return Array.from(sender.friendSet);
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
    this.dropWebsocket(Number(id));
    this.broadcastFriendStatus(Number(id), true);
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
	//Mutate newMatchesQueue in [NewMatch]
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
    const userList = this.getById(id);
    if (userList === undefined) return;

    Array.from(userList.friendSet).forEach((senderId) => {
      this.sendUpdateStatus(senderId, userList.id, disconnect);
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
