import { id } from "../app";
import type { ChatHistory } from "../interface/chatHistory";
import { navigateTo, setTime } from "../utils";

export function addMessage(history: ChatHistory, sender = id.username) {
    // if (!messagerState.messages.has(history.from)) {
    //     messagerState.messages.set(history.from, []);
    // }
    // messagerState.messages.get(history.from)!.push({ chat: history.message, sender });
    // if (history.from === messagerState.selectChat.name) {
    //     renderMessages(history.from);
    // }
}

export function renderMessages(username: string, userId : number) {
    const messageBox = document.getElementById('messages');
    if (!messageBox) return;

    // Create a new paragraph element for each message
    messageBox.innerHTML = '';
    messagerState.messages.filter(msg =>
		Number(msg.senderId) === userId || Number(msg.to) === userId)
		.forEach(msg => {
		console.log(`Rendering message for chat from ${msg.senderId} at ${username}:${userId}:`, msg);
		// Show messages if the to or from matches the selected chat id

        const span = document.createElement('span');
        span.className = "font-bold lowercase text-lg";
		// Show menssage buble differently and rigth / left if sent by self or other
		if (Number(msg.senderId) === Number(id.id)) {
			span.classList.add("bg-blue-500");
			span.classList.add("mr-auto");
		} else {
			span.classList.add("bg-gray-300");
			span.classList.add("ml-auto");
		}
        span.textContent = Number(msg.senderId) === Number(id.id) ? `` : `#${username}: `;
        const p = document.createElement('p');
        p.id = 'id-message';
        p.className = "m-2 text-xs";
        p.innerHTML = `${msg.message}`;
        messageBox.appendChild(p);
        p.prepend(span);
    })
}

const messagerListeners: (() => void)[] = [];

export function onMessagerChange(fn: () => void) {
    messagerListeners.push(fn);
}

interface MessagerStateType {
    messages: ChatHistory[];
    connected: { id: string; name: string }[];
    state: string;
    selectChat: { id: number; name: string };
}

export function changeChatHeader(header: string) {
    const chatHeader = document.getElementById('chat-tabs');
    if (!chatHeader) return;

    const tab = document.createElement('h1');
    tab.innerHTML = '';
    tab.textContent = `#${header}`;
    tab.className = 'm-auto font-bold';
    renderMessages(messagerState.selectChat.name, messagerState.selectChat.id);
    chatHeader.innerHTML = '';
    chatHeader.appendChild(tab);
}

export interface MessageType {
    chat: string;
    sender: string;
}


export const messagerState: MessagerStateType = new Proxy({
    messages: [],
    connected: [],
    selectChat: { id: 0, name: 'INTRA' },
    state: "",
}, {
    set(target, prop, value) {
        target[prop as keyof typeof target] = value;

        if (prop === 'state') {
            switch (value) {
                case "TOURNAMENT_ROOM":
                    //addMessage("INTRA", `you have joined the tournament queue.`);
                    break;
                case "MATCH_ROOM":
                    //addMessage("INTRA", `you have joined the match queue.`);
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
            }
        }

        if (prop === 'connected') {
            messagerListeners.forEach(fn => fn());
        }

        if (prop === 'selectChat') {
            changeChatHeader(messagerState.selectChat.name);
            const isIntra = messagerState.selectChat.name === 'INTRA';
            const chatMenu = document.getElementById("chat-menu");
            if (chatMenu) chatMenu.className = "flex border-b bg-gray-100 h-10";
            if (isIntra && chatMenu) chatMenu.className += " hidden";
        }

		if (prop === 'messages') {
			renderMessages(messagerState.selectChat.name, messagerState.selectChat.id);
		}

        return true;
    }
});


