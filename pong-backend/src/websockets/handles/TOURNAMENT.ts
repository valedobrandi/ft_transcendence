import type { WebSocket } from 'ws';
import { Tournamentype } from "../types.js";
import { joinTournamentQueue } from "../../state/tournamentRoom.js";
import { connectedRoomInstance } from '../../state/ConnectedRoom.js';
import { print } from '../../server.js';

export function TOURNAMENT(data: Tournamentype, connection: WebSocket) {
	const player = connectedRoomInstance.getById(data.id);

	if (player === undefined || player.status != 'CONNECT_ROOM') return;

	print(`Tournament Player: ${data.username}`);

	joinTournamentQueue(Number(player.id));
}