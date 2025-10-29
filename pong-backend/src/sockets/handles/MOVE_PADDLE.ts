import { connectedRoomInstance } from "../../state/connectedRoom.js";
import { gameRoom } from "../../state/gameRoom.js";
import { MovePaddleType } from "../types.js";

export function MOVE_PADDLE(data: MovePaddleType) {
    const { id, payload } = data;
    const player = connectedRoomInstance.getById(id);
    if (!player || !player.matchId) return;
    const room = gameRoom.get(player.matchId);
    if (!room) return;
    room.updatePlayerInput(id, payload);
}