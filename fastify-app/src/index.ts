import Fastify from 'fastify';
import fastifyWebSocket from '@fastify/websocket';
import { PlayerType } from './interfaces/PlayerType';
import { GameSessionType } from './interfaces/GameSessionType';
import { GameStateType } from './interfaces/GameStateType';

const connectedRoom = new Map<string, PlayerType>();
const matchRoom: PlayerType[] = [];
const gameRoom = new Map<string, string[] >();
const playerInputs = new Map<string, { up: boolean; down: boolean }>();

const fastify = Fastify({ logger: true });

fastify.register(fastifyWebSocket);

type Player = {
  y: number;
  score: number;
};

type Ball = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: number;
  velocityY: number;
};

const canvasWidth = 1200;
const canvasHeight = 600;

const gameState = {
  userX: { y: canvasHeight / 2 - 50, score: 0 } as Player,
  userY: { y: canvasHeight / 2 - 50, score: 0 } as Player,
  ball: {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
  } as Ball,
};

let userYInput = { up: false, down: false };

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
                    matchId: "",
					side: ""
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

			if (data.type == "MOVE_PADDLE") {

				const player = connectedRoom.get(data.id);
				const input = data.payload;
				if (player) {
					playerInputs.set(player.id, input);
				}

			}


        });
    })
});

function resetBall() {
  gameState.ball.x = canvasWidth / 2;
  gameState.ball.y = canvasHeight / 2;
  gameState.ball.speed = 5;
  gameState.ball.velocityX = -gameState.ball.velocityX;
}

function collision(ball: Ball, playerY: number): boolean {
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;
  const playerTop = playerY;
  const playerBottom = playerY + 100;

  return ballBottom > playerTop && ballTop < playerBottom;
}

function updateGame() {
  const ball = gameState.ball;
  const paddleSpeed = 7;

  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

 for (const [id, input] of playerInputs.entries()) {
  const player = connectedRoom.get(id);
  if (!player || player.status !== 'GAME_ROOM') continue;

  const paddleSpeed = 7;
  const side = player.side;

  if (side === 'left') {
    if (input.up && gameState.userX.y > 0) gameState.userX.y -= paddleSpeed;
    if (input.down && gameState.userX.y < canvasHeight - 100) gameState.userX.y += paddleSpeed;
  } else if (side === 'right') {
    if (input.up && gameState.userY.y > 0) gameState.userY.y -= paddleSpeed;
    if (input.down && gameState.userY.y < canvasHeight - 100) gameState.userY.y += paddleSpeed;
  }
}


  // Wall collision
  if (ball.y + ball.radius > canvasHeight || ball.y - ball.radius < 0) {
    ball.velocityY = -ball.velocityY;
  }

  // Paddle collision
  const player = ball.x < canvasWidth / 2 ? gameState.userX : gameState.userY;
  const playerX = ball.x < canvasWidth / 2 ? 10 : canvasWidth - 20;

  if (
    ball.x + ball.radius > playerX &&
    collision(ball, player.y)
  ) {
    const collidePoint = ball.y - (player.y + 50);
    const normalized = collidePoint / 50;
    const angle = normalized * Math.PI / 4;
    const direction = ball.x < canvasWidth / 2 ? 1 : -1;

    ball.velocityX = direction * ball.speed * Math.cos(angle);
    ball.velocityY = ball.speed * Math.sin(angle);

    if (ball.speed < 10) ball.speed += 0.5;
  }

  // Score
  if (ball.x - ball.radius < 0) {
    gameState.userY.score++;
    resetBall();
  } else if (ball.x + ball.radius > canvasWidth) {
    gameState.userX.score++;
    resetBall();
  }
}


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
		playerY.side = 'rigth';

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

setInterval(() => {
  updateGame();
  const payload = {
    type: 'state',
    payload: {
      ball: gameState.ball,
      players: {
        userX: gameState.userX,
        userY: gameState.userY,
      },
    },
  };

  const message = JSON.stringify(payload);
  fastify.websocketServer.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}, 1000 / 60);


fastify.listen({ port: 3000, host: '0.0.0.0' }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
