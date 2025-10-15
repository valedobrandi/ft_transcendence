import { gameEvents } from "../events/gameEvents.js";
import { tournamentRoom } from "../state/tournamentRoom.js";
import { EndMatchEventType } from "../types/EndMatchEventType.js";
import { PlayerType } from "../types/PlayerType.js";
import { PingPong } from "./PingPong.js";

class Tournament {
	tournamentId: string;
	currentBracket: Map<string, PlayerType>
	nextBracket: PlayerType[] = [];
	private rounds = 0;
	cleanup: () => void = () => { };

	constructor(tournamentId: string) {
		this.tournamentId = tournamentId;
		this.currentBracket = new Map<string, PlayerType>();

		const matchEndedListener = ({ winner, loser, tournamentId }: EndMatchEventType) => {
			if (tournamentId != this.tournamentId) return;
			this.reportMatchResult(winner, loser);
		}

		gameEvents.on('matchEnded', matchEndedListener);
		this.cleanup = () => gameEvents.off('matchEnded', matchEndedListener);
	}


	add(player: PlayerType) {
		this.currentBracket.set(player.id, player);
		if (this.currentBracket.size == 4) {
			this.startRound();
		}
	}

	startRound() {
		if (this.currentBracket.size % 2 !== 0) return;

		this.rounds = Math.floor(this.currentBracket.size / 2);

		const players = Array.from(this.currentBracket.values());
		for (let i = 0; i < players.length; i += 2) {
			const playerX = players[i];
			const playerY = players[i + 1];

			if (!playerX || !playerY) continue;

			const matchId = crypto.randomUUID();
			const newMatch = new PingPong(matchId);
			newMatch.setTournamentId(this.tournamentId);

			newMatch.createMatch(playerX, playerY);
		}
	}

	reportMatchResult(winner: PlayerType, loser: PlayerType) {

		winner.status = 'TOURNAMENT_ROOM';

		this.nextBracket.push(winner);
		this.currentBracket.delete(loser.id);
		loser.tournamentId = undefined;
		if (this.nextBracket.length === this.rounds) {
			this.advanceBracket();
		}
	}

	advanceBracket() {
		if (this.nextBracket.length === 0) return;
		 this.currentBracket.clear();

		for (const player of this.nextBracket) {
			this.currentBracket.set(player.id, player);
		}

		this.nextBracket = [];

		if (this.currentBracket.size > 1) {
			this.startRound();
		} else {
			const winner = Array.from(this.currentBracket.values())[0];
			this.endTornament(winner);
		}
	}

	endTornament(player: PlayerType) {
		player.socket.send(JSON.stringify({ status: 200, message: 'TOURNAMENT_WINNER' }));

		player.status = 'CONNECT_ROOM';
		tournamentRoom.delete(this.tournamentId);

		this.cleanup();
	}
}

export { Tournament };