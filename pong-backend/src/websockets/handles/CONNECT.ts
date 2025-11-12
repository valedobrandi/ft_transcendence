import { connectedRoomInstance } from "../../state/ConnectedRoom.js";
import type { WebSocket } from 'ws';
import { ConnectType } from "../types.js";
import { print } from "../../server.js";

export function CONNECT(data: ConnectType, connection: WebSocket) {

    connectedRoomInstance.addWebsocket(data.user_id, connection);

    connection.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));

    const user = connectedRoomInstance.getById(data.user_id);
    if (!user) {
        print(`Error: User not found after connection: ${data.username}`);
        return;
    }
    print(`Player connected: ${data.username}`);
    print(`[Sending chat history to]: ${data.username}`);
    user.chat.sendHistory();
}