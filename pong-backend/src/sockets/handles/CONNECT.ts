import { connectedRoom } from "../../state/connectedRoom.js";
import { PlayerType } from "../../types/PlayerType.js";
import type { WebSocket } from 'ws';
import { ConnectType } from "../types.js";


export function CONNECT(data: ConnectType, connection:WebSocket) {
    const player: PlayerType = {
        id: data.id,
        name: 'player_' + data.id,
        socket: connection,
        status: 'CONNECT_ROOM',
        matchId: "",
        tournamentId: "",
        side: ""
    };

    if (connectedRoom.has(player.id) == false) {
        connectedRoom.set(player.id, player);
    }
    connection.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
    console.log(`Player connected: ${player.id}`);
}