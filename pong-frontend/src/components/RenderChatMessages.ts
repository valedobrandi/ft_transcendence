import { profile } from "../app";
import { fetchRequest } from "../utils";
import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";

export function RenderChatMessages(): HTMLDivElement {
    const messageBox = document.createElement("div");
    messageBox.id = "messages";
    messageBox.className = "border-0 flex-1 overflow-y-auto p-3 bg-[#282b30] text-white";
    
    // Create a new paragraph element for each message
    function onRender() {

        const selectedChatId = stateProxyHandler.chat.id;
        messageBox.innerHTML = '';
        // Get messages from the messageState.messages by selectedChatId
        const messages = stateProxyHandler.messages[selectedChatId] || [];
        messages.forEach(msg => {
            const p = document.createElement('p');
            p.id = `msg-${msg.timestamp}`;
            p.className = "m-2 text-sm text-white max-w-xs break-words";
            if (Number(msg.from) === Number(profile.id)) {
                p.className += " p-2 rounded-lg w-fit ml-auto bg-[hsl(345,100%,47%)] text-white shadow-sm";
            } else {
                p.className += " p-2 rounded-lg w-fit bg-[#36393e] text-white shadow-sm";
            }
            p.innerHTML = `${msg.message}`;
            messageBox.appendChild(p);
            if (!msg.isRead) {
                if (Number(msg.from) !== Number(profile.id)) {
                    fetchRequest("/server/markedRead", "POST", {}, { body: JSON.stringify({ messageId: msg.id }) });
                }
            }
        });
    }
    onRender();
    onStateChange("messages", onRender);
    onStateChange("chat", onRender);

    return messageBox;
}
