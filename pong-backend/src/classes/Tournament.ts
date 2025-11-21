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

            const matchId = crypto.randomUUID();
            const newMatch = new PingPong(matchId);

            newMatch.setTournamentId(this.tournamentId);

            pairings.push(`${playerX} vs ${playerY}`);

            await new Promise(resolve => setTimeout(resolve, 5000));
            newMatch.createMatch(playerX, playerY);
        }

        const tournamentVisualizationBracket = pairings.join(' | ');
        for (const player in connecters) {
            const connected = connectedRoomInstance.getByUsername(connecters[player]);
            if (!connected || !connected.socket) continue;
            connected.socket.send(JSON.stringify({
                status: 200,
                message: 'tournament:bracket_update',
                data: {
                    payload: tournamentVisualizationBracket
                }
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

            const loserPlayer = connectedRoomInstance.getByUsername(loserId);
            if (loserPlayer) {
                loserPlayer.chat.sendMessage('INTRA', `you have been eliminated from the tournament.`, [Number(loserPlayer.id)]);
            };
        }

        if (this.matches === this.rounds) {
            this.nextBracket = new Set(this.currentRoundWinners);

            if (this.rounds > 1) {
                for (const winnerId of this.nextBracket) {
                    const player = connectedRoomInstance.getByUsername(winnerId);
                    if (player) {
                        player.chat.sendMessage("INTRA", "You have advanced to the next phase!", [Number(player.id)]);
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
            print(`Tournament ${this.tournamentId} winner is ${winnerId}`);
            await this.endTournament(winnerId);
        }
    }

    async endTournament(id: string) {
        const player = connectedRoomInstance.getByUsername(id);;
        if (player) {
            player.chat.sendMessage('INTRA', "Congratulations! You are the champion of the tournament!", [Number(player.id)]);
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