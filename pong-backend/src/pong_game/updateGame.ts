import { gameState } from "../state/gameInitState.js";
import { playerInputs } from "../state/playerInput.js";
import { connectedRoom } from "../state/rooms.js";

const INITIAL_BALL_SPEED = 0.005;

function resetBall() {
    gameState.ball.x = 0.5;
    gameState.ball.y = 0.5;
    gameState.ball.speed = INITIAL_BALL_SPEED;
    gameState.ball.velocityX = -INITIAL_BALL_SPEED;
    gameState.ball.velocityY = INITIAL_BALL_SPEED;
  }
  
export function updateGame() {
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