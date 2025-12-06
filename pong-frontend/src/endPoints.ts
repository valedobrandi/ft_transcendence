const VITE_PONG_BACKEND_WEBSOCKET = import.meta.env.VITE_PONG_BACKEND_WEBSOCKET;
const VITE_PONG_BACKEND_API = import.meta.env.VITE_PONG_BACKEND_API;

const endpoint = {
	pong_backend_api: VITE_PONG_BACKEND_API || 'http://localhost:3000/api',
    pong_backend_websocket: VITE_PONG_BACKEND_WEBSOCKET || 'ws://localhost:3000/ws',
}

export { endpoint };
