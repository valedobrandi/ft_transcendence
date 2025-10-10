import { connectedRoom } from "../../state/rooms.js";
import type { WebSocket } from 'ws';
import { PlayType } from "../types.js";
import { gameRoom } from "../../state/gameRoom.js";

export function PLAY(data: PlayType, connection: WebSocket) {
	const player = connectedRoom.get(data.id);
	if (player == undefined) return;

	const room = gameRoom.get(player.matchId);
	if (room === undefined) return;
	room.setPlayerReady(player.id);

	console.log("PLAYER_READY");
	connection.send(JSON.stringify({ status: 200, message: 'GAME_START' }));
}