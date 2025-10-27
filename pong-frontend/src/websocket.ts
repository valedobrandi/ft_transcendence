const socket: {websocket: WebSocket | null} = {websocket: null};

export function initSocket(VITE_BACKEND_HOST: string, id: string) {
    socket.websocket = new WebSocket(`ws://${VITE_BACKEND_HOST}/ws?id=${id}`);
    return socket.websocket;
}

export function getSocket() {
    if (socket === null) throw new Error('Socket not initialized');
    return socket.websocket;
}