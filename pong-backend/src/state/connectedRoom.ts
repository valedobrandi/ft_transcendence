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
        };

        if (this.room.has(name) === false) {
            this.room.set(name, user);
			return true;
        }
		return false;
    }

    addWebsocket(id: string, socket: WebSocket): Boolean {
        const player = this.room.get(id);
        if (player) {
            player.socket = socket;
            this.broadcast();
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
        this.broadcast();
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

    broadcast() {
        const users = Array.from(this.room.values()).map(({ id, username: name }) => ({ id, name }));
        users.unshift({ id: 1, name: 'INTRA' });

        this.room.forEach(({ socket }) => {
           if (socket) socket.send(JSON.stringify({ message: 'CONNECTED_USERS', users }));
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