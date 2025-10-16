import { PlayerType } from "../types/PlayerType.js";

const connectedRoom = new Map<string, PlayerType>();


export function broadcastConnectedRoom() {
    // Get users names and ids
    const users = Array.from(connectedRoom.values()).map(({ id, name }) => ({ id, name }));
    // Add a user INTRA
    users.unshift({ id: "INTRA", name: "INTRA" });
  
    // Send the users to every user
    connectedRoom.forEach(({ socket }) => {
        socket.send(JSON.stringify({ message: "CONNECTED_USERS", users }));
    });
}

export { connectedRoom };