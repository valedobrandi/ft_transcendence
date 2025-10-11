import type { BallType } from "./ball";
import type { PlayerType } from "./player";

export interface GameStateType {
    ball: BallType; 
    players: { userX: PlayerType; userY: PlayerType };
}