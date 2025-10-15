import { BallType } from "./BallType.js";
import { PlayerStatType } from "./PlayerType.js";

export type PayloadType = {
    type: string;
    payload: {
        ball: BallType;
        players: {
            userX: PlayerStatType;
            userY: PlayerStatType;
        };
    };
}