import db from "../../database/db.js";
import ChatManager from "../classes/ChatManager.js";
import { UsersModel } from "../models/usersModel.js";
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

	friendListSet(useServiceRequestId: number | bigint) {
		const sender = this.getById(useServiceRequestId);
		if (sender === undefined) return;
		return {
			add: (id: number | bigint) => {
				//print(`Adding friend ${id}`);
				sender.friendSet.add(id);
				this.sendUpdateStatus(id, sender.id);
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
			}
		};
	}

	addWebsocket(id: number, socket: WebSocket) {
		const player = this.room.get(Number(id));
		if (player) {
			player.socket = socket;
			this.broadCastRegisteredUsers();
			this.broadcastFriendStatus(Number(player.id));
		}
	}

	dropWebsocket(id: number) {
		const player = this.room.get(Number(id));
		if (player && player.socket) player.socket.close();
	}

	disconnect(id: number | bigint) {
		this.dropWebsocket(Number(id));
		this.broadcastFriendStatus(Number(id), true);
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

	sendUpdateStatus(senderId: number | bigint, userListId: number | bigint, disconnect: boolean) {
		const sender = this.getById(senderId);
			if (sender && sender.socket) {
				const isConnected = disconnect ? !this.has(userListId) : this.has(userListId);
				sender.socket.send(JSON.stringify(
					{
						statusCode: 200,
						message: 'FRIEND_STATUS_UPDATE',
						payload: { id: userListId, isConnected }
					}));
			}
	}

	broadcastFriendStatus(id: number | bigint, disconnect = false) {

		const userList = this.getById(id); if (userList === undefined) return;

		Array.from(userList.friendSet).forEach((senderId) => {
			this.sendUpdateStatus(senderId, userList.id, disconnect);
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