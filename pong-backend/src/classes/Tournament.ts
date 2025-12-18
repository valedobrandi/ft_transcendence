import { events } from "../events/EventsBus.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { tournamentRoom } from "../state/tournamentRoom.js";
import { EndMatchEventType } from "../types/EndMatchEventType.js";
import { PingPong } from "./PingPong.js";

class Tournament {
	tournamentId: string;
	currentBracket: Set<string>;
	currentRoundWinners: Set<string>;
	nextBracket: Set<string> = new Set<string>();
	tournamentIntra: string[] = [];
	tournamentConnecters: string[] = [];
	private matches = 0;
	private rounds = 0;
	private matchRound = 1;
	cleanup: () => void = () => { };

	constructor(tournamentId: string) {
		this.tournamentId = tournamentId;
		this.currentBracket = new Set<string>();
		this.currentRoundWinners = new Set<string>();

		const matchEndedListener = (report: EndMatchEventType) => {
			if (report.tournamentId != this.tournamentId) return;
			this.reportMatchResult(report);
		}

		events.on('tournament_match_end', matchEndedListener);
		this.cleanup = () => events.off('tournament_match_end', matchEndedListener);
	}

	joinTournament(username: string) {
		if (this.currentBracket.size >= 4) return;

		this.currentBracket.add(username);
		this.tournamentConnecters.push(username);

		if (this.currentBracket.size == 4) {
			// CLEAR PLAYER FROM TOURNAMENT POOL

			this.broadcastIntraMessage(
			   `${this.tournamentConnecters[0]}, 
				${this.tournamentConnecters[1]},
				${this.tournamentConnecters[2]}, 
				${this.tournamentConnecters[3]}`,
			);
			this.startRound();
		}
	}

	async startRound() {
		if (this.currentBracket.size % 2 !== 0) return;

		this.rounds = Math.floor(this.currentBracket.size / 2);
		this.currentRoundWinners = new Set<string>();
		this.matches = 0;

		const connecters = Array.from(this.currentBracket.values());

		for (let i = 0; i < connecters.length; i += 2) {
			const playerX = connecters[i];
			const playerY = connecters[i + 1];

			if (!playerX || !playerY) continue;
			this.broadcastIntraMessage(`ROUND ${this.matchRound}: ${playerX} vs ${playerY}`);
		}


		for (let i = 0; i < connecters.length; i += 2) {
			const playerX = connecters[i];
			const playerY = connecters[i + 1];

			if (!playerX || !playerY) continue;

			const matchId = crypto.randomUUID();
			const newMatch = new PingPong(matchId);

			newMatch.setTournamentId(this.tournamentId);

			newMatch.createMatch(playerX, playerY);
		}
		this.matchRound++;
	}

	broadcastIntraMessage(message: string) {
		// Add message to tournament state
		this.tournamentIntra.push(message);

		// Send message to all connected players in the tournament
		for (const username of this.tournamentConnecters) {
			const connected = connectedRoomInstance.getByUsername(username);
			if (!connected || !connected.socket) continue;
			connected.socket.send(JSON.stringify({
				status: 200,
				message: 'tournament.message',
				payload: this.tournamentIntra
			}));
		}
	}

	async reportMatchResult(report: EndMatchEventType) {
		const { winnerId, loserId, drawMatch } = report;

		this.matches++;

		// Take the two player out of the current bracket
		if (drawMatch) {
			this.currentBracket.delete(winnerId);
			this.currentBracket.delete(loserId);
		} else {
			this.currentRoundWinners.add(winnerId);
			this.currentBracket.delete(loserId);

			this.broadcastIntraMessage(`${winnerId} has defeated ${loserId}`);
			this.broadcastIntraMessage(`${loserId} has bean eliminate from the tournament.`);
			this.broadcastIntraMessage(`${winnerId} advances to the next round.`);


			if (this.matchRound === 2) {
				const otherMatch = this.tournamentConnecters.filter(p => p !== winnerId && p !== loserId);
				this.broadcastIntraMessage(`Waiting for ${otherMatch[0]} vs ${otherMatch[1]} match to end.`);
			}
			
		}
		

		if (this.matches === this.rounds) {
			this.nextBracket = new Set(this.currentRoundWinners);
			await this.advanceBracket();
		}
	}

	async advanceBracket() {
		if (this.nextBracket.size === 0) return;
		this.currentBracket = new Set<string>(this.nextBracket);
		this.nextBracket.clear();

		if (this.currentBracket.size > 1) {
			await this.startRound();
		} else {
			const winnerId = Array.from(this.currentBracket)[0];
			await this.endTournament(winnerId);
		}
	}

	async endTournament(username: string) {
		this.broadcastIntraMessage(`Tournament winner is ${username}! Congratulations!`);
		this.broadcastIntraMessage(`Tournament has ended.`);
		for (const p of this.tournamentConnecters) {
			const connected = connectedRoomInstance.getByUsername(p);
			if (connected) {
				connected.status = 'CONNECTED';
				if (connected.socket) {
					connected.socket.send(JSON.stringify({ status: 200, message: 'CONNECTED' }));
					connected.socket.send(JSON.stringify({ status: 200, message: 'tournament.finish', payload: `Tournament winner is ${username}! Congratulations!` }));
				}
			};
			connectedRoomInstance.updateSettingsState(p, undefined, 'intra');
		}

		// Remove tournament from tournamentRoom
		tournamentRoom.delete(this.tournamentId);
		this.cleanup();
	}
}

export { Tournament };