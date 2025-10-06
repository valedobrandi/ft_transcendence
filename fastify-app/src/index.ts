import Fastify from 'fastify';
import fastifyWebSocket from '@fastify/websocket';
import { PlayerType } from './interfaces/PlayerType';
import { GameSessionType } from './interfaces/GameSessionType';
import { pongGameUpdate } from './pongGameUpdate';
import { GameStateType } from './interfaces/GameStateType';

const connectedRoom = new Map<string, PlayerType>();
const matchRoom: PlayerType[] = [];
const gameRoom = new Map<string, GameSessionType>();

const fastify = Fastify({ logger: true });

fastify.register(fastifyWebSocket);

fastify.register(async (fastify) => {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        connection.on('message', message => {
            const data = JSON.parse(message.toString());
            if (data.type === 'CONNECT' && data.id) {
                const player: PlayerType = {
                    id: data.id,
                    name: 'player_' + data.id,
                    socket: connection,
                    status: 'CONNECT_ROOM',
                    matchId: ''
                };
                if (connectedRoom.has(player.id) == false) {
                    connectedRoom.set(player.id, player);
                }
                connection.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
                console.log(`Player connected: ${player.id}`);
            }

            if (data.type === 'MATCH') {
                const player = connectedRoom.get(data.id);
                console.log(`Player matching: ${data.id}`);
                const find = matchRoom.find(p => p.id === data.id);
                if (find == undefined && player) {
                    if (player.status === 'CONNECT_ROOM') {
                        player.status = 'MATCH_ROOM';
                        matchRoom.push(player);
                    }
                }
                connection.send(JSON.stringify({ status: 200, message: 'MATCHED_ROOM' }));
            }

            /* if (data.type === 'PADDLE_MOVE') {
                // find game session
                const playerId = data.id;
                const player = connectedRoom.get(playerId);
                if (player != undefined) {
                    const matchId = player.matchId;
                    const gameSession = gameRoom.get(matchId);
                    if (gameSession && gameSession.status === 'PLAYING') {
                        const playerX = gameSession.playerX;
                        const playerY = gameSession.playerY;
                        if (playerY == player) {
                            const player = gameSession.state.player.Y;
                            player.canvasHeight = data.height;
                            player.canvasWidth = data.width;
                            switch (data.direction) {
                                case 'UP':
                                    if ( player.y > 0) {
                                        gameSession.state.paddles[playerId].y -= 7;
                                    }
                                    break;
                                case 'DOWN':
                                    const canvasElement = { height: gameSession.state.canvasHeight};                             
                                    if ((player.y < player.canvasHeight - )) {
                                        gameSession.state.paddles[playerId].y += 7;
                                    }
                                    break;
                            }
                        }
                    }
                }
            } */
        });
    })
});


setInterval(() => {
    
    if (matchRoom.length >= 2) {
        const playerX = matchRoom.shift()!;
        const playerY = matchRoom.shift()!;

        const matchId = Date.now().toString();

        playerX.status = 'GAME_ROOM';
        playerY.status = 'GAME_ROOM';

        playerX.matchId = matchId;
        playerY.matchId = matchId;

        const gameState: GameStateType = {
            player: { 
                Y: {x: 0, y: 0, canvasWidth: 0, canvasHeight: 0},
                X: {x: 10, y: 0, canvasWidth: 0, canvasHeight: 0}
            },
            ball: { x: 0.5, y: 0.5, velocityX: 0.01, velocityY: 0.01, radius: 0.02 , speed: 0.01},
            paddles: { [playerX.id]: { y: 0.5 }, [playerY.id]: { y: 0.5 } },
            scores: { pX: 0, pY: 0 }, 
            width: 0, heigth: 100
        }

        const gameSession: GameSessionType = {
            id: matchId,
            playerX: playerX,
            playerY: playerY,
            state: gameState,
            status: 'WAITING'
        };

        gameRoom.set(matchId, gameSession);

        playerX.socket.send(JSON.stringify({ status: 200, message: 'GAME_ROOM' }));
        playerY.socket.send(JSON.stringify({ status: 200, message: 'GAME_ROOM' }));
        console.log(`Match started: ${matchId} between ${playerX.id} and ${playerY.id}`);
    }
}, 2000);

// process every game session
/* setInterval(() => {
    for (const [matchId, gameSession] of gameRoom) {
        if (gameSession.status === 'PLAYING') {
            // update game state
            pongGameUpdate(gameSession.state);
            // send game state to both players
            const stateMessage = {
                type: 'GAME_STATE',
                ball: gameSession.state.ball,
                paddles: gameSession.state.paddles,
                scores: gameSession.state.scores
            };
            gameSession.playerX.socket.send(JSON.stringify(stateMessage));
            gameSession.playerY.socket.send(JSON.stringify(stateMessage));
        }
    }
}, 1000 / 60); */

fastify.listen({ port: 3000, host: '0.0.0.0' }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
