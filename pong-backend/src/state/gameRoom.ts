import { GameSettings } from "../classes/PingPong.js";
import { PingPong } from "../classes/PingPong.js";
import { eventsBus } from "../events/EventsBus.js";
import { matchQueueEvent } from "../events/matchQueueEvent.js";
import { SettingsType } from "../types/GameStateType.js";
import { PlayerType } from "../types/PlayerType.js";
import { connectedRoomInstance } from "./ConnectedRoom.js";

export type NewInviteMatch = {
    players: { id: number; username: string }[];
    from: number;
    to: number;
    matchId: string;
    settings:  SettingsType | undefined;
}

export type NewMatch = {
  players: { id: number; username: string }[];
  createId: number;
  matchId: string;
  settings: SettingsType | undefined;
  status: "OPEN" | "PLAYING";
  type: "MATCH" | "TOURNAMENT";
};

export type SettingsMatch = {};

export const newMatchesQueue = new Map<string, NewMatch>();

export const inviteMatchesQueue = new Map<string, NewInviteMatch>();

export const matchQueue: Set<number> = new Set();

export const gameRoom = new Map<string, PingPong>();

export function startNewMatch(nextMatch: NewMatch | NewInviteMatch) {
  const [a, b] = nextMatch.players;
  
  eventsBus.emit('game:start', {
        matchId: nextMatch.matchId,
        oponentes: [a.username, b.username],
        settings: nextMatch.settings
    })

    return {message: 'success', data: `New match starting: ${a.username} X ${b.username}`}
 
}


export function joinMatchRoom(username: string, id: number) {
    matchQueue.add(id);
    const player = connectedRoomInstance.getById(id);
    if (player == undefined) return;
    player.status = 'MATCH';
    if (player.socket) {
        player.socket.send(JSON.stringify({ status: 200, message: 'MATCH' }))
    }

    if (matchQueue.size >= 2) {
        matchQueueEvent.emit('ready');
    }
}

export function getNextPlayers(): [string, string] | undefined {
    if (matchQueue.size < 2) return undefined;

    const iterator = matchQueue.values();

    let playerX: PlayerType | undefined;
    let playerY: PlayerType | undefined;

    while (playerX === undefined || playerY === undefined) {
        const next = iterator.next();
        if (next.done) break;

        const id = next.value;
        if (!connectedRoomInstance.has(id)) {
            matchQueue.delete(id);
            continue;
        }
        if (playerX === undefined) playerX = connectedRoomInstance.getById(id);
        else if (playerY === undefined) playerY = connectedRoomInstance.getById(id);

    }

    if (playerX && playerY) {
        matchQueue.delete(Number(playerX.id));
        matchQueue.delete(Number(playerY.id));
        return [playerX.username, playerY.username];
    }

    return undefined;
}


matchQueueEvent.on('ready', () => {

    const players = getNextPlayers();
    if (players == undefined) return;

    const [playerX, playerY] = players;
    const matchId = crypto.randomUUID();

    const newMatch = new PingPong(matchId);
    newMatch.createMatch(playerX, playerY);

})