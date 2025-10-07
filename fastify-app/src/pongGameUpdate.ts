/* import { GameStateType } from "./interfaces/GameStateType";

function collision(state: GameStateType) {
    const { ball } = state;
    const {x, y, height, width} = state.player;
    const ballTop =  ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;

    const playerTop = y;
    const playerBottom = y + height;
    const playerLeft = x;
    const playerRight = x + width;

    return ballRight > playerLeft && ballBottom > playerTop &&
        ballLeft < playerRight && ballTop < playerBottom;
}

function resetBall({ball, canvasHeight, canvasWidth}: GameStateType) {
    ball.x = canvasWidth/2;
    ball.y = canvasHeight/2;

    ball.speed = 5;
    ball.velocityX = -ball.velocityX;
}

export function pongGameUpdate(state: GameStateType ) {
    const {ball, canvasHeight, canvasWidth, player, scores} = state;
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;


    // AI
    // let computer = 0.1;
    // userX.y += (ball.y - (userX.y + userX.height/2)) * computer;

    if (ball.y + ball.radius > canvasHeight || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }


    if (collision(state)) {
        let collidePoint = ball.y - (player.y + player.height/2);
        collidePoint = collidePoint/(player.height/2);

        let angleRad = collidePoint*Math.PI/4;

        let direction = (ball.x < canvasWidth/2) ? 1 : -1;

        ball.velocityX = direction*ball.speed*Math.cos(angleRad);
        ball.velocityY = direction*ball.speed*Math.sin(angleRad);

        if (ball.speed < 10) {
            ball.speed += 0.5;
        }
    }

    if (ball.x - ball.radius < 0) {
        scores.pX++;
        resetBall(state);
    } else if (ball.x + ball.radius > canvasWidth) {
        scores.pY++;
        resetBall(state);
    }
} */