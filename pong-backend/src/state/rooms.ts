import { PlayerType } from "../types/PlayerType.js";

const connectedRoom = new Map<string, PlayerType>();
const matchRoom: PlayerType[] = [];
const gameRoom = new Map<string, string[] >();

export { connectedRoom, matchRoom, gameRoom };