import DOMPurify from "dompurify";

export function IntraContainer() {
	const html = `
	<div class="intra-container grid grid-cols-[auto_1fr_1fr] gap-x-1 min-h-screen w-full p-4">
	</div>
	`;
	const mainDiv = document.createElement("div");
	mainDiv.innerHTML = DOMPurify.sanitize(html);
	return mainDiv.firstElementChild || document.createElement("div");
}
