import ChatManager from "../classes/ChatManager.js";
import { PlayerType } from "../types/PlayerType.js";
import type { WebSocket } from 'ws';

export class ConnectedRoom {
    private room = new Map<string, PlayerType>();

    addUser(name: string, id: number | bigint): Boolean {
        const user: PlayerType = {
            id: id,
            username: name,
            socket: undefined,
            status: 'CONNECT_ROOM',
            matchId: "",
            tournamentId: "",
            chat: new ChatManager(name),
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

    broadcast() {
        const users = Array.from(this.room.values()).map(({ id, username: name }) => ({ id, name }));
        users.unshift({ id: 1, name: 'INTRA' });

        this.room.forEach(({ socket }) => {
           if (socket) socket.send(JSON.stringify({ message: 'CONNECTED_USERS', users }));
        });
    }

    getById(id: string) {
        return this.room.get(id);
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