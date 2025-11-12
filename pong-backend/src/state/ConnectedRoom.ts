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

	friendListSet(id: number | bigint) {
		const player = this.getById(id);
		if (player === undefined) throw new Error(`${id} Disconnected.`);
		return {
			add: (id: number | bigint) => {
				player.friendSet.add(id);
				this.broadcastFriendList(id);
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

	async addWebsocket(id: number, socket: WebSocket): Promise<Boolean> {
		const player = this.room.get(Number(id));
		if (player) {
			player.socket = socket;
			this.broadCastRegisteredUsers();
			await this.broadcastFriendList(Number(id));
			return true;
		}
		return false;
	}

	dropWebsocket(id: number) {
		const player = this.room.get(Number(id));
		if (player && player.socket) player.socket.close();
	}

	async disconnect(id: number | bigint) {
		await this.broadcastFriendList(Number(id), false);
		this.dropWebsocket(Number(id));
		this.room.delete(Number(id));
	}

	broadCastRegisteredUsers() {
		const registeredUsers = this.usersModelsInstance.getAllUsers().map(user => ({
			id: user.id,
			name: user.username
		}));
		// Sort by id so that INTRA is first
		registeredUsers.sort((a, b) => a.id === 1 ? -1 : 1);

		this.room.forEach(({ socket }) => {
			if (socket) socket.send(JSON.stringify({ status: 200, message: 'SERVER_USERS', users: registeredUsers }));
		});
	}

	async broadcastFriendList(id: number | bigint, isConnected: boolean = true) {

		const user = this.getById(id); if (user === undefined) return;

		const task = Array.from(user.friendSet).map( async (t) => {
			const friend = this.getById(t);
			if (friend && friend.socket) {
				friend.socket.sendAsync(JSON.stringify(
					{
						statusCode: 200,
						message: 'FRIEND_STATUS_UPDATE',
						payload: { id, isConnected }
					}));
			}
		});
		await Promise.all(task);
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