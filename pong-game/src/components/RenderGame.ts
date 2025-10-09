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

    const netWidth = Math.max(2, Math.min(canvasElement.width * 0.002, 6));
    const net: NetType = {
        x : canvasElement.width/2 - netWidth/2,
        y : 0,
        width : netWidth,
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
        const scaleX = canvasElement.width;
        const scaleY = canvasElement.height;
        drawRect({x:0, y:0, w:scaleX, h:scaleY, color:"black"});

        drawNet(net);

        drawText({text:userX.score, x:scaleX/4, y:scaleY/5, color:"white"});
        drawText({text:userY.score, x:3*scaleX/4, y:scaleY/5, color:"white"});

        drawRect({x:userX.x*scaleX, y:userX.y*scaleY, w:10, h:100, color:"white" });
        drawRect({x:userY.x*scaleX-10, y:userY.y*scaleY, w:10, h:100, color:"white" });
        const ballRadius = Math.min(ball.radius * ((scaleX + scaleY) / 2), 8);
        drawCircle({x:ball.x*scaleX, y:ball.y*scaleY, r:ballRadius, color:"white" });
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



