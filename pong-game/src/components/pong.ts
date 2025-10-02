import type { BallType } from "../interface/ball";
import type { drawCircleType } from "../interface/drawCircle";
import type { DrawRectType } from "../interface/drawRect";
import type { DrawTextType } from "../interface/drawText";
import type { NetType } from "../interface/net";
import type { PlayerType } from "../interface/player";

export function pong(): HTMLElement {
    
    const canvasElement = document.createElement("canvas");
    const ctx = canvasElement.getContext("2d");
    canvasElement.id = "pong";
    canvasElement.width = 1200;
    canvasElement.height = 600;
    canvasElement.className = "my-auto border border-4 border-blue-500";

    const userX: PlayerType = {
        x : 10,
        y : canvasElement.height/2 - 100/2,
        width : 10,
        height : 100,
        color : "white",
        score : 0
    }

    const userY: PlayerType = {
        x : canvasElement.width - 20,
        y : canvasElement.height/2 - 100/2,
        width : 10,
        height : 100,
        color : "white",
        score : 0
    }

    const ball: BallType = {
        x : canvasElement.width/2,
        y : canvasElement.height/2,
        radius : 10,
        speed : 5,
        velocityX : 5,
        velocityY : 5,
        color : "white"
    }

    const net: NetType = {
        x : canvasElement.width/2 -1,
        y : 0,
        width : 2,
        height : 10,
        color : "white"
    }

    function drawNet({x, y, width, height, color}: NetType) {
        for (let i = 0; i <= canvasElement.height; i+=15) {
            drawRect({x:x, y:y+i, w:width, h:height, color:color});
        }
    }

    function drawRect({x, y, w, h, color}: DrawRectType) {
        if (!ctx) {
            return console.error('Error: drawRect.');
        }
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }


    function drawCircle({x, y, r, color}: drawCircleType) {
        if (!ctx) {
            return console.error('Error: drawCircle');
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x,y,r,0,Math.PI*2,false);
        ctx.closePath();
        ctx.fill();
    }


    function drawText({text, x, y, color}: DrawTextType) {
        if (!ctx) {
            return console.error('Error: drawText.');
        }
        ctx.fillStyle = color;
        ctx.font = "45px Verdana";
        ctx.fillText(text.toString(),x,y);
    }

    drawText({text:0, x:300, y:200, color:"white"});

    function render() {
        drawRect({x:0, y:0, w:canvasElement.width, h:canvasElement.height, color:"black"});

        drawNet(net);

        drawText({text:userX.score, x:canvasElement.width/4, y:canvasElement.height/5, color:"white"});
        drawText({text:userY.score, x:3*canvasElement.width/4, y:canvasElement.height/5, color:"white"});

        drawRect({x:userX.x, y:userX.y, w:userX.width, h:userX.height, color:userX.color });
        drawRect({x:userY.x, y:userY.y, w:userY.width, h:userY.height, color:userY.color });

        drawCircle({x:ball.x, y:ball.y, r:ball.radius, color:ball.color });
    }

    let upMove = false;
    let downMove = false;

    document.addEventListener("keydown", function(event) {
        switch(event.key) {
            case "ArrowUp":
                upMove = true;
                break;
            case "ArrowDown":
                downMove = true;
                break;
        }
    });

    document.addEventListener("keyup", function(event) {
        switch(event.key) {
            case "ArrowUp":
                upMove = false;
                break;
            case "ArrowDown":
                downMove = false;
                break;
        }
    });

    function collision(ball: BallType, player: PlayerType) {
        const ballTop =  ball.y - ball.radius;
        const ballBottom = ball.y + ball.radius;
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;

        const playerTop = player.y;
        const playerBottom = player.y + player.height;
        const playerLeft = player.x;
        const playerRight = player.x + player.width;

        return ballRight > playerLeft && ballBottom > playerTop && 
            ballLeft < playerRight && ballTop < playerBottom;

    }

    function resetBall() {
        ball.x = canvasElement.width/2;
        ball.y = canvasElement.height/2;

        ball.speed = 5;
        ball.velocityX = -ball.velocityX;
    }

    function update() {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        // userY movement
        const paddleSpeed = 7;
        if (upMove && userY.y > 0) {
            userY.y -= paddleSpeed;
        } else if (downMove && (userY.y < canvasElement.height - userY.height)) {
            userY.y += paddleSpeed;
        }

        // AI
        let computer = 0.1;
        userX.y += (ball.y - (userX.y + userX.height/2)) * computer;

        if (ball.y + ball.radius > canvasElement.height || ball.y - ball.radius < 0) {
            ball.velocityY = -ball.velocityY;
        }

        let player = (ball.x < canvasElement.width/2) ? userX : userY;

        if (collision(ball, player)) {
            let collidePoint = ball.y - (player.y + player.height/2);
            collidePoint = collidePoint/(player.height/2);

            let angleRad = collidePoint*Math.PI/4;

            let direction = (ball.x < canvasElement.width/2) ? 1 : -1;

            ball.velocityX = direction*ball.speed*Math.cos(angleRad);
            ball.velocityY = direction*ball.speed*Math.sin(angleRad);

            if (ball.speed < 10) {
                ball.speed += 0.5;
            }
        }

        if (ball.x - ball.radius < 0) {
            userY.score++;
            resetBall();
        } else if (ball.x + ball.radius > canvasElement.width) {
            userX.score++;
            resetBall();
        }
    }

    function game() {
        update();
        render();
    }

    const framePerSecond = 60;
    setInterval(game, 1000/framePerSecond);
    return canvasElement;
}