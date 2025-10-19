import WebSocket from "ws";
import ChatManager from "../classes/ChatManager.js";

export interface PlayerType {
    id: string;
    name: string;
    status: "CONNECT_ROOM" | "MATCH_ROOM" | "GAME_ROOM" | "TOURNAMENT_ROOM" | "GAME_START";
    socket: WebSocket;
    matchId: string;
    tournamentId: string | undefined;
	matchSide: string;
    chat: ChatManager;
}

export interface PlayerStatType {
    x: number;
    y: number;
    score: number;
};
