import { GameRoom } from "../classes/GameRoom.js";
import { matchQueueEvent } from "../events/matchQueueEvent.js";
import { getNextPlayers } from "./matchRoom.js";

export const gameRoom = new Map<string, GameRoom>();

matchQueueEvent.on('ready', () => {

	const players = getNextPlayers();
	if (players == undefined) return;

	const [playerX, playerY] = players;
	const matchId = Date.now().toString();

	const room = new GameRoom(matchId);
	room.addPlayer(playerX);
	room.addPlayer(playerY);
	gameRoom.set(matchId, room);

	[playerX, playerY].forEach((player, index) => {
		console.log(`Sending GAME_ROOM to ${player.id}, socket readyState: ${player.socket.readyState}`);
		player.status = 'GAME_ROOM';
		player.side = index === 0 ? 'LEFT' : 'RIGHT';
		player.matchId = matchId;

		player.socket.send(JSON.stringify({
			status: 200,
			message: 'GAME_ROOM',
			side: player.side,
			id: player.id
		}));
	});

	console.log(`Match created: ${matchId} between ${playerX.id} and ${playerY.id}`);

})