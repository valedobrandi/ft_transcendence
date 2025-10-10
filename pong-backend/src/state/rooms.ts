import { GameRoom } from "../classes/GameRoom.js";
import { PlayerType } from "../types/PlayerType.js";

const connectedRoom = new Map<string, PlayerType>();
const matchRoom: PlayerType[] = [];
const gameRoom = new Map<string, GameRoom >();

export { connectedRoom, matchRoom, gameRoom };