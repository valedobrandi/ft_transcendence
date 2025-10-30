import { FastifyRequest } from "fastify/types/request.js";
import { handleMessage } from "./handles/handler.js";
import type { WebSocket } from 'ws';
import { connectedRoomInstance } from "../state/connectedRoom.js";

export function socketHandler(connection: WebSocket, req: FastifyRequest) {
    connection.send(JSON.stringify({ type: 'connected', message: 'Welcome!' }));
    connection.on('message', (raw: string) => {
        try {
            const msg = JSON.parse(raw.toString());
            handleMessage(connection, msg);
          } catch (err) {
            connection.send(JSON.stringify({ type: 'error', error: err }));
          }
    });
    connection.on('close', () => {
        const user = connectedRoomInstance.getBySocket(connection);
        if (user === undefined) return;
        connectedRoomInstance.disconnect(user.id);
    });
}
