export function Button(label: string, style = "", onClick: () => void): HTMLElement {
    const buttonElement = document.createElement("button");
    buttonElement.id = label.toLowerCase() + "-button";
    buttonElement.textContent = label;
    buttonElement.className = `bg-black text-white text-xs
		uppercase font-bold cursor-pointer ` + style;
    buttonElement.onclick = onClick;

	return buttonElement;
}