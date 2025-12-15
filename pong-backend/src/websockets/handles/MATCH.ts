import type { WebSocket } from 'ws';
import { MatchType } from "../types.js";
import { joinMatchRoom } from "../../state/gameRoom.js";
import { connectedRoomInstance } from '../../state/ConnectedRoom.js';
import { print } from '../../server.js';


export function MATCH(data: MatchType, connection: WebSocket) {
	const player = connectedRoomInstance.getById(Number(data.userId));

	if (player == undefined || player.status != 'CONNECTED') return;

	//print(`[MATCH]: ${data.username}`);

	joinMatchRoom(player.username, Number(player.id));
}