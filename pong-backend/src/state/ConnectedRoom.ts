import { get } from "http";
import db from "../../database/db.js";
import ChatManager from "../classes/ChatManager.js";
import { UsersModel } from "../models/usersModel.js";
import { PlayerType } from "../types/PlayerType.js";
import type { WebSocket } from 'ws';

export class ConnectedRoom {
    private room = new Map<string, PlayerType>();
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

        if (this.room.has(name) === false) {
            this.room.set(name, user);
			return true;
        }
		return false;
    }

    friendListSet(id: number | bigint) {
        const player = this.getById(id);
        if (player === undefined) throw new Error(`${id} Disconnected.`);
        return {
            add: (friendId: number | bigint) => {
                player.friendSet.add(friendId);
                this.broadcastConnectedUsers();
            },
            delete: (friendId: number | bigint) => {
                player.friendSet.delete(friendId);
                this.broadcastConnectedUsers();
            },
            save: (payload: number[]) => {
                player.friendSet = new Set(payload);
                this.broadcastConnectedUsers();
            },
            get: () => {
                return Array.from(player.friendSet);
            },
            has: (friendId: number | bigint) => {
                return player.friendSet.has(friendId);
            }
        };
    }

    addWebsocket(id: string, socket: WebSocket): Boolean {
        const player = this.room.get(id);
        if (player) {
            player.socket = socket;
            this.broadcastConnectedUsers();
            this.broadCastRegisteredUsers();
			return true;
        }
		return false;
    }

    dropWebsocket(id: string) {
        const player = this.room.get(id);
        if (player && player.socket) player.socket.close();
    }

    disconnect(id: string) {
        this.dropWebsocket(id);
        this.room.delete(id);
        this.broadcastConnectedUsers();
    }

    broadCastRegisteredUsers() {
        const registeredUsers = this.usersModelsInstance.getAllUsers().map(user => ({
            id: user.id,
            name: user.username
        }));
        // Sort by id so that INTRA is first
        registeredUsers.sort((a, b) => a.id === 1 ? -1 : 1);

        this.room.forEach(({ socket }) => {
            if (socket) socket.send(JSON.stringify({ message: 'SERVER_USERS', users: registeredUsers }));
        });
    }

    broadcastConnectedUsers() {
        this.room.forEach(({ friendSet, socket}) => {
            const friendListMap = Array.from(friendSet).map(friendId => {
                const isConnected = this.getById(friendId) ? true : false;
                return { id: friendId, isConnected };
            });
           if (socket) {
               socket.send(JSON.stringify({ message: 'FRIEND_LIST', payload: friendListMap }));
           }
        });
    }

    getByName(name: string) {
        return this.room.get(name);
    }

    getById(id: number | bigint) {
        for (const player of this.room.values()) {
            if (player.id === id) {
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

    has(id: string) {
        return this.room.has(id);
    }

    size() {
        return this.room.size;
    }

    clear() {
        this.room.clear();
    }
}


export const connectedRoomInstance = new ConnectedRoom();