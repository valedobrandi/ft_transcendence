import { connectedRoom } from "../../state/connectedRoom.js";
import type { WebSocket } from 'ws';
import { Tournamentype } from "../types.js";
import { joinTournamentRoom } from "../../state/tournamentRoom.js";

export function TOURNAMENT(data: Tournamentype, connection: WebSocket) {
	const player = connectedRoom.get(data.id);
	if (player == undefined || player.status != 'CONNECT_ROOM') return;

	console.log(`Tournament: ${data.id}`);

	joinTournamentRoom(player);
}