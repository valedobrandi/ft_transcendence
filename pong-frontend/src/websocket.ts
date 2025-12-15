import { profile } from "./app";
import { endpoint } from "./endPoints";

const socket: { websocket: WebSocket | null } = { websocket: null };


export function closeSocket() {
    if (socket.websocket) {
        socket.websocket.close();
        socket.websocket = null;
    }
}

export function initSocket() {
    if (!socket.websocket) {
        socket.websocket = new WebSocket(`${endpoint.pong_backend_websocket}?username=${profile.username}`);
    }
    return socket.websocket;
}

export function getSocket() {
    return socket.websocket;
}