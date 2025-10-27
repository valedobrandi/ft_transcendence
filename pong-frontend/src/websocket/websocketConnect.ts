import { id } from "../app";
import { getSocket } from "../websocket";

export function websocketConnect() {
    getSocket().onopen = () => {
        getSocket().send(JSON.stringify({
            type: "CONNECT", 
            id 
        }));
    }
};