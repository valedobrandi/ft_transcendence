import { connectedRoom } from "../../state/connectedRoom.js";
import type { WebSocket } from 'ws';
import { MatchType } from "../types.js";
import { joinMatchRoom } from "../../state/gameRoom.js";


export function MATCH(data: MatchType, connection: WebSocket) {
	const player = connectedRoom.get(data.id);
	if (player == undefined || player.status != 'CONNECT_ROOM') return;

	console.log(`Player matching: ${data.id}`);

	joinMatchRoom(player);
}