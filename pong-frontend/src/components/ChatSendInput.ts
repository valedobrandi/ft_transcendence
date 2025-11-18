import { stateProxyHandler } from "../states/stateProxyHandler";
import { websocketChatSend } from "../websocket/websocketChatSend";
import { FancyButton } from "./Button";

export function ChatSendInput(): HTMLDivElement {
    const inputDiv = document.createElement("div");
    inputDiv.id = "chat-send-container";
    inputDiv.className = "flex items-center p-2 bg-[rgb(54,57,62)] border-t border-[rgb(66,69,73)]";

    const form = document.createElement("form");
    form.className = "flex w-full gap-2";

    const input = document.createElement("input");
    input.id = "chat-input";
    input.type = "text";
    input.placeholder = "Type a message...";
    input.className = `
        flex-grow px-3 py-2 rounded-md
        bg-[rgb(66,69,73)]
        text-white placeholder:text-gray-400
        border border-[rgb(66,69,73)]
        focus:outline-none focus:ring-2 focus:ring-[rgb(255,80,80)] focus:border-[rgb(255,80,80)]
    `;

    const sendBtn = FancyButton("Send", "h-14 w-30 tracking-widest text-lg mt-1", () => { });
    sendBtn.id = "send-chat-btn";

    form.appendChild(input);
    form.appendChild(sendBtn);

    inputDiv.appendChild(form);

    form.onsubmit = (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (message) {
            const {name, id} = stateProxyHandler.selectChat;
            websocketChatSend(message, name, id);
            input.value = "";
        }
    }

    return inputDiv;
}
