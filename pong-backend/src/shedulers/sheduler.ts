import { watchMatchRoomLoop } from "./watchMatchRoomLoop.js";

export function startSchedulers() {
    watchMatchRoomLoop();
}