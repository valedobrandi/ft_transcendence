import { connectedRoom } from "../../state/connectedRoom.js";
import type { WebSocket } from 'ws';
import { PlayType } from "../types.js";
import { gameRoom } from "../../state/gameRoom.js";

export function PLAY(data: PlayType, connection: WebSocket) {
	const player = connectedRoom.get(data.id);
	if (player == undefined) return;

	const room = gameRoom.get(player.matchId);
	if (room === undefined) return;

	console.log(`Player ${player.id} is ready in match ${player.matchId}`);
	connection.send(JSON.stringify({ status: 200, message: 'GAME_START' }));
}