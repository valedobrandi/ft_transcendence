import type { BallType } from "./ball";
import type { PlayerType } from "./player";

export interface GameStateType {
    ball: BallType;
    paddleHeight: number;
    players: { userX: PlayerType; userY: PlayerType };
}
