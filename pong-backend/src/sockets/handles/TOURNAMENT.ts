import type { WebSocket } from 'ws';
import { Tournamentype } from "../types.js";
import { joinTournamentRoom } from "../../state/tournamentRoom.js";
import { connectedRoomInstance } from '../../state/connectedRoom.js';

export function TOURNAMENT(data: Tournamentype, connection: WebSocket) {
	const player = connectedRoomInstance.getById(data.username);

	if (player == undefined || player.status != 'CONNECT_ROOM') return;

	console.log(`Tournament Player: ${data.username}`);

	joinTournamentRoom(player.username);
}