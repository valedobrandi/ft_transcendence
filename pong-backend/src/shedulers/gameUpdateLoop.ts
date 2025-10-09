import { updateGame } from "../pong_game/updateGame.js";
import { fastify } from "../server.js";
import { gameState } from "../state/gameInitState.js";

export function startGameLoop() {
    if (!fastify.websocketServer) {
        return;
    }
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
}