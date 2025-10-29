import type { WebSocket } from 'ws';
import { MatchType } from "../types.js";
import { joinMatchRoom } from "../../state/gameRoom.js";
import { connectedRoomInstance } from '../../state/connectedRoom.js';


export function MATCH(data: MatchType, connection: WebSocket) {
	const player = connectedRoomInstance.getById(data.username);
	if (player == undefined || player.status != 'CONNECT_ROOM') return;

	console.log(`Player matching: ${data.username}`);

	joinMatchRoom(player.id);
}