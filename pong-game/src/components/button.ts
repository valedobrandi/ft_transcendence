export function button(root: HTMLElement, label: string, onClick: () => void) {
    const buttonElement = document.createElement("button");
    buttonElement.id = label.toLowerCase() + "-button";
    buttonElement.textContent = label;
    buttonElement.className = "w-24 h-14 bg-black text-white text-xs font-bold";
    buttonElement.onclick = onClick;

    root.appendChild(buttonElement);
}