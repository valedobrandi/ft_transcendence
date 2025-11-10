import type { WebSocket } from 'ws';
import { MatchType } from "../types.js";
import { joinMatchRoom } from "../../state/gameRoom.js";
import { connectedRoomInstance } from '../../state/ConnectedRoom.js';


export function MATCH(data: MatchType, connection: WebSocket) {
	const player = connectedRoomInstance.getByName(data.username);
	if (player == undefined || player.status != 'CONNECT_ROOM') return;

	console.log(`Player matching: ${data.username}`);

	joinMatchRoom(player.username);
}