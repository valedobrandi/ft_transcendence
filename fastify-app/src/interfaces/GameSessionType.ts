import { GameStateType } from "./GameStateType";
import { PlayerType } from "./PlayerType";

export interface GameSessionType {
    id: string;
    playerX: PlayerType;
    playerY: PlayerType;
    state: GameStateType;
    status: "WAITING" | "PLAYING" | "COMPLETED";
}