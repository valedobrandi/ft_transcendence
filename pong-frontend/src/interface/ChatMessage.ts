export type ChatMessage = {
    id: number;
    from: number;
    to: number;
    senderId: number;
    message: string;
    timestamp: number;
    isRead: number;
}