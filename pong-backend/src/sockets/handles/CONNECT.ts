import { connectedRoomInstance } from "../../state/connectedRoom.js";
import type { WebSocket } from 'ws';
import { ConnectType } from "../types.js";
import { authenticationRoomInstance } from "../../state/authenticationRoom.js";
import { log } from "console";


export function CONNECT(data: ConnectType, connection: WebSocket) {
    const authenticationRoom = authenticationRoomInstance;

    const isValid = authenticationRoom.verify(data.username.toString(), data.code);
    if (!isValid) {
        connection.send(JSON.stringify({ status: 401, message: 'INVALID_CODE' }));
        return;
    }

    authenticationRoom.delete(data.username.toString());
    connectedRoomInstance.add(data.username, connection);
    connection.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
    
    console.log(`Player connected: ${data.username}`);
}