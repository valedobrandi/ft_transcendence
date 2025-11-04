export function Settings(): HTMLDivElement {
    const sideDiv = document.createElement("div");
    sideDiv.id = "settings-container";
    sideDiv.className = "border border-2 w-1/2";

	const header = document.createElement("h2");
	header.className = "text-center text-2xl font-bold my-4";
	header.innerText = "Settings";

	const btn = document.createElement("button");
	btn.className = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
	btn.innerText = "Save Settings";
	btn.id = "save-settings-btn";
	btn.name = "Save Settings";

	sideDiv.appendChild(header);
    return sideDiv
}