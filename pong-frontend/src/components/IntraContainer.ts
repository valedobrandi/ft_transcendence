import DOMPurify from "dompurify";

export function IntraContainer() {
	const html = `
	<div class="intra-container grid grid-cols-[auto_1fr_1fr] min-h-screen">
	</div>
	`;
	const mainDiv = document.createElement("div");
	mainDiv.innerHTML = DOMPurify.sanitize(html);
	return mainDiv.firstElementChild || document.createElement("div");
}
