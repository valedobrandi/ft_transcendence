import { socket, id } from "./app";

let upMove = false;
let downMove = false;

function sendInput() {
	socket.send(JSON.stringify({
		type: "input",
		payload: { up: upMove, down: downMove }
	}));
}

document.addEventListener("keydown", (event) => {
	if (event.key === "ArrowUp") upMove = true;
	if (event.key === "ArrowDown") downMove = true;
	sendInput();
});

document.addEventListener("keyup", (event) => {
	if (event.key === "ArrowUp") upMove = false;
	if (event.key === "ArrowDown") downMove = false;
	sendInput();
});
