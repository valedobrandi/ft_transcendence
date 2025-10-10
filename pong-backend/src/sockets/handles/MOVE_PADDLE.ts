import { connectedRoom, gameRoom } from "../../state/rooms.js";
import { MovePaddleType } from "../types.js";

export function MOVE_PADDLE(data: MovePaddleType) {
    const { id, payload } = data;
    const player = connectedRoom.get(id);
    if (!player || !player.matchId) return;
    const room = gameRoom.get(player.matchId);
    if (!room) return;
    const input = data.payload;
    room.updatePlayerInput(id, payload);
}