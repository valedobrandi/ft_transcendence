const socket: {websocket: WebSocket | null} = {websocket: null};

export function initSocket(VITE_BACKEND_HOST: string, username: string) {
    socket.websocket = new WebSocket(`ws://${VITE_BACKEND_HOST}/ws?username=${username}`);
    return socket.websocket;
}

export function getSocket() {
    if (socket === null) throw new Error('Socket not initialized');
    return socket.websocket;
}