export type ChatMessage = {
    from: number;
    to: number;
    senderId: number;
    message: string;
    timestamp: number;
}