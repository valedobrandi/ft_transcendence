import db from "../../database/db.js";
import ChatManager from "../classes/ChatManager.js";
import { UsersModel } from "../models/usersModel.js";
import FriendsModel from "../routes/friend.js";
import { print } from "../server.js";
import { PlayerType } from "../types/PlayerType.js";
import type { WebSocket } from 'ws';

export class ConnectedRoom {
	private room = new Map<number | bigint, PlayerType>();
	private usersModelsInstance = new UsersModel(db);

	addUser(name: string, id: number | bigint): Boolean {
		const user: PlayerType = {
			id: id,
			username: name,
			socket: undefined,
			status: 'CONNECT_ROOM',
			matchId: "",
			tournamentId: "",
			chat: new ChatManager(Number(id), name),
			friendSet: new Set<number | bigint>(),
		};

		if (this.room.has(id) === false) {
			this.room.set(id, user);
			return true;
		}
		return false;
	}

	friendListSet(requestId: number | bigint) {
		const player = this.getById(requestId);
		if (player === undefined) throw new Error(`${requestId} Disconnected.`);
		return {
			add: (id: number | bigint) => {
				print(`Adding friend ${id}`);
				player.friendSet.add(id);
				this.sendUpdateStatus(requestId, id);
			},
			delete: (friendId: number | bigint) => {
				player.friendSet.delete(friendId);
				this.broadcastFriendList(friendId);
			},
			save: (payload: number[]) => {
				player.friendSet = new Set(payload);
			},
		};
	}

	addWebsocket(id: number, socket: WebSocket) {
		const player = this.room.get(Number(id));
		if (player) {
			player.socket = socket;
			this.broadCastRegisteredUsers();
			this.broadcastFriendList(Number(id));
		}
	}

	dropWebsocket(id: number) {
		const player = this.room.get(Number(id));
		if (player && player.socket) player.socket.close();
	}

	disconnect(id: number | bigint) {
		this.broadcastFriendList(Number(id), false);
		this.dropWebsocket(Number(id));
		this.room.delete(Number(id));
	}

	broadCastRegisteredUsers() {
		const registeredUsers = this.usersModelsInstance.getAllUsers().map(user => ({
			id: user.id,
			name: user.username
		}));
		// Sort by id so that INTRA is first
		registeredUsers.sort((a, b) => a.id === 1 ? -1 : 1).splice(0, 1);
		this.room.forEach(({ socket }) => {
			if (socket) socket.send(JSON.stringify({ status: 200, message: 'SERVER_USERS', users: registeredUsers }));
		});
	}

	sendUpdateStatus(id: number | bigint, friendId: number | bigint) {
		const sender = this.getById(id);
			if (sender && sender.socket) {
				const isConnected = this.has(friendId);
				sender.socket.send(JSON.stringify(
					{
						statusCode: 200,
						message: 'FRIEND_STATUS_UPDATE',
						payload: { id, isConnected }
					}));
			}
	}

	broadcastFriendList(id: number | bigint, isConnected: boolean = true) {

		const user = this.getById(id); if (user === undefined) return;

		Array.from(user.friendSet).forEach((t) => {
			this.sendUpdateStatus(t, id);
		});
	}

	getById(id: number | bigint) {
		return this.room.get(Number(id));

	}

	getBySocket(socket: WebSocket) {
		for (const player of this.room.values()) {
			if (player.socket === socket) {
				return player;
			}
		}
		return undefined;
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