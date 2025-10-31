const socket: {websocket: WebSocket | null} = {websocket: null};

export function initSocket(VITE_BACKEND_WEBSOCKET: string, username: string) {
    socket.websocket = new WebSocket(`${VITE_BACKEND_WEBSOCKET}?username=${username}`);
    return socket.websocket;
}

export function getSocket() {
    if (socket === null) throw new Error('Socket not initialized');
    return socket.websocket;
}