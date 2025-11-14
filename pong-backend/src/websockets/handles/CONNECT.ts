import { connectedRoomInstance } from "../../state/ConnectedRoom.js";
import type { WebSocket } from 'ws';
import { ConnectType } from "../types.js";

export function CONNECT(data: ConnectType, connection: WebSocket) {

    connectedRoomInstance.addWebsocket(data.userId, connection);

    connection.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));

    const user = connectedRoomInstance.getById(data.userId);
    if (user) user.chat.sendHistory();


}