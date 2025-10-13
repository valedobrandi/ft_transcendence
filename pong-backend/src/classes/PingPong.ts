import { gameEvents } from "../events/gameEvents.js";
import { gameRoom } from "../state/gameRoom.js";
import { userGameStateType } from "../types/GameStateType.js";
import { PlayerType } from "../types/PlayerType.js";

class PingPong {
    machId: string;
    players: Map<string, PlayerType>;
    inputs: Map<string, { up: boolean; down: boolean }>;
    readyPlayer: Set<string> = new Set();
    interval: NodeJS.Timeout | null;
    initialBallSpeed: number = 0.003;
    gameState: userGameStateType;
    matchState: 'PAUSE' | 'PLAYING' | 'ENDED' = 'PAUSE';

    constructor(id: string) {
        this.machId = id;
        this.players = new Map<string, PlayerType>();
        this.inputs = new Map<string, { up: boolean; down: boolean }>();
        this.interval = null;
        this.gameState = {
            userX: { x: 0.01, y: 0.5, score: 0 },
            userY: { x: 0.99, y: 0.5, score: 0 },
            ball: {
                x: 0.5,
                y: 0.5,
                radius: 0.02,
                speed: this.initialBallSpeed,
                velocityX: 0.01,
                velocityY: 0.01,
            },
        };
    }

    resetBall(side: 'LEFT' | 'RIGHT' = 'LEFT') {
        this.gameState.ball.x = 0.5;
        this.gameState.ball.y = 0.5;
        this.gameState.ball.speed = this.initialBallSpeed;
        const direction = side === 'LEFT' ? 1 : -1;
        this.gameState.ball.velocityX = this.initialBallSpeed * direction;
        this.gameState.ball.velocityY = 0;
    }

    updateGame() {
        if (this.matchState === 'PAUSE') {
            this.matchState = 'PLAYING';
            this.resetBall();
        }

        const ball = this.gameState.ball;

        const paddleHeight = 0.166;
        const paddleSpeed = 0.012;

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        for (const [id, input] of this.inputs.entries()) {
            const player = this.players.get(id);
            if (!player) continue;


            const side = player.side;

            if (side === 'LEFT') {
                if (input.up && this.gameState.userX.y > 0) this.gameState.userX.y -= paddleSpeed;
                if (input.down && this.gameState.userX.y < 1 - paddleHeight) this.gameState.userX.y += paddleSpeed;
            } else if (side === 'RIGHT') {
                if (input.up && this.gameState.userY.y > 0) this.gameState.userY.y -= paddleSpeed;
                if (input.down && this.gameState.userY.y < 1 - paddleHeight) this.gameState.userY.y += paddleSpeed;
            }
        }

        // Wall collision
        if (ball.y + ball.radius > 1 || ball.y - ball.radius < 0) {
            ball.velocityY = -ball.velocityY;
        }

        // Paddle collision
        const player = ball.x < 0.5 ? this.gameState.userX : this.gameState.userY;
        const playerX = ball.x < 0.5 ? 0.01 : 0.99;

        if (
            Math.abs(ball.x - playerX) < ball.radius &&
            ball.y > player.y && ball.y < player.y + paddleHeight
        ) {
            const collidePoint = ball.y - (player.y + paddleHeight / 2);
            const normalized = collidePoint / (paddleHeight / 2);
            const angle = normalized * Math.PI / 4;
            const direction = ball.x < 0.5 ? 1 : -1;

            ball.velocityX = direction * ball.speed * Math.cos(angle);
            ball.velocityY = ball.speed * Math.sin(angle);

            if (ball.speed < 0.08) {
                ball.speed += 0.0005;
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

        // End match
        if (this.gameState.userX.score === 5 || this.gameState.userY.score === 5) {
            const winner = this.gameState.userX.score === 5 ? 'LEFT' : 'RIGTH';
            const player = Array.from(this.players.values()).find(player => player.side === winner);
            this.endMatch(player);
        }
    }

    endMatch(winner: PlayerType| undefined) {
        this.matchState = 'ENDED';
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        for (const player of this.players.values()) {
            player.status = 'CONNECT_ROOM',
                player.socket.send(JSON.stringify({
                    status: 200,
                    message: 'GAME_OVER',
                    winner: this.gameState.userX.score === 5 ? 'LEFT' : 'RIGHT',
                    finalScore: {
                        userX: this.gameState.userX.score,
                        userY: this.gameState.userY.score,
                    }
                }));
        }
        if (winner == undefined) return;
        gameEvents.emit('matchEnded', {
            matchId: this.machId,
            winner,
            tournamentId: winner.tournamentId
        });
        gameRoom.delete(this.machId);

    }


    update() {
        this.updateGame();
        this.send();
    }

    updatePlayerInput(playerId: string, input: { up: boolean; down: boolean }) {
        if (this.players.has(playerId)) {
            this.inputs.set(playerId, input);
        }
    }

    add(player: PlayerType) {
        this.players.set(player.id, player);
        this.inputs.set(player.id, { up: false, down: false });
    }

    setPlayerReady(playerId: string) {
        this.readyPlayer.add(playerId);
        this.send();
        if (this.readyPlayer.size === 2) {
            this.startGame();
        }
    }

    startGame() {
        this.gameCountdown();
    }

    gameCountdown() {
        const conter = { time: 4 };
        const interval = setInterval(() => {
            for (const player of this.players.values()) {
                player.socket.send(JSON.stringify({
                    status: 200,
                    message: 'COUNTDOWN',
                    seconds: conter.time
                }));
            }
            if (conter.time == 0) {
                this.interval = setInterval(() => this.update(), 1000 / 60);
                clearInterval(interval)
            }
            conter.time--;
        }, 1000)
    }

    removePlayer(playerId: string) {
        this.players.delete(playerId);
        this.inputs.delete(playerId);
        if (this.players.size === 0 && this.interval) {
            clearInterval(this.interval);
        }
    }

    send() {
        const payload = {
            type: 'state',
            payload: {
                ball: this.gameState.ball,
                players: {
                    userX: this.gameState.userX,
                    userY: this.gameState.userY,
                },
            },
        };

        const message = JSON.stringify(payload);
        for (const player of this.players.values()) {
            if (player.socket.readyState === 1) {
                player.socket.send(message);
            }
        }
    }

    createMatch(playerX: PlayerType, playerY: PlayerType) {

        this.add(playerX);
        this.add(playerY);
        gameRoom.set(this.machId , this);

        [playerX, playerY].forEach((player, index) => {
            player.status = 'GAME_ROOM';
            player.side = index === 0 ? 'LEFT' : 'RIGHT';
            player.matchId = this.machId ;

            player.socket.send(JSON.stringify({
                status: 200,
                message: 'GAME_ROOM',
                side: player.side,
                id: player.id
            }));
        });

        console.log(`Match created: ${this.machId } between ${playerX.id} and ${playerY.id}`);
    }
}

export { PingPong };