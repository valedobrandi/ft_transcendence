import { gameEvents } from "../events/gameEvents.js";
import { connectedRoomInstance } from "../state/connectedRoom.js";
import { tournamentRoom } from "../state/tournamentRoom.js";
import { EndMatchEventType } from "../types/EndMatchEventType.js";
import { PingPong } from "./PingPong.js";

class Tournament {
    tournamentId: string;
    currentBracket: Set<string>;
    currentRoundWinners: Set<string>;
    nextBracket: Set<string> = new Set<string>();
    private matchs = 0;
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

        this.matchs = 0;

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

    async reportMatchResult(report: EndMatchEventType) {
        const { winnerId, loserId, drawMatch } = report;

        this.matchs++;

        // Take the two player out of the current bracket
        if (drawMatch) {
            this.currentBracket.delete(winnerId);
            this.currentBracket.delete(loserId);
        } else {
            this.currentRoundWinners.add(winnerId);
            this.currentBracket.delete(loserId);

            const loserPlayer = connectedRoomInstance.getByName(loserId);
            if (loserPlayer) {
                loserPlayer.chat.sendMessage('INTRA', `you have been eliminated from the tournament.`, loserPlayer.username);
            };
        }
        if (this.matchs === this.rounds) {
            this.nextBracket = new Set(this.currentRoundWinners);

            if (this.rounds > 1) {
                for (const winnerId of this.nextBracket) {
                    const player = connectedRoomInstance.getByName(winnerId);
                    if (player) {
                        player.chat.sendMessage("INTRA", "You have advanced to the next phase!", player.username);
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
            console.log(`Tournament ${this.tournamentId} winner is ${winnerId}`);
            await this.endTournament(winnerId);
        }
    }

    async endTournament(id: string) {
        const player = connectedRoomInstance.getByName(id);;
        if (player) {
            player.chat.sendMessage('INTRA', "Congratulations! You are the champion of the tournament!", player.username);
            player.status = 'CONNECT_ROOM';
            if (player.socket) {
                player.socket.send(JSON.stringify({ status: 200, message: 'CONNECT_ROOM' }));
            }
        };
        tournamentRoom.delete(this.tournamentId);
        this.cleanup();
    }
}

export { Tournament };