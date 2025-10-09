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

const INITIAL_BALL_SPEED = 0.005;

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

const gameState = {
  userX: {x: 0.01, y: 0.5, score: 0 } as Player,
  userY: {x: 0.99, y: 0.5, score: 0 } as Player,
  ball: {
    x: 0.5,
    y: 0.5,
    radius: 0.02,
    speed: 0.01,
    velocityX: 0.01,
    velocityY: 0.01,
  } as Ball,
};


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
  gameState.ball.x = 0.5;
  gameState.ball.y = 0.5;
  gameState.ball.speed = INITIAL_BALL_SPEED;
  gameState.ball.velocityX = -INITIAL_BALL_SPEED;
  gameState.ball.velocityY = INITIAL_BALL_SPEED;
}

function updateGame() {
  const ball = gameState.ball;

  const paddleHeight = 0.166;
  const paddleSpeed = 0.012;

  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

 for (const [id, input] of playerInputs.entries()) {
  const player = connectedRoom.get(id);
  if (!player || player.status !== 'GAME_ROOM') continue;

  const side = player.side;

  if (side === 'left') {
    if (input.up && gameState.userX.y > 0) gameState.userX.y -= paddleSpeed;
    if (input.down && gameState.userX.y < 1-paddleHeight) gameState.userX.y += paddleSpeed;
  } else if (side === 'right') {
    if (input.up && gameState.userY.y > 0) gameState.userY.y -= paddleSpeed;
    if (input.down && gameState.userY.y < 1-paddleHeight) gameState.userY.y += paddleSpeed;
  }
}

  // Wall collision
  if (ball.y + ball.radius > 1 || ball.y - ball.radius < 0) {
    ball.velocityY = -ball.velocityY;
  }

  // Paddle collision
  const player = ball.x < 0.5 ? gameState.userX : gameState.userY;
  const playerX = ball.x < 0.5 ? 0.01 : 0.99;

  if (
    Math.abs(ball.x - playerX) < ball.radius &&
    ball.y > player.y && ball.y < player.y + paddleHeight
  ) {
    const collidePoint = ball.y - (player.y+paddleHeight/2);
    const normalized = collidePoint/(paddleHeight/2);
    const angle = normalized * Math.PI / 4;
    const direction = ball.x < 0.5 ? 1 : -1;

    ball.velocityX = direction * ball.speed * Math.cos(angle);
    ball.velocityY = ball.speed * Math.sin(angle);

    ball.speed += 0.0005;
  }

  // Score
  if (ball.x - ball.radius < 0) {
    gameState.userY.score++;
    resetBall();
  } else if (ball.x + ball.radius > 1) {
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
