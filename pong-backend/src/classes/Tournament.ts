import { events } from "../events/EventsBus.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { tournamentRoom } from "../state/tournamentRoom.js";
import { EndMatchEventType } from "../types/EndMatchEventType.js";
import { PingPong } from "./PingPong.js";

class Tournament {
	tournamentId: string;
	currentBracket: Set<string>;

	tournamentIntra: string[] = [];
	tournamentConnecters: string[] = [];


	private round: 'SEMIFINAL' | 'FINAL' | 'ENDED';

	private first: string | null = null;
	private second: string | null = null;
	private third: string | null = null;
	private fourth: string | null = null;

	private winners: string[] = [];
	private losers: string[] = [];


	cleanup: () => void = () => { };

	constructor(tournamentId: string) {
		this.tournamentId = tournamentId;
		this.currentBracket = new Set<string>();
		this.round = 'SEMIFINAL';

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
			this.startRound(this.currentBracket);
		}
	}

	async startRound(bracket: Set<string>) {

		const connecters = Array.from(bracket.values());

		for (let i = 0; i < connecters.length; i += 2) {
			const playerX = connecters[i];
			const playerY = connecters[i + 1];

			if (!playerX || !playerY) continue;

			const matchId = crypto.randomUUID();
			const newMatch = new PingPong(matchId);

			newMatch.setTournamentId(this.tournamentId);

			newMatch.createMatch(playerX, playerY);
		}
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

		if (drawMatch) return; 

		if (this.round === 'SEMIFINAL') {
			this.winners.push(winnerId);
			this.losers.push(loserId);

			this.broadcastIntraMessage(`${winnerId} defeated ${loserId}`);

			if (this.winners.length === 2 && this.losers.length === 2) {
				this.round = 'FINAL';

				// start final
				// 2 secs delay before starting next round
				await new Promise(resolve => setTimeout(resolve, 2000));
				this.currentBracket = new Set(this.winners);
				await this.startRound(this.currentBracket);
				// assign 3rd and 4th place
				await this.startRound(new Set(this.losers));
			}
			return;
		}

		if (this.round === 'FINAL') {
			if (this.winners.includes(winnerId) && this.winners.includes(loserId)) {
				this.first = winnerId;
				this.second = loserId;
			} else if (this.losers.includes(winnerId) && this.losers.includes(loserId)) {
				this.third = winnerId;
				this.fourth = loserId;
			}

			if (this.first && this.second && this.third && this.fourth) {
				this.round = 'ENDED';
				await this.endTournament();
			}
		}
	}

	printRanking() {
		return [
			{ rank: 1, player: this.first },
			{ rank: 2, player: this.second },
			{ rank: 3, player: this.third },
			{ rank: 4, player: this.fourth },
		];
	}

	async endTournament() {
		this.broadcastIntraMessage(`Tournament has ended.`);
		const ranking = this.printRanking();
		const printRank = `Ranking:<br>` +
			ranking.map(r => `#${r.rank}: ${r.player}`).join('<br>');


		// Notify all players about tournament end	
		for (const p of this.tournamentConnecters) {
			const connected = connectedRoomInstance.getByUsername(p);
			if (connected) {
				connected.status = 'CONNECTED';
				if (connected.socket) {
					connected.socket.send(JSON.stringify({ status: 200, message: 'CONNECTED' }));
					connected.socket.send(JSON.stringify({ status: 200, message: 'tournament.finish', payload: printRank }));
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