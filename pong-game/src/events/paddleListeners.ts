export function setupPaddleListeners(sendInput: (up: boolean, down: boolean) => void) {
    let upMove = false;
    let downMove = false;

    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp") upMove = true;
        if (event.key === "ArrowDown") downMove = true;
        sendInput(upMove, downMove);
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "ArrowUp") upMove = false;
        if (event.key === "ArrowDown") downMove = false;
        sendInput(upMove, downMove);
    });
}
