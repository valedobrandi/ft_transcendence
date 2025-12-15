import { stateProxyHandler, onStateChange } from "../states/stateProxyHandler";

export function SystemMessageChat() {
	const intraContainer = document.createElement("div");
	intraContainer.id = "";
	intraContainer.className = "border-black h-fit";

	const chatTabs = document.createElement("div");
	chatTabs.id = "chat-tabs";
	chatTabs.className = "flex justify-start items-center border-b border-[#424549] bg-[#36393e] min-w-lg";
	
	const messages = document.createElement("div");
	messages.id = "system-messages";
	messages.className = "flex-1 overflow-y-auto p-2 w-full min-h-0 bg-[#282b30]";
	
	const title = ServerStatus();
	const status = document.createElement("p");
	status.className = "text-lg tracking-wide p-2 font-bold italic text-blue-500";
	status.textContent = "STATE:";
	
	intraContainer.appendChild(chatTabs);
	chatTabs.appendChild(status);
	chatTabs.appendChild(title);
	return intraContainer;
}

export function ServerStatus(): HTMLParagraphElement {
	const statusParagraph = document.createElement("p");

	function onRender() {
		console.log("[SERVER STATUS]", stateProxyHandler.state)
		statusParagraph.id = "server-state";
		statusParagraph.className = "text-base font-bold italic underline text-white";
		statusParagraph.textContent = `${stateProxyHandler.state}`;
	}
	onRender();
	onStateChange("state", onRender);
	return statusParagraph;
};
