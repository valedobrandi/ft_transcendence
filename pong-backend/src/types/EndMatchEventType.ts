import { PlayerType } from "../types/PlayerType.js";

export interface EndMatchEventType {
	matchId: string;
	winnerId: string;
	loserId: string;
	tournamentId: string | undefined;
}