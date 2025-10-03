export function HeaderBar(title: string): HTMLElement {
    const header = document.createElement("div");
    header.className = "w-full bg-gray-800 text-white py-4 shadow";
	const headerP = document.createElement("p");
	headerP.className = "ml-4 uppercase font-bold"
    headerP.textContent = title;
	header.appendChild(headerP);
    return header;
}
