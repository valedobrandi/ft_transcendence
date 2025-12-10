import { profile } from "../app";
import { onClickGetProfileData } from "../components/UsersList";
import type { ChatMessage } from "../interface/ChatMessage";
import { navigateTo, setTime } from "../utils";

export function newIntraMessage(message: string): number {
    stateProxyHandler.systemMessages = [...stateProxyHandler.systemMessages, {
        message: message,
        index: (stateProxyHandler.systemMessages.length),
    }];
    return stateProxyHandler.systemMessages.length - 1;
}

export function updateIntraMessage(idx: number, newMessage: string) {
    stateProxyHandler.systemMessages = stateProxyHandler.systemMessages.map(msg => {
        if (msg.index === idx) {
            return { ...msg, message: newMessage };
        }
        return msg;
    });
}

export function removeIntraMessage(idx: number) {
    // Update message to "" by index
    stateProxyHandler.systemMessages = stateProxyHandler.systemMessages.map(msg => {
        if (msg.index === idx) {
            return { ...msg, message: "" };
        }
        return msg;
    });
}

export function findIntraMessage(tagId: string) {
    const idx = stateProxyHandler.systemMessages.findIndex(
        msg => msg.message.includes(tagId)
    );
    return idx;
}

export function renderSystemMessages() {
    //console.log("Rendering system messages");
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
    //console.log("Rendering messages for chat ID:", selectedChatId);
    //console.log("Messages:", stateProxyHandler.messages);
    const messageBox = document.getElementById('messages');
    if (!messageBox) return;

    // Create a new paragraph element for each message
    messageBox.innerHTML = '';
    // Get messages from the messageState.messages by selectedChatId
    const messages = stateProxyHandler.messages.get(selectedChatId) || [];
    messages.forEach(msg => {
        const p = document.createElement('p');
        p.id = `msg-${msg.timestamp}`;
        p.className = "m-2 text-sm text-white max-w-xs break-words";
        if (Number(msg.from) === Number(profile.id)) {
            p.className += " p-2 rounded-lg w-fit ml-auto bg-[hsl(345,100%,47%)] text-white shadow-sm";
        } else {
            p.className += " p-2 rounded-lg w-fit bg-[#36393e] text-white shadow-sm";
        }
        p.innerHTML = `${msg.message}`;
        messageBox.appendChild(p);
    });
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

export type NewMatch = {
    createId: number;
    players: number[];
    matchId: number;
    status: string;
    settings: {};
}

export type MatchesHistory = {
    wins: number;
    loses: number;
    history: {
        createdAt: string;
        player1: string;
        score1: number;
        player2: string;
        score2: number;
    }[]
}


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
    availableMatches: [],
    matchesHistory: [],
    profile: [],
    reset: [],
    settings: [],
    paddle: [],
};

export function onStateChange<K extends StateKey>(key: K, fn: () => void) {
     //console.log("Listener registered for settings");
    listeners[key].push(fn);
}

export interface StateProxyHandler {
    messages: Map<number, ChatMessage[]>;
    serverUsers: ServerUsersList[];
    friendList: FriendListType[];
    chatBlockList: number[];
    connectedUsers: { id: number; name: string }[];
    selectChat: { id: number; name: string };
    state: "CONNECT_ROOM" |
    "MATCH_QUEUE" |
    "MATCH_ROOM" |
    "TOURNAMENT_QUEUE" |
    "TOURNAMENT_ROOM" |
    "GAME_ROOM" |
    "GAME_START" |
    "SEND_INVITE" |
    "MATCH_INVITE",
    systemMessages: { index: number; message: string }[];
    availableMatches: NewMatch[];
    matchesHistory: MatchesHistory;
    profile: { username: string, avatar: string };
    settings: { state: string };
    paddle: { height: number, width: number };
    reset: () => void;
}

class State {
  messages!: Map<number, ChatMessage[]>;
    serverUsers!: ServerUsersList[];
    friendList!: FriendListType[];
    chatBlockList!: number[];
    connectedUsers!: { id: number; name: string }[];
    selectChat!: { id: number; name: string };
    state!: "CONNECT_ROOM" |
    "MATCH_QUEUE" |
    "MATCH_ROOM" |
    "TOURNAMENT_QUEUE" |
    "TOURNAMENT_ROOM" |
    "GAME_ROOM" |
    "GAME_START" |
    "SEND_INVITE" |
    "MATCH_INVITE";
    systemMessages!: { index: number; message: string }[];
    availableMatches!: NewMatch[];
    matchesHistory!: MatchesHistory;
    profile!: { username: string, avatar: string };
    settings!: { state: string };
    paddle!: { height: number, width: number };

  constructor() {
    this.reset();
  }

  reset() {
    this.messages = new Map();
    this.serverUsers = [];
    this.friendList = [];
    this.chatBlockList = [];
    this.connectedUsers = [];
    this.selectChat = { id: -1, name: "" };
    this.state = "CONNECT_ROOM";
    this.systemMessages = [];
    this.availableMatches = [];
    this.matchesHistory = { wins: 0, loses: 0, history: [] };
    this.profile = { username: "", avatar: "" };
    this.settings = {state: '0'};
    this.paddle = { height: 0.150, width: 0.020};
  }
}

export const stateProxyHandler: StateProxyHandler = new Proxy(
   new State(), {
    get(target, prop) {
        if (prop === 'reset') {
            return () => {
                target.reset();
            };
        }
        return target[prop as keyof typeof target];
    },
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
                    renderChatMessages(target.selectChat.name, target.selectChat.id);
                    break;
                case "CHAT_HISTORY":
                    renderChatMessages(target.selectChat.name, target.selectChat.id);
                    break;
                case "SYSTEM_MESSAGE":
                    renderSystemMessages();
                    break;
            }
        }

        const key = prop as StateKey;
        if (listeners[key]) {
            //console.log("Notifying listeners for key:", key);
            listeners[key].forEach(fn => fn());
        }

        if (prop === 'selectChat') {
            changeChatHeader(target.selectChat.name);

            const isIntra = target.selectChat.id === -1;

            const chatMenu = document.getElementById("chat-menu");

            if (chatMenu) chatMenu.classList.remove("hidden");
			
            if (isIntra && chatMenu) {
                chatMenu.classList.add("hidden");
            };
            messageListeners.forEach(fn => fn());

            // CHANGE PROFILE DATA
            queueMicrotask(() => onClickGetProfileData());
        }

        if (prop === 'friendList') {
            messageListeners.forEach(fn => fn());
            //console.log("Friend list updated:", target.friendList);
        }

        if (prop === 'serverUsers') {
            messageListeners.forEach(fn => fn());
        }

        return true;
    }
});





