import { connectedRoomInstance } from "../../state/connectedRoom.js";
import type { WebSocket } from 'ws';
import { ConnectType } from "../types.js";


export function CONNECT(data: ConnectType, connection: WebSocket) {

    connectedRoomInstance.addWebsocket(data.username, connection);

    connection.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
    
    console.log(`Player connected: ${data.username}`);
}