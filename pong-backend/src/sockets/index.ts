import { FastifyRequest } from "fastify/types/request.js";
import { handleMessage } from "./handles/handler.js";
import type { WebSocket } from 'ws';
import { connectedRoom, disconnectWebsocket } from "../state/connectedRoom.js";
import { gameRoom } from "../state/gameRoom.js";

export function socketHandler(connection: WebSocket, req: FastifyRequest) {
    connection.send(JSON.stringify({ type: 'connected', message: 'Welcome!' }));
    connection.on('message', (raw: string) => {
        try {
            const msg = JSON.parse(raw.toString());
            handleMessage(connection, msg);
          } catch (err) {
            connection.send(JSON.stringify({ type: 'error', error: 'Internal server error' }));
          }
    });
    connection.on('close', () => {
        for (const [id, player] of connectedRoom.entries()) {
            
            if (player.socket === connection) {
                const match = gameRoom.get(player.matchId);
                if (match) match.disconnect(player.id);
                
                disconnectWebsocket(id);
                break;
            } 
            
        }
    });
}
