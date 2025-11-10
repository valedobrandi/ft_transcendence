import { connectedRoomInstance } from "../../state/ConnectedRoom.js";
import type { WebSocket } from 'ws';
import { ConnectType } from "../types.js";
import { print } from "../../server.js";
import { chatHandler } from "./ChatHandler.js";


export function CONNECT(data: ConnectType, connection: WebSocket) {

    connectedRoomInstance.addWebsocket(data.username, connection);

    connection.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
    print(`Player connected: ${data.username}`);

    const user = connectedRoomInstance.getByName(data.username);
    if (!user) return;
    print(`[Sending chat history to]: ${data.username}`);
    user.chat.sendHistory();
}