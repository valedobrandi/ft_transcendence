import { randomUUID } from "crypto";
import { Tournament } from "../classes/Tournament.js";
import { tournamentEvent } from "../events/tournamentQueueEvent.js";
import { PlayerType } from "../types/PlayerType.js";

const queueRoom: PlayerType[] = [];
export const tournamentRoom = new Map<string, Tournament>();

export function joinTournamentRoom(player: PlayerType) {
	queueRoom.push(player);
	
	player.status = 'TOURNAMENT_ROOM';

	player.socket.send(JSON.stringify({ status: 200, message: 'TOURNAMENT_ROOM' }))

	if (queueRoom.length == 8) {
        console.log('Tournament ready with 8 players');
        tournamentEvent.emit('ready');
	}
}

export function getTournamentPlayers(): PlayerType[] | null {
	if (queueRoom.length === 0) return null;
    return queueRoom.splice(0, 8);
}

tournamentEvent.on('ready', () => {
    const tournamentPlayers = getTournamentPlayers();
    if (tournamentPlayers ==  undefined) return;

    const tournamentId = crypto.randomUUID();

    const newTournament = new Tournament(tournamentId);

    for (const player of tournamentPlayers) {
        player.tournamentId = tournamentId;
        newTournament.add(player);
    }

    tournamentRoom.set(tournamentId, newTournament);
})