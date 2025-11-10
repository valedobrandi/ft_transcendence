import type { ChatMessage } from "./ChatMessage";

export type ChatDataHistory = {
    sender: number[];
    history: ChatMessage[];
};