import type { WebSocket } from 'ws';
import { FastifyRequest } from "fastify/types/request.js";
import { handleMessage } from "./handles/handler.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { print } from '../server.js';

export const timeoutDisconnect: Map<number | bigint, NodeJS.Timeout> = new Map();

export function socketHandler(connection: WebSocket, req: FastifyRequest) {

    connection.send(JSON.stringify({ type: 'connected', message: 'Welcome!' }));
    print(`[WEBSOCKET] New connection from ${req.ip}`);
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
        const timeout = setTimeout(() => {
          connectedRoomInstance.disconnect(user.id);
          timeoutDisconnect.delete(user.id);
        }, 3000);
        print(`[WEBSOCKET] Connection closed from ${user.username} (${req.ip}), scheduling disconnect in 3 seconds.`);
        timeoutDisconnect.set(user.id, timeout);
    });
}
