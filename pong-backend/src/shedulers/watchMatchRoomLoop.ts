import { gameRoom, matchRoom } from "../state/rooms.js";

export function watchMatchRoomLoop() {
    setInterval(() => {

        if (matchRoom.length >= 2) {
            const playerX = matchRoom.shift()!;
            const playerY = matchRoom.shift()!;

            const matchId = Date.now().toString();

            playerX.status = 'GAME_ROOM';
            playerY.status = 'GAME_ROOM';

            playerX.matchId = matchId;
            playerY.matchId = matchId;

            gameRoom.set(matchId, [playerX.id, playerY.id]);

            playerX.side = 'left';
            playerY.side = "right";

            playerX.socket.send(JSON.stringify({
                status: 200,
                message: 'GAME_ROOM',
                side: 'left',
                id: playerX.id
            }));

            playerY.socket.send(JSON.stringify({
                status: 200,
                message: 'GAME_ROOM',
                side: 'right',
                id: playerY.id
            }));

            console.log(`Match started: ${matchId} between ${playerX.id} and ${playerY.id}`);
        }
    }, 2000);
}