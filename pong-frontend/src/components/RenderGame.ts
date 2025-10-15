import { socket } from "../app";
import { setActiveCanvas } from "../events/resizeManager";
import type { BallType } from "../interface/ball";
import type { drawCircleType } from "../interface/drawCircle";
import type { DrawRectType } from "../interface/drawRect";
import type { DrawTextType } from "../interface/drawText";
import type { GameStateType } from "../interface/GameStateType";
import type { NetType } from "../interface/net";
import type { PlayerType } from "../interface/player";


export function RenderGame(): HTMLElement {

    let currentState: GameStateType | null = null;
    let previousState: GameStateType | null = null;
    let lastUpdateTime = performance.now();
    const SERVER_TICK_RATE = 60; 
    const INTERPOLATION_DELAY = 1000 / SERVER_TICK_RATE;

    const canvasElement = document.createElement("canvas");
    const ctx = canvasElement.getContext("2d");
    canvasElement.id = "pong";
    canvasElement.width = 1200;
    canvasElement.height = 600;
    canvasElement.className = "border-4 border-blue-500 bg-black my-4";
    const paddleHeight = 0.166;

    setActiveCanvas(canvasElement);

    const netWidth = Math.max(2, Math.min(canvasElement.width * 0.002, 6));
    const net: NetType = {
        x: canvasElement.width / 2 - netWidth / 2,
        y: 0,
        width: netWidth,
        height: 10,
        color: "white"
    }

    function resizeCanvas() {
        const aspect = 2 / 1;
        const parent = canvasElement.parentElement || document.body;
        let width = parent.clientWidth;
        let height = parent.clientHeight;

        if (width / height > aspect) {
            width = height * aspect;
        } else {
            height = width / aspect;
        }

        canvasElement.style.width = `${width}px`;
        canvasElement.style.height = `${height}px`;
    }

    function drawNet({ x, y, width, height, color }: NetType) {
        for (let i = 0; i <= canvasElement.height; i += 15) {
            drawRect({ x: x, y: y + i, w: width, h: height, color: color });
        }
    }

    function drawRect({ x, y, w, h, color }: DrawRectType) {
        if (!ctx) {
            return console.error('Error: drawRect.');
        }
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }


    function drawCircle({ x, y, r, color }: drawCircleType) {
        if (!ctx) {
            return console.error('Error: drawCircle');
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    }


    function drawText({ text, x, y, color }: DrawTextType) {
        if (!ctx) {
            return console.error('Error: drawText.');
        }
        ctx.fillStyle = color;
        ctx.font = "45px Verdana";
        ctx.fillText(text.toString() || '0', x, y);
    }

    drawText({ text: 0, x: 300, y: 200, color: "white" });

    function render(ball: BallType, userX: PlayerType, userY: PlayerType) {
        const scaleX = canvasElement.width;
        const scaleY = canvasElement.height;
        drawRect({ x: 0, y: 0, w: scaleX, h: scaleY, color: "black" });

        drawNet(net);

        drawText({ text: userX.score, x: scaleX / 4, y: scaleY / 5, color: "white" });
        drawText({ text: userY.score, x: 3 * scaleX / 4, y: scaleY / 5, color: "white" });

        drawRect({ x: userX.x * scaleX, y: userX.y * scaleY - paddleHeight / 2, w: 10, h: 100, color: "white" });
        drawRect({ x: userY.x * scaleX - 10, y: userY.y * scaleY - paddleHeight / 2, w: 10, h: 100, color: "white" });

        const ballRadius = Math.min(ball.radius * ((scaleX + scaleY) / 2), 8);
        drawCircle({ x: ball.x * scaleX, y: ball.y * scaleY, r: ballRadius, color: "white" });
    }

    socket.onmessage = (event) => {
        const { type, payload } = JSON.parse(event.data);
        if (type === "state") {
            previousState = currentState ? structuredClone(currentState) : payload;
            currentState = payload;
            lastUpdateTime = performance.now();
        }
    };

    function interpolate(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    function renderLoop() {
        if (previousState && currentState) {
            const now = performance.now();
            const delta = now - lastUpdateTime;

            const t = Math.min(delta / INTERPOLATION_DELAY, 1);

            const interpBall = {
                x: interpolate(previousState.ball.x, currentState.ball.x, t),
                y: interpolate(previousState.ball.y, currentState.ball.y, t),
                radius: currentState.ball.radius,
                speed: currentState.ball.speed,
                velocityX: currentState.ball.velocityX,
                velocityY: currentState.ball.velocityY,
                color: currentState.ball.color,
            };

            const interpUserX = {
                ...currentState.players.userX,
                y: interpolate(previousState.players.userX.y, currentState.players.userX.y, t),
            };
            const interpUserY = {
                ...currentState.players.userY,
                y: interpolate(previousState.players.userY.y, currentState.players.userY.y, t),
            };

            render(interpBall, interpUserX, interpUserY);
        } else if (currentState) {
            const { ball, players } = currentState;
            render(ball, players.userX, players.userY);
        }
        requestAnimationFrame(renderLoop);
    }

    function botPlayer() {
        if (!currentState) return;
        const ballY = currentState.ball.y;
        // Get the player paddle position
        const paddleY = currentState.players.userY.y;

        const tolerance = 0.03;
        const input = { up: false, down: false };
        if (paddleY + paddleHeight / 2 < ballY - tolerance) {
            input.down = true;
        } else if (paddleY + paddleHeight / 2 > ballY + tolerance) {
            input.up = true;
        }
        socket.send(JSON.stringify({ type: "input", payload: input }));
        setTimeout(botPlayer, 1000 / SERVER_TICK_RATE);
        
    }

    requestAnimationFrame(renderLoop);
    requestAnimationFrame(resizeCanvas);
    setTimeout(botPlayer, 1000);
    return canvasElement;
}



