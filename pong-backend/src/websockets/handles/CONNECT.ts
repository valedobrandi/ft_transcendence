import { connectedRoomInstance } from "../../state/ConnectedRoom.js";
import type { WebSocket } from 'ws';
import { ConnectType } from "../types.js";
import { timeoutDisconnect } from "../index.js";
import { print } from "../../server.js";

export function CONNECT(data: ConnectType, connection: WebSocket) {
    print(`[WEBSOCKET] User ${data.userId} is connecting via websocket.`);
    if (timeoutDisconnect.has(data.userId)) {
        const timeout = timeoutDisconnect.get(data.userId);
        if (timeout) {
            clearTimeout(timeout);
        }
        timeoutDisconnect.delete(data.userId);
    }

    connectedRoomInstance.addWebsocket(data.userId, connection);

    connection.send(JSON.stringify({ status: 200, message: 'CONNECTED' }));

    const user = connectedRoomInstance.getById(data.userId);
    if (user) user.chat.sendHistory();

}