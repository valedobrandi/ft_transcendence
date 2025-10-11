let activeCanvas: HTMLCanvasElement | null = null;

function resizeCanvas() {
	if (!activeCanvas) return;

	const aspect = 2 / 1;
	const parent = activeCanvas.parentElement || document.body;
	let width = parent.clientWidth;
	let height = parent.clientHeight;

	if (width / height > aspect) {
		width = height * aspect;
	} else {
		height = width / aspect;
	}

	activeCanvas.style.width = `${width}px`;
	activeCanvas.style.height = `${height}px`;
}

export function setActiveCanvas(canvas: HTMLCanvasElement | null) {
	activeCanvas = canvas;
	resizeCanvas();
}

window.addEventListener("resize", resizeCanvas);
