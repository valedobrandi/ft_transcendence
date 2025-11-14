import { stateProxyHandler, onMessageChange } from "../states/stateProxyHandler";

export function SystemMessageChat() {
	const intraContainer = document.createElement("div");
	intraContainer.id = "";
	intraContainer.className = "flex flex-col flex-grow border border-black w-[850px]";

	const chatTabs = document.createElement("div");
    chatTabs.id = "chat-tabs";
    chatTabs.className = "flex border-b bg-gray-100 h-10 min-w-lg";

	const messages = document.createElement("div");
	messages.id = "system-messages";
	messages.className = "flex-1 overflow-y-auto p-2 min-w-[528px]";

	const title = document.createElement("h2");
	title.textContent = "System Messages";
	title.className = "text-center font-bold p-2";

	function Render() {
		messages.innerHTML = '';

		intraContainer.appendChild(chatTabs);
		chatTabs.appendChild(title);
		stateProxyHandler.systemMessages.forEach(msg => {
			const p = document.createElement('p');
			p.id = `msg-index-${msg.index}`;
			p.className = "m-2 text-sm text-black bg-yellow-100 p-2 rounded w-fit";
			p.innerHTML = `${msg.message}`;
			messages.appendChild(p);
		});
		intraContainer.appendChild(messages);
	}
	Render();
	onMessageChange(Render);
	return intraContainer;
}