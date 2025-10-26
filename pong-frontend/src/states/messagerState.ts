import { id } from "../app";
import { navigateTo, setTime } from "../utils";
import { intraView, matchView } from "../views";

export function addMessage(chatId: string, chat: string, sender = id) {
    if (!messagerState.messages.has(chatId)) {
        messagerState.messages.set(chatId, []);
    }
    messagerState.messages.get(chatId)!.push({ chat, sender });
    if (chatId === messagerState.selectChat) {
        renderMessages(chatId);
    }
}

export function renderMessages(chatId: string) {
    const messageBox = document.getElementById('messages');
    if (!messageBox) return;

    const messages = messagerState.messages.get(chatId) || [];

    // Create a new paragraph element for each message
    messageBox.innerHTML = '';
    messages.forEach(msg => {
        const span = document.createElement('span');
        span.className = "font-bold lowercase";
        span.textContent = msg.sender === id ? `` : `#${chatId}: `;
        const p = document.createElement('p');
        p.id = 'id-message';
        p.className = "m-2 text-xs";
        p.innerHTML = `${msg.chat}`;
        messageBox.appendChild(p);
        p.prepend(span);
    })
}

const messagerListeners: (() => void)[] = [];

export function onMessagerChange(fn: () => void) {
    messagerListeners.push(fn);
}

interface MessagerStateType {
    messages: Map<string, MessageType[]>;
    connected: { id: string; name: string }[];
    state: string;
    selectChat: string;
}

export function changeChatHeader(header: string) {
    const chatHeader = document.getElementById('chat-tabs');
    if (!chatHeader) return;

    const tab = document.createElement('h1');
    tab.innerHTML = '';
    tab.textContent = `#${header}`;
    tab.className = 'm-auto font-bold';
    renderMessages(messagerState.selectChat);
    chatHeader.innerHTML = '';
    chatHeader.appendChild(tab);
}

export interface MessageType {
    chat: string;
    sender: string;
}


export const messagerState: MessagerStateType = new Proxy({
    messages: new Map<string, MessageType[]>([['INTRA', []]]),
    connected: [],
    selectChat: "INTRA",
    state: "",
}, {
    set(target, prop, value) {
        target[prop as keyof typeof target] = value;

        if (prop === 'state') {
            switch (value) {
                case "TOURNAMENT_ROOM":
                    addMessage("INTRA", `you have joined the tournament queue.`);
                    break;
                case "MATCH_ROOM":
                    addMessage("INTRA", `you have joined the match queue.`);
                    break;
                case "GAME_ROOM":
                    setTime(5000, () => {
                        navigateTo("/match", matchView);
                    });
                    break;
                case "GAME_OVER":
                    setTime(5000, () => {
                        navigateTo("/intra", intraView);
                    });
                    break;
            }
        }

        if (prop === 'connected') {
            messagerListeners.forEach(fn => fn());
        }

        if (prop === 'selectChat') {
            changeChatHeader(messagerState.selectChat);
            const isIntra = messagerState.selectChat === 'INTRA';
            const chatMenu = document.getElementById("chat-menu");
            if (chatMenu) chatMenu.className = "flex border-b bg-gray-100 h-10";
            if (isIntra && chatMenu) chatMenu.className += " hidden";

        }

        return true;
    }
});


