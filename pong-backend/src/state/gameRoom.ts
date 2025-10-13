import { PingPong } from "../classes/PingPong.js";
import { matchQueueEvent } from "../events/matchQueueEvent.js";
import { PlayerType } from "../types/PlayerType.js";

const matchRoom: PlayerType[] = [];

export const gameRoom = new Map<string, PingPong>();

export function joinMatchRoom(player: PlayerType) {
	matchRoom.push(player);
	player.status = 'MATCH_ROOM';

	player.socket.send(JSON.stringify({ status: 200, message: 'MATCHED_ROOM' }))

	if (matchRoom.length >= 2) {
		matchQueueEvent.emit('ready');
	}
}

export function getNextPlayers(): [PlayerType, PlayerType] | null {
	if (matchRoom.length < 2) return null;
	return [matchRoom.shift()!, matchRoom.shift()!];
}


matchQueueEvent.on('ready', () => {

	const players = getNextPlayers();
	if (players == undefined) return;

	const [playerX, playerY] = players;
	const matchId = crypto.randomUUID();

	const newMatch = new PingPong(matchId);
	newMatch.createMatch(playerX, playerY);

})