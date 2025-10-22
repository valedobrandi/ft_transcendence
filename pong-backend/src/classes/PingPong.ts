import { connect } from "http2";
import { gameEvents } from "../events/gameEvents.js";
import { gameRoom } from "../state/gameRoom.js";
import { userGameStateType } from "../types/GameStateType.js";
import { PlayerType } from "../types/PlayerType.js";
import { connectedRoom } from "../state/connectedRoom.js";

class PingPong {
    machId: string;
    tournamentId: string | undefined;
    playersIds: Set<string>;
    inputs: Map<string, { up: boolean; down: boolean }>;
    readyPlayer: Set<string> = new Set();
    interval: NodeJS.Timeout | null;
    initialBallSpeed: number = 0.003;
    gameState: userGameStateType;
    winner: string | undefined = undefined;
    loser: string | undefined = undefined;
    side: {RIGHT: string, LEFT: string};
    matchState: 'PAUSE' | 'PLAYING' | 'ENDED' = 'PAUSE';

    constructor(id: string) {
        this.machId = id;
        this.tournamentId = undefined;
        this.playersIds = new Set<string>();
        this.inputs = new Map<string, { up: boolean; down: boolean }>();
        this.interval = null;
        this.side = {RIGHT: "", LEFT: ""};
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

    getPlayer(id: string): PlayerType | undefined {
        return connectedRoom.get(id) || undefined;
    }

    resetBall(side: 'LEFT' | 'RIGHT' = 'LEFT') {
        this.gameState.ball.x = 0.5;
        this.gameState.ball.y = 0.5;
        this.gameState.ball.speed = this.initialBallSpeed;
        const direction = side === 'LEFT' ? -1 : 1;
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
            const player = this.getPlayer(id);
            if (!player) continue;
            if (id === this.side.LEFT) {
                if (input.up && this.gameState.userX.y > 0) this.gameState.userX.y -= paddleSpeed;
                if (input.down && this.gameState.userX.y < 1 - paddleHeight) this.gameState.userX.y += paddleSpeed;
            } else if (id === this.side.RIGHT) {
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
            this.endMatch();
        }
    }



    endMatch() {

        this.matchState = 'ENDED';

        const getMatchWinner = this.gameState.userX.score === 5 ? 'LEFT' : 'RIGHT';

        if (getMatchWinner === 'LEFT') {
            this.winner = this.side.LEFT;
            this.loser = this.side.RIGHT;
        } else {
            this.winner = this.side.RIGHT;
            this.loser = this.side.LEFT;
        }

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.messages("game over");

        if (this.tournamentId) {
            if (this.winner) {
                const playerWinner = this.getPlayer(this.winner);
                if (playerWinner) {
                    playerWinner.status = 'TOURNAMENT_ROOM';
                    gameEvents.emit('matchEnded', {
                        matchId: this.machId,
                        winner: this.winner,
                        loser: this.loser,
                        tournamentId: this.winner ? playerWinner.tournamentId : undefined
                    })
                }
            }
            if (this.loser) {
                const playerLoser = this.getPlayer(this.loser);
                if (playerLoser) {
                    playerLoser.status = 'CONNECT_ROOM';
                    playerLoser.socket.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
                }
            }
        } else {
            this.playersIds.forEach((id) => {
                const player = this.getPlayer(id);
                if (!player) return;
                player.status = 'CONNECT_ROOM';
                player.socket.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
            });
        }

        gameRoom.delete(this.machId);
    }

    update() {
        this.updateGame();
        this.send();
    }

    updatePlayerInput(playerId: string, input: { up: boolean; down: boolean }) {
        if (this.playersIds.has(playerId)) {
            this.inputs.set(playerId, input);
        }
    }

    add(id: string) {
        this.playersIds.add(id);
        this.inputs.set(id, { up: false, down: false });
    }

    setPlayerReady(playerId: string) {
        
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
        for (const id of this.playersIds.values()) {
            const player = this.getPlayer(id);
            if (!player) continue;
            if (player.socket.readyState === 1) {
                player.socket.send(message);
            }
        }

    }

    setTournamentId(tournamentId: string) {
        this.tournamentId = tournamentId;
    }

    createMatch(playerXId: string, playerYId: string) {

        this.playersIds.add(playerXId);
        this.playersIds.add(playerYId);

        gameRoom.set(this.machId, this);

        this.playersIds.forEach((id: string) => {
            const isConnect = this.getPlayer(id);
            if (isConnect) {
                isConnect.status = 'GAME_ROOM';
            }
        });

        this.side.LEFT = playerXId;
        this.side.RIGHT = playerYId;

        this.messages("match created");

        this.send();

        this.messages("countdown");

        console.log(`Match created: ${this.machId} between ${playerXId} and ${playerYId}`);
    }

    messages(type: string) {
        const getArrayPlayers = Array.from(this.playersIds.values());
        getArrayPlayers.forEach((id, index) => {
            const player = this.getPlayer(id);
            if (!player) return;
            switch (type) {
                case "match created":
                    player.status = 'GAME_ROOM';
                    const side = id === this.side.LEFT ? 'LEFT' : 'RIGHT';
                    player.matchId = this.machId;

                    player.socket.send(JSON.stringify({
                        status: 200,
                        message: 'GAME_ROOM',
                        side: side,
                        id: player.id
                    }));

                    break;
                case "game over":
                    player.socket.send(JSON.stringify({
                        status: 200,
                        message: 'GAME_OVER',
                        winner: this.gameState.userX.score === 5 ? 'LEFT' : 'RIGHT',
                        finalScore: {
                            userX: this.gameState.userX.score,
                            userY: this.gameState.userY.score,
                        }
                    }));
                    break;
                case "countdown":
                    const conter = { time: 4 };
                    const interval = setInterval(() => {
                        player.socket.send(JSON.stringify({
                            status: 200,
                            message: 'COUNTDOWN',
                            seconds: conter.time
                        }));
                        if (conter.time == 0) {
                            this.interval = setInterval(() => this.update(), 1000 / 60);
                            clearInterval(interval)
                        }
                        conter.time--;
                    }, 1000)
                    break;
            }

        });
    }
}

export { PingPong };