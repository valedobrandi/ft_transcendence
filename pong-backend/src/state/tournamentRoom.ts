import { Tournament } from "../classes/Tournament.js";
import { tournamentEvent } from "../events/tournamentQueueEvent.js";
import { print } from "../server.js";
import { connectedRoomInstance } from "./ConnectedRoom.js";

export const tournamentQueue: Set<number> = new Set();

export const tournamentRoom = new Map<string, Tournament>();

export function joinTournamentQueue(id: number) {

	tournamentQueue.add(id);
	broadcastTournamentQueueUpdate();
	if (tournamentQueue.size >= 4) {
		//print('Tournament ready is starting;');
		tournamentEvent.emit('ready');
	}
}

export function broadcastTournamentQueueUpdate() {
	// send the id of connected users in the tournament queue
	const ids = Array.from(tournamentQueue);
	for (const id of tournamentQueue) {
		connectedRoomInstance.broadcastWebsocketMessage(
			id, 
			"tournament.queue", 
			{ queue:  ids} );
	}
}

export function getConnected(): { id: number, username: string }[] | undefined {
	if (tournamentQueue.size === 0) return undefined;

	const iterator = tournamentQueue.values();

	const tournament: { id: number, username: string }[] = [];


	while (tournament.length < 4) {
		const next = iterator.next();
		if (next.done) break;

		const id = next.value;
		const connected = connectedRoomInstance.getById(id);
		if (!connected) {
			tournamentQueue.delete(id);
			continue;
		}
		tournament.push({ id: Number(connected.id), username: connected.username });
	}

	if (tournament.length === 4) {
		for (const p of tournament) {
			tournamentQueue.delete(p.id);
		}
		broadcastTournamentQueueUpdate();
		return tournament;
	}

	return undefined;
}

tournamentEvent.on('ready', () => {
	const tournamentPlayers = getConnected();
	if (tournamentPlayers === undefined) return;

	const tournamentId = crypto.randomUUID();
	const newTournament = new Tournament(tournamentId);

	for (const {id, username} of tournamentPlayers) {
		const connected = connectedRoomInstance.getById(id);
		if (connected) {
			connected.tournamentId = tournamentId;
		}
		newTournament.add(username);
	}

	tournamentRoom.set(tournamentId, newTournament);
})