class ChatStore {
    constructor(public userA: string, public userB: string) {}

    messages: { from: string; to:string, message: string; timestamp: number }[] = [];

    addMessage(from: string, to: string, message: string) {
        this.messages.push({ from, to, message, timestamp: Date.now() });
    }

    getHistory(user: string): string[] {
        return this.messages.map(msg => {
            const prefix = msg.from === this.userA ? 'You' : this.userB;
            return `${prefix}: ${msg.message}`;
        });
    }
}

export default ChatStore;