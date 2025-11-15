import { profile } from "../app";
import type { ChatMessage } from "../interface/ChatMessage";
import { navigateTo, setTime } from "../utils";

export function newIntraMessage(message: string) {
    stateProxyHandler.systemMessages = [...stateProxyHandler.systemMessages, {
        message: message,
        index: (stateProxyHandler.systemMessages.length),
    }];
    //stateProxyHandler.state = "SYSTEM_MESSAGE";
}

export function deleteIntraMessage(button: HTMLButtonElement) {
    const parentMsg = button.closest("p");
    if (parentMsg) {
        const tagId = parentMsg.id.replace("msg-index-", "");
        parentMsg.remove();
        stateProxyHandler.systemMessages = stateProxyHandler
            .systemMessages.filter(msg => msg.index !== Number(tagId));
    }
    //stateProxyHandler.state = "SYSTEM_MESSAGE";
}

export function renderSystemMessages() {
    console.log("Rendering system messages");
    const messageBox = document.getElementById('system-messages');
    if (!messageBox) return;

    messageBox.innerHTML = '';
    stateProxyHandler.systemMessages.forEach(msg => {
        const p = document.createElement('p');
        p.id = `msg-index-${msg.index}`;
        p.className = "m-2 text-sm text-black bg-yellow-100 p-2 rounded w-fit";
        p.innerHTML = `${msg.message}`;
        messageBox.appendChild(p);
    });
}

export function renderChatMessages(_: string, selectedChatId: number) {
    console.log("Rendering messages for chat ID:", selectedChatId);
    console.log("Messages:", stateProxyHandler.messages);
    const messageBox = document.getElementById('messages');
    if (!messageBox) return;

    // Create a new paragraph element for each message
    messageBox.innerHTML = '';
    // Get messages from the messageState.messages by selectedChatId
    const messages = stateProxyHandler.messages.get(selectedChatId) || [];
    messages.forEach(msg => {
        const p = document.createElement('p');
        p.id = `msg-${msg.timestamp}`;
        p.className = "m-2 text-sm text-black";
        if (Number(msg.from) === Number(profile.id)) {
            p.className += " bg-green-100 p-2 rounded w-fit ml-auto";
        } else {
            p.className += " bg-gray-100 p-2 rounded w-fit";
        }
        p.innerHTML = `${msg.message}`;
        messageBox.appendChild(p);
    })
}

export const messageListeners: (() => void)[] = [];

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
    renderChatMessages(stateProxyHandler.selectChat.name, stateProxyHandler.selectChat.id);
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

type StateKey = keyof StateProxyHandler;

const listeners: Record<StateKey, (() => void)[]> = {
    messages: [],
    serverUsers: [],
    friendList: [],
    chatBlockList: [],
    connectedUsers: [],
    selectChat: [],
    state: [],
    systemMessages: [],
};


export function onStateChange<K extends StateKey>(key: K, fn: () => void) {
    listeners[key].push(fn);
}


export interface StateProxyHandler {
    messages: Map<number, ChatMessage[]>;
    serverUsers: ServerUsersList[];
    friendList: FriendListType[];
    chatBlockList: number[];
    connectedUsers: { id: number; name: string }[];
    selectChat: { id: number; name: string };
    state: string;
    systemMessages: { index: number; message: string }[];
}

export const stateProxyHandler: StateProxyHandler = new Proxy({
    messages: new Map<number, ChatMessage[]>(),
    serverUsers: [],
    friendList: [],
    chatBlockList: [],
    connectedUsers: [],
    selectChat: { id: -1, name: '' },
    state: "",
    systemMessages: [],
}, {
    set(target, prop, value) {
        target[prop as keyof typeof target] = value;

        if (prop === 'state') {
            switch (value) {
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
                    renderChatMessages(stateProxyHandler.selectChat.name, stateProxyHandler.selectChat.id);
                    break;
                case "CHAT_HISTORY":
                    renderChatMessages(stateProxyHandler.selectChat.name, stateProxyHandler.selectChat.id);
                    break;
                case "SYSTEM_MESSAGE":
                    renderSystemMessages();
                    break;
            }
        }

        const key = prop as StateKey;
        if (listeners[key]) {
            listeners[key].forEach(fn => fn());
        }


        if (prop === 'selectChat') {
            changeChatHeader(stateProxyHandler.selectChat.name);
            const isIntra = stateProxyHandler.selectChat.id === -1;
            const chatMenu = document.getElementById("chat-menu");
            if (chatMenu) chatMenu.classList.remove("hidden");
            if (isIntra && chatMenu) {
                chatMenu.classList.add("hidden");
            };
            messageListeners.forEach(fn => fn());
        }

        if (prop === 'friendList') {
            messageListeners.forEach(fn => fn());
            console.log("Friend list updated:", stateProxyHandler.friendList);
        }

        if (prop === 'serverUsers') {
            messageListeners.forEach(fn => fn());
        }

        return true;
    }
});

