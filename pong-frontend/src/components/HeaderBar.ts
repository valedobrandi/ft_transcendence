export function HeaderBar(title: string): HTMLElement {
    const h1Element = document.createElement("h1");
    h1Element.className = "game-font text-6xl text-center mt-20 text-yellow-400 text-shadow-lg/30";
    h1Element.textContent = title;

    return h1Element;
}
