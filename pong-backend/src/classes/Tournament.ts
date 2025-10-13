import { gameEvents } from "../events/gameEvents.js";
import { tournamentRoom } from "../state/tournamentRoom.js";
import { PlayerType } from "../types/PlayerType.js";
import { PingPong } from "./PingPong.js";

class Tournament {
    tournamentId: string;
    players: Map<string, PlayerType>
    currentBracket: PlayerType[] = [];
    nextBracket: PlayerType[] = [];


    constructor(tournamentId: string) {
        this.tournamentId = tournamentId;
        this.players = new Map<string, PlayerType>();

        const listener = () => {
            gameEvents.on('matchEnded', listener);
            this.cleanup = () => gameEvents.off('matchEnded', listener);
        }

        gameEvents.on('matchEnded', ({ winner, tournamentId }) => {
            if (tournamentId != this.tournamentId) return;
            console.log('Match ended in tournament:', this.tournamentId, 'Winner:', winner.id);
            this.report(winner);
        })
    }

    cleanup: () => void = () => { }

    add(player: PlayerType) {
        this.players.set(player.id, player);
        if (this.players.size == 8) {
            console.log('Tournament started with 8 players');
            this.currentBracket = Array.from(this.players.values());
            this.startRound();
        }
    }

    startRound() {
        for (let i = 0; i < this.currentBracket.length; i += 2) {
            const playerX = this.currentBracket[i];
            const playerY = this.currentBracket[i + 1];
            const matchId = crypto.randomUUID();

            const newMatch = new PingPong(matchId);
            newMatch.createMatch(playerX, playerY);
        }
    }

    report(winner: PlayerType) {
        this.nextBracket.push(winner);

        for (const [id, player] of this.players.entries()) {
            if (player !== winner && this.currentBracket.includes(player)) {
                player.status = 'CONNECT_ROOM';
                this.remove(player);
            }
        }

        if (this.nextBracket.length === this.currentBracket.length / 2) {
            this.advanceBracket();
        }
    }

    advanceBracket() {
        this.currentBracket = [...this.nextBracket];
        this.nextBracket = [];
        if (this.currentBracket.length > 1) {
            this.startRound();
        } else {
            this.endTornament(this.currentBracket[0]);
        }
    }

    endTornament(player: PlayerType) {
        player.socket.send(JSON.stringify({ status: 200, message: 'TOURNAMENT_WINNER' }));

        player.status = 'CONNECT_ROOM';
        tournamentRoom.delete(this.tournamentId);

        for (const player of this.players.values()) {
            this.remove(player);
        }

        this.cleanup();
    }

    remove(player: PlayerType) {
        player.tournamentId = '';
    }
}

export { Tournament };