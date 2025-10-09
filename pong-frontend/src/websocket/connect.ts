import { socket, id } from "../app";

export function websocketConnect() {
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "CONNECT", 
            id 
        }));
    }
};