const userX = {x: 0, y: 0, score: 0};
const userY = {x: 0, y: 0, score: 0};
const playerSide: { side: "left" | "right" } = {side: "left" };
const ball = {
    x: 0,
    y: 0,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
  }
export {userX, userY, ball, playerSide};