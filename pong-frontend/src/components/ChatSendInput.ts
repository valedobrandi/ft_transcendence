import { messageState } from "../states/messageState";
import { websocketChatSend } from "../websocket/websocketChatSend";

export function ChatSendInput(): HTMLDivElement {
    const inputDiv = document.createElement("div");
    inputDiv.className = "border border w-full min-h-20 flex";
    inputDiv.id = "chat-send-container";

    const form = document.createElement("form");
    form.className = "border w-full flex";

    const input = document.createElement("input");
    input.id = "chat-input";
    input.type = "text";
    input.placeholder = "Type a message...";
    input.className = "px-2 py-1 border rounded w-full h-full";

    const sendBtn = document.createElement("button");
    sendBtn.textContent = "Send";
    sendBtn.id = "send-chat-btn";
    sendBtn.type = "submit";
    sendBtn.className = "px-4 py-1 bg-blue-500 text-white font-bold rounded hover:bg-blue-600";

    form.appendChild(input);
    form.appendChild(sendBtn);

    inputDiv.appendChild(form);

    form.onsubmit = (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (message) {
            const {name, id} = messageState.selectChat;

            websocketChatSend(message, name, id);
            input.value = "";
        }
    }

    return inputDiv;
}

