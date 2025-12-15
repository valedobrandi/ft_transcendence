import { events } from "../events/EventsBus.js";
import { print } from "../server.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { tournamentRoom } from "../state/tournamentRoom.js";
import { EndMatchEventType } from "../types/EndMatchEventType.js";
import { PingPong } from "./PingPong.js";

class Tournament {
	tournamentId: string;
	currentBracket: Set<string>;
	currentRoundWinners: Set<string>;
	nextBracket: Set<string> = new Set<string>();
	private matches = 0;
	private rounds = 0;
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


	add(id: string) {
		this.currentBracket.add(id);
		if (this.currentBracket.size == 4) {
			this.startRound();
			this.broadcastIntraMessage(`Tournament: Starting with 4 players!`, Array.from(this.currentBracket));
		}
	}

	async startRound() {
		if (this.currentBracket.size % 2 !== 0) return;

		this.rounds = Math.floor(this.currentBracket.size / 2);
		this.currentRoundWinners = new Set<string>();
		this.matches = 0;

		const connecters = Array.from(this.currentBracket.values());
		const pairings: string[] = [];

		for (let i = 0; i < connecters.length; i += 2) {
			const playerX = connecters[i];
			const playerY = connecters[i + 1];

			if (!playerX || !playerY) continue;
			pairings.push(`${playerX} vs ${playerY}`);
		}

		const tournamentVisualizationBracket = pairings.join(' | ');
		this.broadcastIntraMessage(`Tournament: Bracket - ${tournamentVisualizationBracket}`, connecters)

		for (let i = 0; i < connecters.length; i += 2) {
			const playerX = connecters[i];
			const playerY = connecters[i + 1];

			if (!playerX || !playerY) continue;

			const matchId = crypto.randomUUID();
			const newMatch = new PingPong(matchId);

			newMatch.setTournamentId(this.tournamentId);


			await new Promise(resolve => setTimeout(resolve, 5000));
			newMatch.createMatch(playerX, playerY);
		}

	}

	broadcastIntraMessage(message: string, receiversList: string[]) {
		for (const username of receiversList) {
			const connected = connectedRoomInstance.getByUsername(username);
			if (!connected || !connected.socket) continue;
			connected.socket.send(JSON.stringify({
				status: 200,
				message: 'intra:message',
				payload: { message }
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

			this.broadcastIntraMessage(`Tournament: ${winnerId} has defeated ${loserId}`, [winnerId, loserId]);
		}

		if (this.matches === this.rounds) {
			this.nextBracket = new Set(this.currentRoundWinners);

			if (this.rounds > 1) {
				for (const winnerId of this.nextBracket) {
					this.broadcastIntraMessage(`Tournament: Advancing to next round: ${winnerId}`, [winnerId]);
				}
			}
			await new Promise(resolve => setTimeout(resolve, 5000));
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
			//print(`Tournament ${this.tournamentId} winner is ${winnerId}`);
			await this.endTournament(winnerId);
		}
	}

	async endTournament(username: string) {
		const connected = connectedRoomInstance.getByUsername(username);;
		if (connected) {
			connected.status = 'CONNECTED';
			if (connected.socket) {
				this.broadcastIntraMessage(`Tournament: Winner is ${username}! Congratulations!`, [username]);
				connected.socket.send(JSON.stringify({ status: 200, message: 'CONNECTED' }));
			}
		};
		tournamentRoom.delete(this.tournamentId);
		this.cleanup();
	}
}

export { Tournament };