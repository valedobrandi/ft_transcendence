import { socket } from "../app";
import { userX, userY } from "../gameState";
import type { drawCircleType } from "../interface/drawCircle";
import type { DrawRectType } from "../interface/drawRect";
import type { DrawTextType } from "../interface/drawText";
import type { NetType } from "../interface/net";

type PlayerType = {
  x: number;
  y: number;
  score: number;
};

type BallType = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: number;
  velocityY: number;
};

export function RenderGame(): HTMLElement {

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

    function render(ball: BallType, userX: PlayerType, userY: PlayerType) {
        drawRect({x:0, y:0, w:canvasElement.width, h:canvasElement.height, color:"black"});

        drawNet(net);

        drawText({text:userX.score, x:canvasElement.width/4, y:canvasElement.height/5, color:"white"});
        drawText({text:userY.score, x:3*canvasElement.width/4, y:canvasElement.height/5, color:"white"});

        drawRect({x:userX.x, y:userX.y, w:10, h:100, color:"white" });
        drawRect({x:userY.x, y:userY.y, w:10, h:100, color:"white" });

        drawCircle({x:ball.x, y:ball.y, r:ball.radius, color:"white" });
    }

		socket.onmessage = (event) => {
		const { type, payload } = JSON.parse(event.data);
		if (type === "state") {
			const { ball, players } = payload;

			Object.assign(userX, players.userX);
			Object.assign(userY, players.userY);

			Object.assign(ball, payload.ball);

			render(ball, userX, userY);
		}
	};

    return canvasElement;
}



