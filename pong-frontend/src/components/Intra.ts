import { ChatHeader } from "./ChatHeader";
import { ChatSendInput } from "./ChatSendInput";
import { Settings } from "./Settings";
import { UsersList } from "./UsersList";

export function Intra(): HTMLElement {

    const mainDiv = document.createElement("div");
    mainDiv.id = "main-chat-container";
    mainDiv.className = "flex h-screen p-1";

    const chatDiv = document.createElement("div");
    chatDiv.id = "chat-container";
    chatDiv.className = "w-full flex flex-col flex-grow";

    const chatWidget = document.createElement("div");
    chatWidget.id = "chatWidget";
    chatWidget.className = "border w-full h-full flex flex-col";

    const chatTabs = document.createElement("div");
    chatTabs.id = "chat-tabs";
    chatTabs.className = "flex border-b bg-gray-100 h-10 min-w-lg";

    const chatMenu = ChatHeader();

    const p = document.createElement("p");
    p.textContent = "Bienvenue dans le chat !";
    chatWidget.appendChild(p);

    const messages = document.createElement("div");
    messages.id = "messages";
    messages.className = "flex-1 overflow-y-auto p-2";

    chatWidget.appendChild(chatTabs);
    chatWidget.appendChild(chatMenu);
    chatWidget.appendChild(messages);

    const usersDiv = document.createElement("div");
    usersDiv.id = "users";
    usersDiv.className = "border border flex-grow min-w-3xs";

    const contentDiv = document.createElement("div");
    contentDiv.className = "flex flex-grow";

    mainDiv.appendChild(chatDiv);
    contentDiv.appendChild(chatWidget);
    contentDiv.appendChild(usersDiv);

    const usersListUI = UsersList();
    usersDiv.appendChild(usersListUI!);

    chatDiv.appendChild(contentDiv)

    const inputDiv = ChatSendInput();
    chatDiv.appendChild(inputDiv);

    const settingsUI = Settings();
    mainDiv.appendChild(settingsUI!);

    return mainDiv;
}