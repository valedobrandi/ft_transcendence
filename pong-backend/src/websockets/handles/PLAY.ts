import type { WebSocket } from 'ws';
import { PlayType } from "../types.js";
import { gameRoom } from "../../state/gameRoom.js";
import { connectedRoomInstance } from '../../state/ConnectedRoom.js';

export function PLAY(data: PlayType, connection: WebSocket) {
	// const player = connectedRoomInstance.getById(data.username);
	// if (player == undefined) return;

	// const room = gameRoom.get(player.matchId);
	// if (room === undefined) return;

	// //console.log(`Player ${player.id} is ready in match ${player.matchId}`);
	// connection.send(JSON.stringify({ status: 200, message: 'GAME_START' }));
}