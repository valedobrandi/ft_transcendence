import { GameRoom } from "../classes/GameRoom.js";
import { gameRoom, matchRoom } from "../state/rooms.js";

export function watchMatchRoomLoop() {
    if (matchRoom.length < 2) return;
    console.log('Match room watcher started');
    setInterval(() => {

        const playerX = matchRoom.shift()!;
        const playerY = matchRoom.shift()!;

        const matchId = Date.now().toString();

        playerX.status = 'GAME_ROOM';
        playerY.status = 'GAME_ROOM';

        playerX.side = 'LEFT';
        playerY.side = 'RIGHT';

        playerX.matchId = matchId;
        playerY.matchId = matchId;

        const match = new GameRoom(matchId);

        match.addPlayer(playerX);
        match.addPlayer(playerY);

        gameRoom.set(matchId, match);


        playerX.socket.send(JSON.stringify({
            status: 200,
            message: 'GAME_ROOM',
            side: 'LEFT',
            id: playerX.id
        }));

        playerY.socket.send(JSON.stringify({
            status: 200,
            message: 'GAME_ROOM',
            side: 'RIGHT',
            id: playerY.id
        }));

        console.log(`Match started: ${matchId} between ${playerX.id} and ${playerY.id}`);

    }, 2000);
}