import { id } from "../app";
import type { ChatMessage } from "../interface/ChatMessage";
import { navigateTo, setTime } from "../utils";
import { websocketChatSend } from "../websocket/websocketChatSend";

export function addIntraMessage(message: string) {
    messageState.messages.has(1) || messageState.messages.set(1, []);
    messageState.messages.get(1)!.push({
    from: 1,
    to: id.id,
    senderId: 1,
    message: message,
    timestamp: Date.now(),
});
}

export function renderMessages(_: string, selectedChatId : number) {
    const messageBox = document.getElementById('messages');
    if (!messageBox) return;

    // Create a new paragraph element for each message
    messageBox.innerHTML = '';
    // Get messages from the messageState.messages by selectedChatId
    const messages = messageState.messages.get(selectedChatId) || [];
    messages.forEach(msg => {
        const p = document.createElement('p');
        p.className = "m-2 text-sm";
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

interface MessageStateType {
    messages: Map<number, ChatMessage[]>;
    serverUsersList: { id: string; name: string }[];
    friendList: { id: number; name: string }[];
    selectChat: { id: number; name: string };
    state: string;
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


export const messageState: MessageStateType = new Proxy({
    messages: new Map<number, ChatMessage[]>(),
    serverUsersList: [],
    friendList: [],
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

        if (prop === 'friendList') {
            messageListeners.forEach(fn => fn());
        }

        if (prop === 'selectChat') {
            changeChatHeader(messageState.selectChat.name);
            const isIntra = messageState.selectChat.name === 'INTRA';
            const chatMenu = document.getElementById("chat-menu");
            if (chatMenu) chatMenu.className = "flex border-b bg-gray-100 h-10";
            if (isIntra && chatMenu) {
                chatMenu.className += " hidden";
            };
        }

            return true;
    }
});


