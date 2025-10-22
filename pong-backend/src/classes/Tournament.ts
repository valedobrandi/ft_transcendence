import { gameEvents } from "../events/gameEvents.js";
import { tournamentRoom } from "../state/tournamentRoom.js";
import { EndMatchEventType } from "../types/EndMatchEventType.js";
import { PlayerType } from "../types/PlayerType.js";
import { PingPong } from "./PingPong.js";
import { connectedRoom } from "../state/connectedRoom.js";

class Tournament {
    tournamentId: string;
    currentBracket: Set<string>;
    nextBracket: Set<string>;
    private rounds = 0;
    cleanup: () => void = () => { };

    constructor(tournamentId: string) {
        this.tournamentId = tournamentId;
        this.currentBracket = new Set<string>();
        this.nextBracket = new Set<string>();

        const matchEndedListener = ({ winnerId, loserId, tournamentId }: EndMatchEventType) => {
            if (tournamentId != this.tournamentId) return;
            this.reportMatchResult(winnerId, loserId);
        }

        gameEvents.on('matchEnded', matchEndedListener);
        this.cleanup = () => gameEvents.off('matchEnded', matchEndedListener);
    }


    add(id: string) {
        this.currentBracket.add(id);
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

    reportMatchResult(winnerId: string, loserId: string) {

        this.nextBracket.add(winnerId);
        this.currentBracket.delete(loserId);
        
        if (this.nextBracket.size === this.rounds) {
            this.advanceBracket();
        }
    }

    advanceBracket() {
        if (this.nextBracket.size === 0) return;
        this.currentBracket.clear();

        for (const id of this.nextBracket) {
            this.currentBracket.add(id);
        }

        this.nextBracket.clear();

        if (this.currentBracket.size > 1) {
            this.startRound();
        } else {
            const winnerId = Array.from(this.currentBracket.values())[0];
            this.endTornament(winnerId);
        }
    }

    endTornament(id: string) {
        const player = connectedRoom.get(id);
        if (player) {
            player.socket.send(JSON.stringify({ status: 200, message: 'TOURNAMENT_WINNER' }));
            player.status = 'CONNECT_ROOM';
        };
        tournamentRoom.delete(this.tournamentId);
        this.cleanup();
    }
}

export { Tournament };