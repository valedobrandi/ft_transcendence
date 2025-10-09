import { GameStateType } from "./GameStateType.js";
import { PlayerType } from "./PlayerType.js";

export interface GameSessionType {
    id: string;
    playerX: PlayerType;
    playerY: PlayerType;
    state: GameStateType;
    status: "WAITING" | "PLAYING" | "COMPLETED";
}