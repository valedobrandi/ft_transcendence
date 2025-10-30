import { connectedRoomInstance } from "../../state/connectedRoom.js";
import { gameRoom } from "../../state/gameRoom.js";
import { MovePaddleType } from "../types.js";

export function MOVE_PADDLE(data: MovePaddleType) {
    const { username, payload } = data;
    const player = connectedRoomInstance.getById(username);
    if (!player || !player.matchId) return;
    const room = gameRoom.get(player.matchId);
    if (!room) return;
    room.updatePlayerInput(username, payload);
}