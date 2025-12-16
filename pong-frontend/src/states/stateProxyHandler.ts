import { onClickGetProfileData } from "../components/UsersList";
import type { ChatMessage } from "../interface/ChatMessage";

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
    tab.className = 'm-auto font-bold text-white text-2xl tracking-wide';
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
    isConnect: boolean;
};

export type NewMatch = {
    createId: number;
    players: number[];
    matchId: string;
    tournamentId: string;
    type: "MATCH" | "TOURNAMENT";
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
    chat: [],
    state: [],
    availableMatches: [],
    matchesHistory: [],
    profile: [],
    reset: [],
    settings: [],
    paddle: [],
    tournamentQueue: [],
    invite: [],
    friendRequests: [],
};

export function onStateChange<K extends StateKey>(key: K, fn: () => void) {
    listeners[key].push(fn);
}

export function getStorageStates() {
    const PERSISTED_KEYS: (keyof State)[] = [
        "paddle",
        "state",
        "settings",
        "tournamentQueue",
        "invite"
    ];
    PERSISTED_KEYS.forEach((key) => {
        const stored = localStorage.getItem(key);
        if (stored) {
            const value = JSON.parse(stored);
            (stateProxyHandler as any)[key] = value;
        }
    });
}

export function removeLocalStorage() {
    console.log("[REMOVE LOCAL STORAGE]");
    const PERSISTED_KEYS: (keyof State)[] = [
        "paddle",
        "state",
        "settings",
        "tournamentQueue",
        "invite"
    ];
    PERSISTED_KEYS.forEach((key) => {
        localStorage.removeItem(key);
    });
}

export interface StateProxyHandler {
    // API CALLS
    friendList: FriendListType[];
    chatBlockList: number[];
    matchesHistory: MatchesHistory;

    // WEBSOCKET STATE
    availableMatches: NewMatch[]; //match:list"
    serverUsers: ServerUsersList[]; //SERVER_USERS
    messages: Record<number, ChatMessage[]>; //CHAT_HISTORY"
    friendRequests: { id: number; username: string, eventId: number }[]; //websocketNewEvents()

    // UI STATE
    profile: { username: string, avatar: string };
    chat: { id: number; name: string };

    paddle: { height: number, width: number };
    state: "CONNECTED" | "MATCH" | "TOURNAMENT",
    settings: { state: "0" | "game.settings" | "match.waiting" | "match.playing" | "tournament.waiting" | "invite.receive" | "invite.sent" };
    tournamentQueue: { id: number; username: string }[];
    invite: { matchId: string; id: number; username: string } | undefined;
    reset: () => void;
}

class State {
    messages!: Record<number, ChatMessage[]>;;
    serverUsers!: ServerUsersList[];
    friendList!: FriendListType[];
    chatBlockList!: number[];
    chat!: { id: number; name: string };
    state!: "CONNECTED" | "MATCH" | "TOURNAMENT"
    availableMatches!: NewMatch[];
    matchesHistory!: MatchesHistory;
    profile!: { username: string, avatar: string };
    settings!: {
        state: "0" | 
        "game.settings" | 
        "match.waiting" | 
        "match.playing" | 
        "tournament.waiting" | 
        "invite.receive" | "invite.sent"
    };
    paddle!: { height: number, width: number };
    tournamentQueue!: { id: number; username: string }[];
    invite!: { matchId: string; id: number; username: string } | undefined;
    friendRequests!: { id: number; username: string, eventId: number }[];


    constructor() {
        this.reset();
    }

    reset() {
        this.messages = {};
        this.serverUsers = [];
        this.friendList = [];
        this.chatBlockList = [];
        this.chat = { id: -1, name: "" };
        this.state = "CONNECTED";
        this.availableMatches = [];
        this.matchesHistory = { wins: 0, loses: 0, history: [] };
        this.profile = { username: "", avatar: "" };
        this.settings = { state: '0' };
        this.paddle = { height: 0.150, width: 0.020 };
        this.tournamentQueue = [];
        this.invite = undefined;
        this.friendRequests = [];
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

        const key = prop as StateKey;
        if (listeners[key]) {
            listeners[key].forEach(fn => fn());
        }

        if (prop === "chat") {
            changeChatHeader(target.chat.name);

            const isIntra = target.chat.id === -1;

            const chatMenu = document.getElementById("chat-menu");

            if (chatMenu) chatMenu.classList.remove("hidden");

            if (isIntra && chatMenu) {
                chatMenu.classList.add("hidden");
            };
            messageListeners.forEach(fn => fn());

            // CHANGE PROFILE DATA
            queueMicrotask(() => onClickGetProfileData());
        }

        return true;
    }
});





