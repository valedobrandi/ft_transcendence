import { stateProxyHandler, onStateChange } from "../states/stateProxyHandler";
import { navigateTo } from "../utils";

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
		
		const matchBtn = document.createElement("button");
		matchBtn.id = "match-btn";
		matchBtn.className = "ml-4 px-3 py-1 bg-green-600 text-white rounded hover:opacity-80";
		matchBtn.textContent = "RETURN TO MATCH";
	
		matchBtn.onclick = () => {
			navigateTo("/match")
		};

		if (stateProxyHandler.state === "MATCH" || stateProxyHandler.state === "TOURNAMENT") {
			matchBtn.classList.remove("hidden");
		} else {
			matchBtn.classList.add("hidden");
		}

		chatTabs.appendChild(status);
		chatTabs.appendChild(statusParagraph);
		chatTabs.appendChild(matchBtn);
	}

	onRender();
	onStateChange("state", onRender);
	intraContainer.appendChild(chatTabs);
	return intraContainer;
}
