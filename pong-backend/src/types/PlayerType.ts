import WebSocket from "ws";
import ChatManager from "../classes/ChatManager.js";

export interface PlayerType {
    id: number | bigint;
    username: string;
    status: "CONNECTED" |
    "OFFLINE" |
    "MATCH" |
    "TOURNAMENT";
    socket: WebSocket | undefined;
    matchId: string | undefined;
    tournamentId: string | undefined;
    chat: ChatManager;
    state: "0" | "game.settings" | "match.waiting" | "3" | "tournament.waiting" | "invite.receive" | "invite.sent";
}

export interface PlayerStatType {
    x: number;
    y: number;
    score: number;
    username: string;
};
