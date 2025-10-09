import { BallType } from "./BallType.js";
import { UserType } from "./PlayerType.js";

export type PayloadType = {
    type: string;
    payload: {
        ball: BallType;
        players: {
            userX: UserType;
            userY: UserType;
        };
    };
}