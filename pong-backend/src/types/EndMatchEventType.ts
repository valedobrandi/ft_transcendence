import { PlayerType } from "../types/PlayerType.js";

export interface EndMatchEventType {
	matchId: string;
	winner: PlayerType;
	loser: PlayerType;
	tournamentId: string | undefined;
}