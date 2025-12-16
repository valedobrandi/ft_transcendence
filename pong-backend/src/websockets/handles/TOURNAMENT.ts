import type { WebSocket } from 'ws';
import { QuitMatch, Tournamentype } from "../types.js";
import { joinTournamentQueue } from "../../state/tournamentRoom.js";
import { connectedRoomInstance } from '../../state/ConnectedRoom.js';
import { print } from '../../server.js';
import { gameRoom } from '../../state/gameRoom.js';

export function TOURNAMENT(data: Tournamentype, connection: WebSocket) {
	const player = connectedRoomInstance.getById(data.id);

	if (player === undefined || player.status != 'CONNECTED') return;

	//print(`Tournament Player: ${data.username}`);

	joinTournamentQueue(Number(player.id));
}

export function QUIT_MATCH(data: QuitMatch) {
	const match = gameRoom.get(data.match_id);

	
}
