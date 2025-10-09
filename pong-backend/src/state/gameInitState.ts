import { BallType } from "../types/BallType.js";
import { UserType } from "../types/PlayerType.js";

export const gameState = {
    userX: {x: 0.01, y: 0.5, score: 0 } as UserType,
    userY: {x: 0.99, y: 0.5, score: 0 } as UserType,
    ball: {
      x: 0.5,
      y: 0.5,
      radius: 0.02,
      speed: 0.01,
      velocityX: 0.01,
      velocityY: 0.01,
    } as BallType,
  };