import { eventsBus, events } from "../events/EventsBus.js";
import { print } from "../server.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { gameRoom } from "../state/gameRoom.js";
import { userGameStateType } from "../types/GameStateType.js";
import { PlayerType } from "../types/PlayerType.js";

const WIN_SCORE = 2
const PADDLE_HEIGHT = 0.150;
const PADDLE_SPEED = 0.010;
const BALL_RADIUS = 0.007;

class PingPong {
	machId: string;
	tournamentId: string | undefined;
	playerConnectionInfo = new Map<string, { disconnect: boolean }>();
	inputs: Map<string, { up: boolean; down: boolean }>;
	INITIAL_BALL_SPEED: number = 0.004;
	gameState: userGameStateType;
	winnerId: string | undefined = undefined;
	loserId: string | undefined = undefined;
	drawMatch: boolean = false;
	side: { RIGHT: string, LEFT: string };
	matchState: 'COUNTDOWN' | 'PLAYING' | 'ENDED' = 'COUNTDOWN';

	constructor(id: string) {
		this.machId = id;
		this.tournamentId = undefined;
		this.inputs = new Map<string, { up: boolean; down: boolean }>();
		this.side = { RIGHT: "", LEFT: "" };
		this.gameState = {
			userX: { x: 0.01, y: 0.5, score: 0 },
			userY: { x: 0.99, y: 0.5, score: 0 },
			ball: {
				x: 0.5,
				y: 0.5,
				radius: BALL_RADIUS,
				speed: this.INITIAL_BALL_SPEED,
				velocityX: this.INITIAL_BALL_SPEED * 1,
				velocityY: 0,
			},
		};
	}

	getFromConnectedRoom(username: string): PlayerType | undefined {
		//print(`[GAME GET PLAYER]: ${username}`);
		return connectedRoomInstance.getByUsername(username) || undefined;
	}

	resetBall(side: 'LEFT' | 'RIGHT' = 'LEFT') {
		this.gameState.ball.x = 0.5;
		this.gameState.ball.y = 0.5;
		this.gameState.ball.speed = this.INITIAL_BALL_SPEED;
		const direction = side === 'LEFT' ? -1 : 1;
		this.gameState.ball.velocityX = this.INITIAL_BALL_SPEED * direction;
		this.gameState.ball.velocityY = 0;
	}

	updateGame() {
		if (this.matchState === 'COUNTDOWN') {
			this.matchState = 'PLAYING'
			this.resetBall('LEFT');
		}
		const ball = this.gameState.ball;

		ball.x += ball.velocityX;
		ball.y += ball.velocityY;

		for (const [id, input] of this.inputs.entries()) {
			const connected = this.getFromConnectedRoom(id);
			if (!connected) continue;
			if (id === this.side.LEFT) {
				if (input.up && this.gameState.userX.y > 0 + (PADDLE_HEIGHT / 2)) this.gameState.userX.y -= PADDLE_SPEED;
				if (input.down && this.gameState.userX.y < 1 - (PADDLE_HEIGHT / 2)) this.gameState.userX.y += PADDLE_SPEED;
			} else if (id === this.side.RIGHT) {
				if (input.up && this.gameState.userY.y > 0 + (PADDLE_HEIGHT / 2)) this.gameState.userY.y -= PADDLE_SPEED;
				if (input.down && this.gameState.userY.y < 1 - (PADDLE_HEIGHT / 2)) this.gameState.userY.y += PADDLE_SPEED;
			}
		}

		// Wall collision
		if (ball.y + ball.radius > 1 || ball.y - ball.radius < 0) {
			ball.velocityY = -ball.velocityY;
		}

		// Paddle collision
		const player = ball.x < 0.5 ? this.gameState.userX : this.gameState.userY;
		const playerX = ball.x < 0.5 ? 0.01 : 0.99;

		const ballTop = ball.y - ball.radius;
		const ballBottom = ball.y + ball.radius;
		const paddleTop = player.y - (PADDLE_HEIGHT / 2);
		const paddleBottom = player.y + (PADDLE_HEIGHT / 2);

		if (
			Math.abs(ball.x - playerX) < ball.radius &&
			ballBottom >= paddleTop &&
			ballTop <= paddleBottom
		) {
			//const paddleCenter = player.y + PADDLE_HEIGHT / 2;
			const collidePoint = (ball.y - player.y) / (PADDLE_HEIGHT / 2);
			//const normalized = collidePoint / (PADDLE_HEIGHT / 2);
			const clamped = Math.max(-1, Math.min(1, collidePoint));

			const maxBounceAngle = Math.PI / 4;

			// Map collision point to bounce angle
			// Map to a fixed vertical velocity range
			// const maxVerticalSpeed = ball.speed * 0.75;
			// ball.velocityY = clamped * maxVerticalSpeed;

			const bounceAngle = clamped * maxBounceAngle;
			const speed = ball.speed;

			// Horizontal always goes full speed
			const direction = ball.x < 0.5 ? 1 : -1;
			//ball.velocityX = direction * Math.sqrt(ball.speed ** 2 - ball.velocityY ** 2);

			ball.velocityX = direction * speed * Math.cos(bounceAngle);
    		ball.velocityY = speed * Math.sin(bounceAngle);

			if (ball.speed < 0.008) {
				ball.speed = Math.min(ball.speed + 0.0005, 0.02);
			}
		}

		// Score
		if (ball.x - ball.radius < 0) {
			this.resetBall('RIGHT');
			this.gameState.userY.score++;
		} else if (ball.x + ball.radius > 1) {
			this.resetBall('LEFT');
			this.gameState.userX.score++;
		}
	}

	endMatch() {
		if (this.matchState === 'ENDED') return;
		this.matchState = 'ENDED';

		const [playerXScore, playerYScore] = [this.gameState.userX.score, this.gameState.userY.score];
		// Compare de score and set winner and loser
		if (playerXScore > playerYScore) {
			this.winnerId = this.side.LEFT;
			this.loserId = this.side.RIGHT;
		} else if (playerXScore < playerYScore) {
			this.winnerId = this.side.RIGHT;
			this.loserId = this.side.LEFT;
		} else {
			this.loserId = this.side.RIGHT;
			this.winnerId = this.side.LEFT;
			this.drawMatch = true;
		}

		this.saveMatchHistory(playerXScore, playerYScore);

		print(`[GAME OVER] Winner: ${this.winnerId}`);

		this.messages("GAME_OVER");

		if (this.tournamentId) {
			if (this.winnerId) {
				const playerWinner = this.getFromConnectedRoom(this.winnerId);
				if (playerWinner) playerWinner.status = 'TOURNAMENT_ROOM';
			}
			if (this.loserId) {
				const playerLoser = this.getFromConnectedRoom(this.loserId);
				if (playerLoser) {
					playerLoser.status = 'CONNECT_ROOM';
					if (playerLoser.socket) {
						playerLoser.socket.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
					}
				}
			}
			events.emit('tournament_match_end', {
				matchId: this.machId,
				winnerId: this.winnerId,
				loserId: this.loserId,
				tournamentId: this.tournamentId,
				timeout: this.drawMatch
			})
		} else {
			for (const [id, { disconnect }] of this.playerConnectionInfo) {
				const connected = this.getFromConnectedRoom(id);
				if (!connected) continue;
				connected.status = 'CONNECT_ROOM';
				if (connected.socket) {
					connected.socket.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
				}
			};
		}

		gameRoom.delete(this.machId);
	}

	updatePlayerInput(playerId: string, input: { up: boolean; down: boolean }) {
		if (this.inputs.has(playerId)) {
			this.inputs.set(playerId, input);
		}
	}

	add(username: string) {
		this.playerConnectionInfo.set(username, { disconnect: false });
		this.inputs.set(username, { up: false, down: false });
	}

	send() {
		const payload = {
			message: 'STATE',
			payload: {
				ball: this.gameState.ball,
				players: {
					userX: this.gameState.userX,
					userY: this.gameState.userY,
				},
			},
		};

		const message = JSON.stringify(payload);
		for (const [id, { disconnect }] of this.playerConnectionInfo) {
			const connected = this.getFromConnectedRoom(id);
			if (!connected) continue;
			if (connected && connected.socket && connected.socket.readyState === 1) {
				connected.socket.send(message);
			}
		}

	}

	setTournamentId(tournamentId: string) {
		this.tournamentId = tournamentId;
	}

	createMatch(playerXId: string, playerYId: string) {

		this.add(playerXId);
		this.add(playerYId);

		gameRoom.set(this.machId, this);

		for (const [id, { disconnect }] of this.playerConnectionInfo) {
			const isConnect = this.getFromConnectedRoom(id);
			if (isConnect) {
				isConnect.status = 'GAME_ROOM';
			}
		};

		this.side.LEFT = playerXId;
		this.side.RIGHT = playerYId;

		this.messages("MATCH_CREATED");
		this.messages("COUNTDOWN");

		print(`[MATCH CREATED]: ${this.machId} between ${playerXId} and ${playerYId}`);
	}

	disconnect(playerId: string) {
		if (this.matchState === 'ENDED') return;
		const player = this.playerConnectionInfo.get(playerId);
		if (player) player.disconnect = true;
	}

	handleMatch() {
		const isDisconnected = [...this.playerConnectionInfo.values()]
			.every(({ disconnect }) => disconnect)

		if (isDisconnected ||
			this.gameState.userX.score === WIN_SCORE ||
			this.gameState.userY.score === WIN_SCORE) {

			this.endMatch();
		}
	}

	update() {
		this.updateGame();
		this.handleMatch();
		this.send();
	}

	startGame() {
		const FRAME_DURATION = 1000 / 60;
		let lastTime = process.hrtime.bigint();

		const run = () => {
			if (this.matchState === "ENDED") return;

			const now = process.hrtime.bigint();
			const delta = Number(now - lastTime) / 1e6;

			if (delta >= FRAME_DURATION) {
				lastTime = now;
				this.update();
			}

			setImmediate(run);
		};
		run();
	}

	saveMatchHistory(score1: number, score2: number) {
		eventsBus.emit('game:savehistory', {
			matchId: this.machId,
			player1: this.side.LEFT,
			player2: this.side.RIGHT,
			score1: score1,
			score2: score2,
		});
	}


	messages(type: string) {
		const [leftId, rightId] = Array.from(this.playerConnectionInfo.keys());
		switch (type) {
			case "MATCH_CREATED":
				for (const [id, { disconnect }] of this.playerConnectionInfo) {
					const connected = this.getFromConnectedRoom(id);
					if (!connected) continue;
					connected.status = 'GAME_ROOM';
					connected.matchId = this.machId;

					const side = id === leftId ? 'LEFT' : 'RIGHT';
					if (!connected.socket) continue;
					connected.socket.send(JSON.stringify({
						status: 200,
						message: 'GAME_ROOM',
						payload: { message: `${leftId} vs ${rightId}` },
						side: side,
						id: connected.id
					}));
				};
				break;
			case "GAME_OVER":

				for (const [id, { disconnect }] of this.playerConnectionInfo) {
					const connected = this.getFromConnectedRoom(id);
					print(`[GAME OVER] Sending GAME_OVER to ${id}`);
					if (!connected || !connected.socket) continue;
					connected.socket.send(JSON.stringify({
						status: 200,
						message: 'GAME_OVER',
						payload: {
							winner: this.winnerId,
							drawMatch: this.drawMatch,
							message: this.drawMatch ? 'DRAW MATCH!' :
								this.winnerId === connected.username ? 'YOU WIN!' : 'YOU LOSE!'
						},
						finalScore: {
							userX: this.gameState.userX.score,
							userY: this.gameState.userY.score,
						}
					}));
				};
				break;
			case "COUNTDOWN":
				const conter = { time: 10 };
				const countdownInterval = setInterval(() => {
					for (const [id, { disconnect }] of this.playerConnectionInfo) {
						const connected = this.getFromConnectedRoom(id);
						if (!connected) continue;
						if (!connected.socket) continue;
						this.send();
						connected.socket.send(JSON.stringify({
							status: 200,
							message: 'COUNTDOWN',
							payload: { seconds: conter.time }
						}));
					};

					if (conter.time <= 0) {
						clearInterval(countdownInterval);
						this.startGame();
					}
					conter.time--;
				}, 1000);
				break;
		}
	}

}

export { PingPong };