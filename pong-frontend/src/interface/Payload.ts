import type { BallType } from "./ball";

interface PlayerStat {
    x: number;
    y: number;
    score: number;
};


export type Payload = {
    type: string;
    payload: {
        ball: BallType;
        players: {
            userX: PlayerStat;
            userY: PlayerStat;
        };
    };
}

