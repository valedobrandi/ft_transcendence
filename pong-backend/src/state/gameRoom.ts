import { PingPong } from "../classes/PingPong.js";
import { matchQueueEvent } from "../events/matchQueueEvent.js";
import { PlayerType } from "../types/PlayerType.js";

const queueRoom: PlayerType[] = [];

export const gameRoom = new Map<string, PingPong>();

export function joinMatchRoom(player: PlayerType) {
	queueRoom.push(player);
	player.status = 'MATCH_ROOM';

	player.socket.send(JSON.stringify({ status: 200, message: 'MATCH_ROOM' }))

	if (queueRoom.length >= 2) {
		matchQueueEvent.emit('ready');
	}
}

export function getNextPlayers(): [PlayerType, PlayerType] | null {
	if (queueRoom.length < 2) return null;
	return [queueRoom.shift()!, queueRoom.shift()!];
}


matchQueueEvent.on('ready', () => {

	const players = getNextPlayers();
	if (players == undefined) return;

	const [playerX, playerY] = players;
	const matchId = crypto.randomUUID();

	const newMatch = new PingPong(matchId);
	newMatch.createMatch(playerX, playerY);

})