import { startGameLoop } from "./gameUpdateLoop.js";
import { watchMatchRoomLoop } from "./watchMatchRoomLoop.js";

export function startSchedulers() {
    watchMatchRoomLoop();
    startGameLoop();
}