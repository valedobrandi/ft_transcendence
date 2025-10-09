import { connectedRoom, matchRoom } from "../../state/rooms.js";
import type { WebSocket } from 'ws';
import { MatchType } from "../types.js";

export function MATCH(data: MatchType, connection: WebSocket) {
    const player = connectedRoom.get(data.id);
    console.log(`Player matching: ${data.id}`);
    const find = matchRoom.find(p => p.id === data.id);
    if (find == undefined && player) {
        if (player.status === 'CONNECT_ROOM') {
            player.status = 'MATCH_ROOM';
            matchRoom.push(player);
        }
    }
    connection.send(JSON.stringify({ status: 200, message: 'MATCHED_ROOM' }));
}