import WebSocket from "ws";
import ChatManager from "../classes/ChatManager.js";

export interface PlayerType {
    id: number | bigint;
    username: string;
    status: "CONNECT_ROOM" |
    "MATCH_QUEUE" |
    "TOURNAMENT_QUEUE" |
    "TOURNAMENT_ROOM" |
    "GAME_ROOM" |
    "GAME_START";
    socket: WebSocket | undefined;
    matchId: string;
    tournamentId: string | undefined;
    chat: ChatManager;
    friendSet: Set<number | bigint>;
}

export interface PlayerStatType {
    x: number;
    y: number;
    score: number;
};
