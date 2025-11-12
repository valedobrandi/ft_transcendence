export function Button(label: string, style = "", onClick: () => void): HTMLElement {
    const buttonElement = document.createElement("button");
    buttonElement.id = label.toLowerCase() + "-button";
    buttonElement.textContent = label;
    buttonElement.className = `bg-black text-white
		uppercase font-bold cursor-pointer rounded ` + style;
    buttonElement.onclick = onClick;

	return buttonElement;
}

export function FancyButton(label: string, style = "", onClick: () => void): HTMLElement {
    const buttonElement = document.createElement("button");
    buttonElement.className = `button-fancy-pushable ${style}`;
    buttonElement.setAttribute("role", "button");

    const edge = document.createElement("span");
    edge.className = "button-fancy-edge";

    const front = document.createElement("span");
    front.className = "button-fancy-front text";
    front.textContent = label;

    buttonElement.appendChild(edge);
    buttonElement.appendChild(front);

    buttonElement.onclick = onClick;

    return (buttonElement);
}
