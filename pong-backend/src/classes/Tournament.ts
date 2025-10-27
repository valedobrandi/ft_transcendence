import { gameEvents } from "../events/gameEvents.js";
import { tournamentRoom } from "../state/tournamentRoom.js";
import { EndMatchEventType } from "../types/EndMatchEventType.js";
import { PlayerType } from "../types/PlayerType.js";
import { PingPong } from "./PingPong.js";
import { connectedRoom } from "../state/connectedRoom.js";

class Tournament {
    tournamentId: string;
    currentBracket: Set<string>;
    currentRoundWinners: Set<string>;
    nextBracket: Set<string> = new Set<string>();
    private rounds = 0;
    cleanup: () => void = () => { };

    constructor(tournamentId: string) {
        this.tournamentId = tournamentId;
        this.currentBracket = new Set<string>();
        this.currentRoundWinners = new Set<string>();

        const matchEndedListener = ({ winnerId, loserId, tournamentId }: EndMatchEventType) => {
            if (tournamentId != this.tournamentId) return;
            this.reportMatchResult(winnerId, loserId);
        }

        gameEvents.on('tournament_match_end', matchEndedListener);
        this.cleanup = () => gameEvents.off('tournament_match_end', matchEndedListener);
    }


    add(id: string) {
        this.currentBracket.add(id);
        if (this.currentBracket.size == 4) {
            this.startRound();
        }
    }

    async startRound() {
        if (this.currentBracket.size % 2 !== 0) return;

        this.rounds = Math.floor(this.currentBracket.size / 2);
        this.currentRoundWinners = new Set<string>();

        const players = Array.from(this.currentBracket.values());
        for (let i = 0; i < players.length; i += 2) {
            const playerX = players[i];
            const playerY = players[i + 1];

            if (!playerX || !playerY) continue;

            const matchId = crypto.randomUUID();
            const newMatch = new PingPong(matchId);

            newMatch.setTournamentId(this.tournamentId);

            await new Promise(resolve => setTimeout(resolve, 5000));
            newMatch.createMatch(playerX, playerY);
        }
    }

    async reportMatchResult(winnerId: string, loserId: string) {
        this.currentRoundWinners.add(winnerId);
        this.currentBracket.delete(loserId);

        const loserPlayer = connectedRoom.get(loserId);
        if (loserPlayer) {
            loserPlayer.chat.sendMessage('INTRA', `you have been eliminated from the tournament.`, loserPlayer.id);
        };
        if (this.currentRoundWinners.size === this.rounds) {
            this.nextBracket = new Set(this.currentRoundWinners);
            if (this.rounds > 1) {
                for (const winnerId of this.nextBracket) {
                    const player = connectedRoom.get(winnerId);
                    if (player) {
                        player.chat.sendMessage("INTRA", "You have advanced to the next phase!", player.id);
                    }
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
            await this.endTornament(winnerId);
        }
    }

    async endTornament(id: string) {
        const player = connectedRoom.get(id);
        if (player) {
            player.chat.sendMessage('INTRA', "Congratulations! You are the champion of the tournament!", player.id);
            player.socket.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
            player.status = 'CONNECT_ROOM';
        };
        tournamentRoom.delete(this.tournamentId);
        this.cleanup();
    }
}

export { Tournament };