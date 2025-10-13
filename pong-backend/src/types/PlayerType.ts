import WebSocket from "ws";

export interface PlayerType {
    id: string;
    name: string;
    status: "CONNECT_ROOM" | "MATCH_ROOM" | "GAME_ROOM" | "TOURNAMENT_ROOM" | "GAME_START";
    socket: WebSocket;
    matchId: string;
    tournamentId: string;
	side: string;
}

export interface PlayerStatType {
    x: number;
    y: number;
    score: number;
};
