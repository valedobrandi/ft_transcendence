import { stateProxyHandler, onStateChange } from "../states/stateProxyHandler";

export function SystemMessageChat() {
	const intraContainer = document.createElement("div");
	intraContainer.id = "";
	intraContainer.className = "border-black h-fit";

	const chatTabs = document.createElement("div");
	chatTabs.id = "chat-tabs";
	chatTabs.className = "flex justify-start items-center border-b border-[#424549] bg-[#36393e] min-w-lg";

	
	
	// Append a btn if user state is MATCH/TOURNAMENT
	function onRender() {
		chatTabs.innerHTML = "";
		const status = document.createElement("p");
		status.className = "text-lg tracking-wide p-2 font-bold italic text-blue-500";
		status.textContent = "STATE:";

		const statusParagraph = document.createElement("p");

		statusParagraph.id = "server-state";
		statusParagraph.className = "text-base font-bold italic underline text-white";
		statusParagraph.textContent = `${stateProxyHandler.state}`;
	

		chatTabs.appendChild(status);
		chatTabs.appendChild(statusParagraph);
	}

	onRender();
	onStateChange("state", onRender);
	intraContainer.appendChild(chatTabs);
	return intraContainer;
}
