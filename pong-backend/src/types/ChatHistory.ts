import { ChatMessage } from "./ChatMessage";

export type ChatHistory = {
    sender: number[];
    history: ChatMessage[];
};