import { playerInputs } from "../../state/playerInput.js";
import { connectedRoom } from "../../state/rooms.js";
import { MovePaddleType } from "../types.js";

export function MOVE_PADDLE(data: MovePaddleType) {
    const player = connectedRoom.get(data.id);
    const input = data.payload;
    if (player) {
        playerInputs.set(player.id, input);
    }
}