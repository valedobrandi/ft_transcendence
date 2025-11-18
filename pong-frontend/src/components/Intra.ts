import { ChatHeader } from "./ChatHeader";
import { SystemMessageChat } from "./ChatIntra";
import { ChatSendInput } from "./ChatSendInput";
import { MatchList } from "./MatchList";
import { UsersList } from "./UsersList";

export function Intra(): HTMLElement {
    const mainDiv = document.createElement("div");
    mainDiv.id = "main-chat-container";
    mainDiv.className = "flex h-screen p-1 min-h-0 min-w-0";

    // ====================================================================== //
    //                                                                        //
    //                                Left Side                               //
    //                                                                        //
    // ====================================================================== //

    const leftParent = document.createElement("div");
    leftParent.id = "left-parent";
    leftParent.className = "flex flex-col basis-1/2 shrink-0 h-full";

    //     Upper Section (Chat + Users) - 66% height                          //
    // ====================================================================== //

    const contentDiv = document.createElement("div");
	contentDiv.id = "content-div";
    contentDiv.className = "flex h-2/3 min-h-0";

    // Chat
    const chatWidget = document.createElement("div");
    chatWidget.id = "chatWidget";
    chatWidget.className = "flex flex-col flex-1 border";

    // Chat Header Text
    const chatTabs = document.createElement("div");
    chatTabs.id = "chat-tabs";
    chatTabs.className = "flex border-b bg-gray-100 h-10";

    // Chat Header Buttons
    const chatMenu = ChatHeader();

    // Chat Message Box
    const messages = document.createElement("div");
    messages.id = "messages";
    messages.className = `
        flex-1
        overflow-y-auto
        p-3
        bg-[rgb(40,43,48)]
        border border-[rgb(54,57,62)]
        text-white
    `;

    // Chat Input
    const inputDiv = ChatSendInput();

    chatWidget.appendChild(chatTabs);
    chatWidget.appendChild(chatMenu);
    chatWidget.appendChild(messages);
    chatWidget.appendChild(inputDiv);


    // User/Friend
    const usersDiv = document.createElement("div");
    usersDiv.id = "users-list";
    usersDiv.className = "border w-xs";
    usersDiv.appendChild(UsersList()!);

    contentDiv.appendChild(chatWidget);
    contentDiv.appendChild(usersDiv);

    //     Lower Section (System Message) - 33% height                        //
    // ====================================================================== //

    const intraContainer = SystemMessageChat();
    intraContainer.className = "flex flex-col flex-1 border border-black w-full min-h-0 overflow-y-auto";

    leftParent.appendChild(contentDiv);
    leftParent.appendChild(intraContainer);

    // ====================================================================== //
    //                                                                        //
    //                               Right Side                               //
    //                                                                        //
    // ====================================================================== //

    const rightParent = document.createElement("div");
    rightParent.id = "right-parent";
    rightParent.className = "flex flex-col basis-1/2 shrink-0 h-full";

    const matchDiv = document.createElement("div");
    matchDiv.id = "match-list-container";
    matchDiv.className = "border w-fit border-2";

    const matchTitle = document.createElement("h2");
    matchTitle.innerText = "Available Matches";
    matchTitle.className = "text-center font-bold p-2 border uppercase bg-gray-200";

    matchDiv.appendChild(matchTitle);
    rightParent.appendChild(matchDiv);

    const matchListUI = MatchList();
    matchDiv.appendChild(matchListUI!);

    //     Final Assembly                                                     //
    // ====================================================================== //

    mainDiv.appendChild(leftParent);
    mainDiv.appendChild(rightParent);

    return mainDiv;
}
