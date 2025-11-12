import { id } from "../app";
import type { ChatMessage } from "../interface/ChatMessage";
import { navigateTo, setTime } from "../utils";
import { websocketChatSend } from "../websocket/websocketChatSend";

export function addIntraMessage(message: string) {
    console.log(message);

    messageState.messages.has(1) || messageState.messages.set(1, []);
    messageState.messages.get(1)!.push({
        from: 1,
        to: id.id,
        senderId: 1,
        message: message,
        timestamp: Date.now(),
    });

    messageState.state = "CHAT_MESSAGE";
}

export function renderMessages(_: string, selectedChatId: number) {
    console.log("Rendering messages for chat ID:", selectedChatId);
    console.log("Messages:", messageState.messages);
    const messageBox = document.getElementById('messages');
    if (!messageBox) return;

    // Create a new paragraph element for each message
    messageBox.innerHTML = '';
    // Get messages from the messageState.messages by selectedChatId
    const messages = messageState.messages.get(selectedChatId) || [];
    messages.forEach(msg => {
        const p = document.createElement('p');
        p.className = "m-2 text-sm text-black";
        if (Number(msg.from) === Number(id.id)) {
            p.className += " bg-green-100 p-2 rounded w-fit ml-auto";
        } else {
            p.className += " bg-gray-100 p-2 rounded w-fit";
        }
        p.innerHTML = `${msg.message}`;
        messageBox.appendChild(p);
    })
}

const messageListeners: (() => void)[] = [];

export function onMessageChange(fn: () => void) {
    messageListeners.push(fn);
}


export function changeChatHeader(header: string) {
    const chatHeader = document.getElementById('chat-tabs');
    if (!chatHeader) return;

    const tab = document.createElement('h1');
    tab.innerHTML = '';
    tab.textContent = `#${header}`;
    tab.className = 'm-auto font-bold';
    renderMessages(messageState.selectChat.name, messageState.selectChat.id);
    chatHeader.innerHTML = '';
    chatHeader.appendChild(tab);
}

export interface MessageType {
    chat: string;
    sender: string;
}

export type ServerUsersList = {
	id: number;
	name: string;
};

export type FriendListType = {
	id: number;
	isConnected: boolean;
};

export interface MessageStateType {
    messages: Map<number, ChatMessage[]>;
    serverUsers: ServerUsersList[];
    friendList: FriendListType[];
    connectedUsers: { id: number; name: string }[];
    selectChat: { id: number; name: string };
    state: string;
}

export const messageState: MessageStateType = new Proxy({
    messages: new Map<number, ChatMessage[]>(),
    serverUsers: [],
    friendList: [],
    connectedUsers: [],
    selectChat: { id: -1, name: '' },
    state: "",
}, {
    set(target, prop, value) {
        target[prop as keyof typeof target] = value;

        if (prop === 'state') {
            switch (value) {
                case "TOURNAMENT_ROOM":
                    //addMessage("INTRA", `you have joined the tournament queue.`);
                    websocketChatSend(`you have joined the tournament queue.`, 'INTRA', 1);
                    break;
                case "MATCH_ROOM":
                    //addMessage("INTRA", `you have joined the match queue.`);
                    websocketChatSend(`you have joined the match queue.`, 'INTRA', 1);
                    break;
                case "GAME_ROOM":
                    setTime(5000, () => {
                        navigateTo("/match");
                    });
                    break;
                case "GAME_OVER":
                    setTime(5000, () => {
                        navigateTo("/intra");
                    });
                    break;
                case "CHAT_MESSAGE":
                    renderMessages(messageState.selectChat.name, messageState.selectChat.id);
                    break;
                case "CHAT_HISTORY":
                    renderMessages(messageState.selectChat.name, messageState.selectChat.id);
                    break;
            }
        }


        if (prop === 'selectChat') {
            changeChatHeader(messageState.selectChat.name);
            const isIntra = messageState.selectChat.name === 'INTRA';
            const chatMenu = document.getElementById("chat-menu");
            if (chatMenu) chatMenu.classList.remove("hidden");
            if (isIntra && chatMenu) {
                chatMenu.classList.add("hidden");
            };
        }

        if (prop === 'friendList') {
            messageListeners.forEach(fn => fn());
        }

        if (prop === 'serverUsers') {
            messageListeners.forEach(fn => fn());
        }

        if (prop === 'connectedUsers') {
            messageListeners.forEach(fn => fn());
        }

        return true;
    }
});

