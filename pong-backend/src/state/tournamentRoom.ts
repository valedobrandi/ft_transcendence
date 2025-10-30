import { Tournament } from "../classes/Tournament.js";
import { tournamentEvent } from "../events/tournamentQueueEvent.js";
import { connectedRoomInstance } from "./connectedRoom.js";

export const tournamentQueue: Set<string> = new Set();

export const tournamentRoom = new Map<string, Tournament>();

export function joinTournamentRoom(id: string) {
    tournamentQueue.add(id);
    const player = connectedRoomInstance.getById(id);
    if (player == undefined) return;
    player.status = 'TOURNAMENT_ROOM';

    if (player.socket) {
        player.socket.send(JSON.stringify({ status: 200, message: 'TOURNAMENT_ROOM' }))
    }

    if (tournamentQueue.size >= 4) {
        console.log('Tournament ready is starting;');
        tournamentEvent.emit('ready');
    }
}

export function getTournamentPlayers(): string[] | undefined {
    if (tournamentQueue.size === 0) return undefined;
    const iterator = tournamentQueue.values();
    const tournament: string[] = [];
    while (tournament.length < 4) {
        const next = iterator.next();
        if (next.done) break;

        const id = next.value;
        if (!connectedRoomInstance.has(id)) {
            tournamentQueue.delete(id);
            continue;
        }
        tournament.push(id);
    }
    if (tournament.length === 4) {
        for (const id of tournament) {
            tournamentQueue.delete(id);
        }
        return tournament;
    }
    return undefined;
}

tournamentEvent.on('ready', () => {
    const tournamentPlayers = getTournamentPlayers();
    if (tournamentPlayers == undefined) return;

    const tournamentId = crypto.randomUUID();
    const newTournament = new Tournament(tournamentId);

    for (const id of tournamentPlayers) {
        const player = connectedRoomInstance.getById(id);
        if (player == undefined) continue;
        player.tournamentId = tournamentId;
        newTournament.add(id);
    }

    tournamentRoom.set(tournamentId, newTournament);
})