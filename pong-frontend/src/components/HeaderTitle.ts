import { createElement } from "../utils";

export function HeaderTitle(titleText: string): HTMLElement {
	const h2 = createElement("h2", "container-title", [
		"border-2",
		"border-black",
		"text-xl",
		"font-bold",
		"p-2",
		"text-center",
	]);
	h2.textContent = titleText;
	return h2;
}
