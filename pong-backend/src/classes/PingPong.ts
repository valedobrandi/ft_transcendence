import { eventsBus, events } from "../events/EventsBus.js";
import { print } from "../server.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { gameRoom } from "../state/gameRoom.js";
import { SettingsType, userGameStateType } from "../types/GameStateType.js";
import { PlayerType } from "../types/PlayerType.js";

export type DifficultyLevel = 'HIGH' | 'MEDIUM' | 'LOW';


export type GameSettings = {
	IA: boolean;
	score: DifficultyLevel;
	ball: { size: DifficultyLevel; speed: DifficultyLevel;};
	paddle: { size: DifficultyLevel; speed: DifficultyLevel;};
};

export const gameSettings = {
	IA: false,
	score: { 'HIGH': 6, 'MEDIUM': 4,'LOW': 2 },
	ball: { 
		size: {'HIGH': 0.014,'MEDIUM': 0.009,'LOW': 0.005},
		speed: {'HIGH': 0.006,'MEDIUM': 0.004,'LOW': 0.002},
	},
	paddle: {
		height: {'HIGH': 0.200,'MEDIUM': 0.150,'LOW': 0.100},
		speed: {'HIGH': 0.015,'MEDIUM': 0.010,'LOW': 0.005}
	},
};

/* const defaultGameState: userGameStateType = {
	userX: { x: 0.01, y: 0.5, score: 0 },
	userY: { x: 0.99, y: 0.5, score: 0 },
	ball: {
		x: 0.5,
		y: 0.5,
		radius: 0.007,
		speed: 0.004,
		velocityX: 0.004,
		velocityY: 0,
	},
	paddle: {
		height: 0.150,
		speed: 0.010,
	},
	score: 2,
	IA: false,
}; */

class PingPong {
	machId: string;
	tournamentId: string | undefined;
	playerConnectionInfo = new Map<string, { disconnect: boolean }>();
	inputs: Map<string, { up: boolean; down: boolean }>;
	gameState: userGameStateType;
	winnerId: string | undefined = undefined;
	loserId: string | undefined = undefined;
	drawMatch: boolean = false;
	side: { RIGHT: string, LEFT: string };
	matchState: 'COUNTDOWN' | 'PLAYING' | 'ENDED' = 'COUNTDOWN';
	lastAIUpdate = 0;
	aiUpdateInterval = 1000;
	INITIAL_BALL_SPEED: number = 0.006;
	WIN_SCORE: number = 2;
	BALL_RADIUS: number = 0.006;
	PADDLE_SPEED: number = 0.010;
	PADDLE_HEIGHT: number = 0.150;
	IA: boolean = false;
	private PADDLE_WIDTH: number = 0.01;
	private aiDecisionTime: number = 0;
	private aiTargetY: number = 0.5;
	private AI_PERCEPTION_DELAY: number = 1000;
	

	constructor(id: string, settings?: SettingsType) {
		this.machId = id;
		this.tournamentId = undefined;
		this.inputs = new Map<string, { up: boolean; down: boolean }>();
		this.side = { RIGHT: "", LEFT: "" };
		//this.gameState = this.setSettings(settings);
		this.gameState = this.setSettings(settings);
	}

	setSettings(settings: SettingsType | undefined): userGameStateType {

		if (settings) {
			print(`[SETTINGS APPLIED]: ${JSON.stringify(settings)}`);
			this.WIN_SCORE = settings.score;
			this.INITIAL_BALL_SPEED = settings.ball.speed;
			this.BALL_RADIUS = settings.ball.size;
			this.PADDLE_SPEED = settings.paddle.speed;
			this.PADDLE_HEIGHT = settings.paddle.height;
			this.IA = settings.IA;
		}

		const gameState: userGameStateType = {
			userX: { x: 0.01, y: 0.5, score: 0 },
			userY: { x: 0.99, y: 0.5, score: 0 },
			ball: {
				x: 0.5,
				y: 0.5,
				radius: this.BALL_RADIUS,
				speed: this.INITIAL_BALL_SPEED,
				velocityX: this.INITIAL_BALL_SPEED * 1,
				velocityY: 0,
			},
			IA: this.IA

		};
		
		
		return gameState;
		
	}
	
	updateAI(nowMs: number) {
		const ball = this.gameState.ball;

		// IA Paddle
		const aiPaddle = this.gameState.userY;    
		const aiX = aiPaddle.x;
		const halfPaddleHeight = this.PADDLE_HEIGHT / 2;

		let up = false;
		let down = false;

		// 1. Every ~1 second: take a fresh look and decide a new target
		if (nowMs - this.aiDecisionTime >= this.AI_PERCEPTION_DELAY) {
			this.aiDecisionTime = nowMs;

			// Only react when ball is coming toward the AI
			if (ball.velocityX > 0 && ball.x < aiX) {
				// Predict where the ball will be when it reaches the paddle line
				let predictedY = this.predictBallYAtX(
					ball.x,
					ball.y,
					ball.velocityX,
					ball.velocityY,
					aiX
				);



				// === OFFENSE ADJUSTMENT ===

				let offesiveOffset = 0;

				if (Math.random() < 0.4) {
					const oppY = this.gameState.userX.y;

					// Angle +1up -1down 0straight
					let direction = 0;
					if (oppY < 0.35) {
						direction = -1;
					} else if (oppY > 0.65) {
						direction = 1;
					} else {
						direction = (Math.random() < 0.5) ? -1 : 1;
					}

					const aggressiveness = 0.7 + Math.random() * 0.2;
					offesiveOffset = direction * aggressiveness * halfPaddleHeight;
				}

				// Small random imperfection so it’s not god-like (optional but recommended)
				const error = (Math.random() - 0.5) * 0.05; 
				predictedY += offesiveOffset + error;

				this.aiTargetY = Math.max(halfPaddleHeight, Math.min(1 - halfPaddleHeight, predictedY));
			}
			else {
				this.aiTargetY = 0.5; // il faut garder!!!
			}
		}

		// 2. Every frame: blindly move toward the last decided target
		const paddleCenter = aiPaddle.y;
		const threshold = 0.01;

		if (paddleCenter < this.aiTargetY - threshold) {
			down = true;
		} else if (paddleCenter > this.aiTargetY + threshold) {
			up = true;
		}

		this.inputs.set('PONG-IA', { up, down });
	}

	private predictBallYAtX(
		startX: number,
		startY: number,
		vx: number,
		vy: number,
		targetX: number
	): number {
		// safety
		if (vx <= 0) return 0.5; 

		const totalTime = (targetX - startX) / vx;
		if (totalTime <= 0) return startY;

		// Unroll the vertical position with perfect reflection math
		// This formula works for ANY number of bounces without loops!
		const period = 2; // because 0 → 1 → 0 is one full cycle (distance 2 in normalized space)
		const distance = vy * totalTime;

		// Position in the "unfolded" space
		let unfoldedY = startY + distance;

		// Fold it back into [0,1] with perfect reflection
		let normalized = unfoldedY % period;
		if (normalized < 0) normalized += period;

		if (normalized > 1) {
			normalized = 2 - normalized; // reflect over top
		}

		return Math.max(0, Math.min(1, normalized));
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
			// allow AI (e.g. 'PONG-IA') to control paddle even if it's not a connected user
			if (!connected && id !== 'PONG-IA') continue;
			if (id === this.side.LEFT) {
				if (input.up && this.gameState.userX.y > 0 + (this.PADDLE_HEIGHT / 2)) {
					this.gameState.userX.y -= this.PADDLE_SPEED;
				}
				if (input.down && this.gameState.userX.y < 1 - (this.PADDLE_HEIGHT / 2)) {
					this.gameState.userX.y += this.PADDLE_SPEED;
				}
			} else if (id === this.side.RIGHT) {
				if (input.up && this.gameState.userY.y > 0 + (this.PADDLE_HEIGHT / 2)) {
					this.gameState.userY.y -= this.PADDLE_SPEED;
				}
				if (input.down && this.gameState.userY.y < 1 - (this.PADDLE_HEIGHT / 2)) {
					this.gameState.userY.y += this.PADDLE_SPEED;
				}
			}
		}

		
		// Wall collision
		if (ball.y + ball.radius > 1 || ball.y - ball.radius < 0) {
			ball.velocityY = -ball.velocityY;
		}
		
		// Paddle collision
		const player = ball.x < 0.5 ? this.gameState.userX : this.gameState.userY;
		const playerX = ball.x < 0.5 ? 0.01 : 0.99;
		
		const paddleLeftX  = playerX - this.PADDLE_WIDTH / 2;
		const paddleRightX = playerX + this.PADDLE_WIDTH / 2;
		
		const prevX = ball.x - ball.velocityX;
		const prevY = ball.y - ball.velocityY;

		const paddleTop = player.y - (this.PADDLE_HEIGHT / 2);
		const paddleBottom = player.y + (this.PADDLE_HEIGHT / 2);

		if (
			ball.x + ball.radius >= paddleLeftX &&
			ball.x - ball.radius <= paddleRightX &&
			ball.y + ball.radius >= paddleTop &&
			ball.y - ball.radius <= paddleBottom
		) {
			const t = ( (ball.velocityX > 0 ? paddleLeftX : paddleRightX) - prevX ) / (ball.x - prevX);
			const intersectY = prevY + (ball.y - prevY) * t;

			if (intersectY + ball.radius >= paddleTop && intersectY - ball.radius <= paddleBottom) {
					const collidePoint = (ball.y - player.y) / (this.PADDLE_HEIGHT / 2);
					const clamped = Math.max(-1, Math.min(1, collidePoint));
					const maxBounceAngle = Math.PI / 4;
					const bounceAngle = clamped * maxBounceAngle;
					const speed = ball.speed;
					const direction = ball.x < 0.5 ? 1 : -1;

					ball.velocityX = direction * speed * Math.cos(bounceAngle);
					ball.velocityY = speed * Math.sin(bounceAngle);
				
					if (ball.speed < 0.008) {
						ball.speed = Math.min(ball.speed + 0.0005, 0.02);
					}
					ball.x = (direction < 0 ? paddleLeftX : paddleRightX) + direction * ball.radius;
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
				paddleHeight: this.PADDLE_HEIGHT,
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

	notifyPaddleSettings() {
		const payload = {
			message: 'PADDLE_HEIGHT',
			payload: {
				height: this.PADDLE_HEIGHT,
				width: this.PADDLE_WIDTH,
			},
		};

		const message = JSON.stringify(payload);
		for (const [id, { disconnect }] of this.playerConnectionInfo) {
			const connected = this.getFromConnectedRoom(id);
			if (!connected) continue;
			if (connected.socket) {
				connected.socket.send(message);
			}
		}
	}

	setTournamentId(tournamentId: string) {
		this.tournamentId = tournamentId;
	}

	createMatchIA(humanId: string, aiId: string)
	{
		this.add(humanId);

		this.add(aiId);

		gameRoom.set(this.machId, this);
		const isConnect = this.getFromConnectedRoom(humanId);
		if (isConnect) {
			isConnect.status = 'GAME_ROOM';
		}
		this.side.LEFT = aiId;
		this.side.RIGHT = humanId;

		this.messages("MATCH_CREATED");
		this.messages("COUNTDOWN");

		print(`[MATCH CREATED]: ${this.machId} between ${humanId} and ${aiId}`);
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
		this.notifyPaddleSettings();
		this.messages("COUNTDOWN");

		print(`[MATCH CREATED]: ${this.machId} between ${playerXId} and ${playerYId}`);
	}

	disconnect(playerId: string) {
		if (this.matchState === 'ENDED') return;
		const player = this.playerConnectionInfo.get(playerId);
		if (player) player.disconnect = true;
	}

	handleMatch() {
		const isDisconnected = [
			connectedRoomInstance.getByUsername(this.side.LEFT),
			connectedRoomInstance.getByUsername(this.side.RIGHT),
		].every((connected) => connected === undefined);

		if (isDisconnected ||
			this.gameState.userX.score === this.WIN_SCORE ||
			this.gameState.userY.score === this.WIN_SCORE) {

			this.endMatch();
		}
	}

	update() {
		if (this.gameState.IA) {
			const nowMs = Date.now();
			this.updateAI(nowMs);
		}
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