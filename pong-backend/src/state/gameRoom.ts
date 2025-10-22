import { PingPong } from "../classes/PingPong.js";
import { matchQueueEvent } from "../events/matchQueueEvent.js";
import { PlayerType } from "../types/PlayerType.js";
import { connectedRoom } from "./connectedRoom.js";

export const matchQueue: Set<string> = new Set();

export const gameRoom = new Map<string, PingPong>();

export function joinMatchRoom(id: string) {
	matchQueue.add(id);
    const player = connectedRoom.get(id);
    if (player == undefined) return;
	player.status = 'MATCH_QUEUE';
	player.socket.send(JSON.stringify({ status: 200, message: 'MATCH_ROOM' }))

	if (matchQueue.size >= 2) {
		matchQueueEvent.emit('ready');
	}
}

export function getNextPlayers(): [string, string] | undefined {
	if (matchQueue.size < 2) return undefined;

    const iterator = matchQueue.values();

    let playerX: string | undefined;;
    let playerY: string | undefined;;

    while (playerX === undefined || playerY === undefined) {
        const next = iterator.next();
        if (next.done) break;

        const id = next.value;
        if (!connectedRoom.has(id)) {
            matchQueue.delete(id);
            continue;
        }
        if (playerX === undefined) playerX = id;
        if (playerY === undefined) playerY = id;
        
    }

    if (playerX && playerY) {
        matchQueue.delete(playerX);
        matchQueue.delete(playerY);
        return [playerX, playerY];
    }

    return undefined;
}


matchQueueEvent.on('ready', () => {

	const players = getNextPlayers();
	if (players == undefined) return;

	const [playerX, playerY] = players;
	const matchId = crypto.randomUUID();

	const newMatch = new PingPong(matchId);
	newMatch.createMatch(playerX, playerY);

})