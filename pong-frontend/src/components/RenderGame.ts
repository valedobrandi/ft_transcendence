import { setActiveCanvas } from "../events/resizeManager";
import type { BallType } from "../interface/ball";
import type { drawCircleType } from "../interface/drawCircle";
import type { DrawRectType } from "../interface/drawRect";
import type { DrawTextType } from "../interface/drawText";
import type { GameStateType } from "../interface/GameStateType";
import type { NetType } from "../interface/net";
import type { PlayerType } from "../interface/player";
import { stateProxyHandler } from "../states/stateProxyHandler";
import { getSocket } from "../websocket";

export function RenderGame(): HTMLElement {
  const socket = getSocket();

  let countdown: number | null = null;
  let matchEnd: "YOU WIN!" | "YOU LOSE!" | null = null;

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
  canvasElement.className = "border-4 border-blue-500 bg-black m-auto";
  setActiveCanvas(canvasElement);

  const netWidth = Math.max(2, Math.min(canvasElement.width * 0.002, 6));

  const net: NetType = {
    x: canvasElement.width / 2 - netWidth / 2,
    y: 0,
    width: netWidth,
    height: 10,
    color: "white",
  };

  function resizeCanvas() {
    const aspect = 2 / 1;
    const parent = canvasElement.parentElement || document.body;
    let width = parent.clientWidth;
    let height = parent.clientHeight - 100;

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
      return console.error("Error: drawRect.");
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function drawCircle({ x, y, r, color }: drawCircleType) {
    if (!ctx) {
      return console.error("Error: drawCircle");
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  }

  function drawText({ text, x, y, color, font }: DrawTextType) {
    if (!ctx) {
      return console.error("Error: drawText.");
    }
    if (text === "0" || text === undefined) return;
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text.toString(), x, y);
  }

  function drawTextCenter(userX: PlayerType, userY: PlayerType, scaleX: number) {
    if (!ctx) return;

    ctx.font = "20px Verdana";
    ctx.fillStyle = "white";

    // Left player
    const leftCenter = scaleX / 4;
    const leftWidth = ctx.measureText(userX.username).width;
    const leftX = leftCenter - leftWidth / 2;
    drawText({
      text: userX.username,
      x: leftX,
      y: 40,
      color: "white",
      font: "20px Verdana",
    });

    // Right player
    const rightCenter = (3 * scaleX) / 4;
    const rightWidth = ctx.measureText(userY.username).width;
    const rightX = rightCenter - rightWidth / 2;
    drawText({
      text: userY.username,
      x: rightX,
      y: 40,
      color: "white",
      font: "20px Verdana",
    });
  }

  function render(ball: BallType, userX: PlayerType, userY: PlayerType) {
    const PADDLE_HEIGHT = stateProxyHandler.paddle.height;
    const scaleX = canvasElement.width;
    const scaleY = canvasElement.height;

    drawRect({ x: 0, y: 0, w: scaleX, h: scaleY, color: "black" });
    drawNet(net);

    // draw usernames
    drawTextCenter(userX, userY, scaleX);

    // draw scores
    if (userX.score === undefined || userY.score === undefined) userX.score = 0, userY.score = 0;
    drawText({ text: userX.score, x: 300, y: 200, color: "white", font: "45px Verdana" });

    drawText({ text: userY.score, x: scaleX - 300, y: 200, color: "white", font: "45px Verdana" });

    const paddlePixelHeight = Math.max(6, PADDLE_HEIGHT * scaleY);

    // PaddleWidth in fixed pixels
    const paddleWidth = stateProxyHandler.paddle.width * scaleX;
    drawRect({
      x: userX.x * scaleX - paddleWidth / 2,
      y: userX.y * scaleY - paddlePixelHeight / 2,
      w: paddleWidth,
      h: paddlePixelHeight,
      color: "white",
    });
    drawRect({
      x: userY.x * scaleX - paddleWidth / 2,
      y: userY.y * scaleY - paddlePixelHeight / 2,
      w: paddleWidth,
      h: paddlePixelHeight,
      color: "white",
    });

    const BALL_RADIUS = Math.min(ball.radius * ((scaleX + scaleY) / 2), 8);

    drawCircle({
      x: ball.x * scaleX,
      y: ball.y * scaleY,
      r: BALL_RADIUS,
      color: "white",
    });
    drawCountdown(scaleX, scaleY);
    drawEndGame(scaleX, scaleY);
  }

  if (socket) {
    socket.onmessage = (event) => {
      const { message, payload } = JSON.parse(event.data);
      if (message === "STATE") {
        previousState = currentState ? structuredClone(currentState) : payload;
        currentState = payload;
        lastUpdateTime = performance.now();
      } else if (message === "COUNTDOWN") {
        countdown = payload.seconds;
      } else if (message === "GAME_OVER") {
        matchEnd = payload.message;
      }
    };
  }

  function drawEndGame(scaleX: number, scaleY: number) {
    if (matchEnd) {
      drawText({
        text: matchEnd,
        x: (0.5 * scaleX) / 2,
        y: 0.5 * scaleY + 30,
        color: matchEnd === "YOU WIN!" ? "green" : "red",
        font: "120px Verdana",
      });
      return;
    }
  }

  function drawCountdown(scaleX: number, scaleY: number) {
    if (!ctx) return;
    ctx.font = "120px Verdana";
    const centerX = scaleX / 2;
    const centerY = scaleY / 2 + 30;
    if (countdown !== null) {
      if (countdown < 2) {
        drawText({
          text: "GO!",
          x: 0.5 * scaleX - 90,
          y: 0.5 * scaleY + 30,
          color: "white",
          font: "120px Verdana",
        });
      } else {
        const readyText = "READY";
        const readyWidth = ctx.measureText(readyText).width;
        drawText({
          text: readyText,
          x: centerX - readyWidth / 2,
          y: centerY,
          color: "white",
          font: "120px Verdana",
        });
      }
      if (countdown === 0) countdown = null;
      return;
    }
  }

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
        y: interpolate(
          previousState.players.userX.y,
          currentState.players.userX.y,
          t
        ),
      };
      const interpUserY = {
        ...currentState.players.userY,
        y: interpolate(
          previousState.players.userY.y,
          currentState.players.userY.y,
          t
        ),
      };

      render(interpBall, interpUserX, interpUserY);
    } else if (currentState) {
      const { ball, players } = currentState;
      render(ball, players.userX, players.userY);
    }
    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);
  requestAnimationFrame(resizeCanvas);
  drawNet(net);
  return canvasElement;
}
