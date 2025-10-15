import { navigateTo } from "../utils";
import { matchView } from "../views";
import { websocketStartMatch } from "../websocket/websocketStartMatch";

export function addMessage(chatId: string, message: string) {
    const messages = messagerState.messages.get(chatId) || [];
    messages.push(message);
    messagerState.messages.set(chatId, messages);
    renderMessages(chatId);
}

export function renderMessages(chatId: string) {
    const messageBox = document.getElementById('messages');
    if (!messageBox) return;
    
    const messages = messagerState.messages.get(chatId) || [];

    // Create a new paragraph element for each message
    messageBox.innerHTML = '';
    messages.forEach(msg => {
        const span = document.createElement('span');
        span.className = "font-bold lowercase";
        span.textContent = `#${chatId}: `;
        const p = document.createElement('p');
        p.className = "m-2 text-xs";
        p.innerHTML = `${msg}`;
        messageBox.appendChild(p);
        p.prepend(span);
    })
   
}

export function playLinkHandler(event: Event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('play-link')) {
        event.preventDefault();
        navigateTo("/match", matchView);
        websocketStartMatch();
    }
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
                    addMessage("INTRA", `you have joined the tournament queue.`);
                    break;
                case "MATCH_ROOM":
                    addMessage("INTRA", `you have joined the match queue.`);
                    break;
                case "GAME_ROOM":
                    addMessage("INTRA", `the match is ready...
                            <a href="#" class="play-link text-blue-500 underline">Play</a>`);
                    document.addEventListener('click', playLinkHandler);
                    break;
                case "GAME_OVER":
                    addMessage("INTRA", `the match is over.`);
                    break;
            }
        }

        return true;
    }
});


