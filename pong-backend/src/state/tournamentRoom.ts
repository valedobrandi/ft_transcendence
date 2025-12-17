import { Tournament } from "../classes/Tournament.js";
import { connectedRoomInstance } from "./ConnectedRoom.js";

export const tournamentQueue: Set<number> = new Set();

export const tournamentRoom = new Map<string, Tournament>();

export function joinTournamentQueue(id: number) {

	tournamentQueue.add(id);
	broadcastTournamentQueueUpdate();
	if (tournamentQueue.size >= 4) {
		initializeTournament();
	}
}

export function broadcastTournamentQueueUpdate() {
	// send the id of connected users in the tournament queue
	const ids = Array.from(tournamentQueue);
	for (const id of tournamentQueue) {
		connectedRoomInstance.broadcastWebsocketMessage(
			id,
			"tournament.queue",
			{ queue: ids });
	}
}

export function initializeTournament() {
	if (tournamentQueue.size < 4) return;

	const tournament: { id: number, username: string }[] = [];

	for (const id of tournamentQueue) {
		const connected = connectedRoomInstance.getById(id);
		if (!connected) {
			tournamentQueue.delete(id);
			continue;
		}

		tournament.push({ id: id, username: connected.username });

		if (tournament.length === 4) break;

	}

	if (tournament.length < 4) return;

	for (const p of tournament) {
		tournamentQueue.delete(p.id);
	}


	broadcastTournamentQueueUpdate();
	const tournamentId = crypto.randomUUID();
	const newTournament = new Tournament(tournamentId);

	for (const { id, username } of tournament) {
		const connected = connectedRoomInstance.getById(id);
		if (connected) {
			connected.status = "TOURNAMENT";
			newTournament.joinTournament(username);
		}

		tournamentRoom.set(tournamentId, newTournament);
	}
}

