import { PingPong } from "../classes/PingPong.js";
import { eventsBus } from "../events/EventsBus.js";
import { matchQueueEvent } from "../events/matchQueueEvent.js";
import { PlayerType } from "../types/PlayerType.js";
import { connectedRoomInstance } from "./ConnectedRoom.js";

export type NewInviteMatch = {
    players: number[];
    from: number;
    to: number;
    settings: {}
}

export type NewMatch = {
    players: number[];
    matchId: number;
    settings: {};
}

export type SettingsMatch = {}

export const newMatchesQueue = new Map<string, NewMatch>();

export const inviteMatchesQueue = new Map<string, NewInviteMatch>();

export const matchQueue: Set<number> = new Set();

export const gameRoom = new Map<string, PingPong>();

export function jointInviteMatch(matchId: string) {
    const newMatch = inviteMatchesQueue.get(matchId);
    if (newMatch === undefined) {
        return { message: 'success', data: 'match not found' };
    }

    inviteMatchesQueue.delete(matchId);

    const oponentes = [connectedRoomInstance.getById(newMatch.from),
    connectedRoomInstance.getById(newMatch.to)];


    if (oponentes[0] === undefined || oponentes[1] === undefined) {
        return { message: 'success', data: 'disconnected' }
    }


    eventsBus.emit('game:start', {
        matchId: matchId,
        oponentes: [oponentes[0].username, oponentes[1].username],
        settings: newMatch.settings
    })

    return {message: 'success', data: `New match: ${oponentes[0].username} X oponentes[1].username`}

}

export function joinMatchRoom(username: string, id: number) {
    matchQueue.add(id);
    const player = connectedRoomInstance.getById(id);
    if (player == undefined) return;
    player.status = 'MATCH_QUEUE';
    if (player.socket) {
        player.socket.send(JSON.stringify({ status: 200, message: 'MATCH_ROOM' }))
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