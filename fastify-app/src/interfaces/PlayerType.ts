import WebSocket from "ws";

export interface PlayerType {
    id: string;
    name: string;
    status: "CONNECT_ROOM" | "MATCH_ROOM" | "GAME_ROOM";
    socket: WebSocket;
    matchId: string;
	side: string;
}
