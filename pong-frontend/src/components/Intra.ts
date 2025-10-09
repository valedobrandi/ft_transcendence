import { Settings } from "./Settings";
import { UsersList } from "./UsersList";

export function Intra(): HTMLElement {

    const mainDiv = document.createElement("div");
    mainDiv.id = "main-chat-container";
    mainDiv.className = "flex h-screen p-1";

    const chatDiv = document.createElement("div");
    chatDiv.id = "chat-container";
    chatDiv.className = "w-full flex flex-col flex-grow";

    const messagesDiv = document.createElement("div");
    messagesDiv.id = "messages";
    messagesDiv.className = "border borderh-full w-3/4 min-w-xs";

    const usersDiv = document.createElement("div");
    usersDiv.id = "users";
    usersDiv.className = "border border flex-grow min-w-3xs";

    const inputDiv = document.createElement("div");
    inputDiv.className = "border border w-full min-h-20 flex";

    const contentDiv = document.createElement("div");
    contentDiv.className = "flex flex-grow";

    mainDiv.appendChild(chatDiv);
    contentDiv.appendChild(messagesDiv);
    contentDiv.appendChild(usersDiv);

    const usersListUI = UsersList();
    usersDiv.appendChild(usersListUI!);

    chatDiv.appendChild(contentDiv)
    chatDiv.appendChild(inputDiv);

    const settingsUI = Settings();
    mainDiv.appendChild(settingsUI!);

    const input = document.createElement("input");
    input.id = "chat-input";
    input.type = "text";
    input.placeholder = "Type a message...";
    input.className = "px-2 py-1 border rounded w-full h-full";

    const sendBtn = document.createElement("button");
    sendBtn.textContent = "Send";
    sendBtn.className = "px-4 py-1 bg-blue-500 text-white font-bold rounded hover:bg-blue-600";

    inputDiv.appendChild(input);
    inputDiv.appendChild(sendBtn);

    return mainDiv;
}