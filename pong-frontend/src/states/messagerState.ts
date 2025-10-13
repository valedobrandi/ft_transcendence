export function addMessage(chatId: string, message: string) {
    const messages = messagerState.messages.get(chatId) || [];
    messages.push(message);
    messagerState.messages.set(chatId, messages);
    renderMessages(chatId);
}

export function renderMessages(chatId: string) {
    const messageBox = document.getElementById('messages');
    if (!messageBox) return;
    messageBox.className = "text-xs";
    const messages = messagerState.messages.get(chatId) || [];
    
    messageBox.innerHTML = messages.map(msg => `<div class="mt-2">${msg}</div>`).join('');
}

export const messagerState = new Proxy({
    messages: new Map<string, string[]>([['INTRA', []]]),
    state: ""
}, {
    set(target, prop, value) {
        target[prop as keyof typeof target] = value;
        if (prop === 'state') {
            switch (value) {
                case "TOURNAMENT_ROOM":
                    addMessage("INTRA", `You have joined the tournament queue.`);
                    break;
            }
        }

        return true;
    }
});


