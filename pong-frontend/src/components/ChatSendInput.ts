export function ChatSendInput() {
    const input = document.createElement("input");
    input.id = "chat-input";
    input.type = "text";
    input.placeholder = "Type a message...";
    input.className = "px-2 py-1 border rounded w-full h-full";
}