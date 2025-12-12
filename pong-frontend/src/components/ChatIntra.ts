import { stateProxyHandler, onStateChange } from "../states/stateProxyHandler";

export function SystemMessageChat() {
	const intraContainer = document.createElement("div");
	intraContainer.id = "";
	intraContainer.className = "flex flex-col flex-0 border border-black";

	const chatTabs = document.createElement("div");
	chatTabs.id = "chat-tabs";
	chatTabs.className = "flex justify-start items-center border-b border-[#424549] bg-[#36393e] h-10 min-w-lg";

	const messages = document.createElement("div");
	messages.id = "system-messages";
	messages.className = "flex-1 overflow-y-auto p-2 w-full min-h-0 bg-[#282b30]";

	const title = ServerStatus();
	const status = document.createElement("p");
	status.className = "text-xs p-2 font-bold italic";

	status.textContent = "STATE:";

	intraContainer.appendChild(chatTabs);
	chatTabs.appendChild(status);
	chatTabs.appendChild(title);
	function Render() {
		messages.innerHTML = '';

		stateProxyHandler.systemMessages.forEach(msg => {
			if (msg.message === "") return;
			const p = document.createElement('p');
			p.id = `msg-index-${msg.index}`;
			p.className = "m-2 text-base text-black bg-yellow-100 p-2 rounded w-fit";
			p.innerHTML = `${msg.message}`;
			messages.appendChild(p);
		});
		intraContainer.appendChild(messages);
	}
	Render();
	//onMessageChange(Render);
	onStateChange("systemMessages", Render);
	return intraContainer;
}

export function ServerStatus(): HTMLParagraphElement {
	const statusParagraph = document.createElement("p");

	function onRender() {
		//console.log("[SERVER STATUS]", stateProxyHandler.state)
		statusParagraph.id = "server-state";
		statusParagraph.className = "text-xs font-bold italic underline text-blue-600";
		statusParagraph.textContent = `${stateProxyHandler.state}`;
	}
	onRender();
	onStateChange("state", onRender);
	return statusParagraph;
};
