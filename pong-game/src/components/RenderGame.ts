import type { drawCircleType } from "../interface/drawCircle";
import type { DrawRectType } from "../interface/drawRect";
import type { DrawTextType } from "../interface/drawText";
import type { GameStateType } from "../interface/GameStateType";
import type { NetType } from "../interface/net";


export function RenderGame(state : GameStateType): HTMLElement {
    
    const canvasElement = document.createElement("canvas");
    const ctx = canvasElement.getContext("2d");
    canvasElement.id = "pong";
    canvasElement.width = 1200;
    canvasElement.height = 600;
    canvasElement.className = "my-auto border border-4 border-blue-500 mx-16";

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

    function render({scores, player, ball}: GameStateType) {
        const playerX = player.X;
        const playerY = player.Y;
        drawRect({x:0, y:0, w:canvasElement.width, h:canvasElement.height, color:"black"});

        drawNet(net);

        drawText({text:scores.pX, x:canvasElement.width/4, y:canvasElement.height/5, color:"white"});
        drawText({text:scores.pY, x:3*canvasElement.width/4, y:canvasElement.height/5, color:"white"});

        drawRect({x:playerX.x, y:playerX.y, w:10, h:100, color:"white" });
        drawRect({x:playerY.x, y:playerY.y, w:10, h:100, color:"white" });

        drawCircle({x:ball.x, y:ball.y, r:ball.radius, color:"white" });
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


    function game() {
        render(state);
    }

    const framePerSecond = 60;
    setInterval(game, 1000/framePerSecond);
    return canvasElement;
}