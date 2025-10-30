import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatManager from '../classes/ChatManager.js';
import { Tournament } from '../classes/Tournament.js';
import { joinTournamentRoom, tournamentRoom } from '../state/tournamentRoom.js';
import { gameEvents } from '../events/gameEvents.js';
import { connectedRoomInstance } from '../state/connectedRoom.js';

// Mock WebSocket
class MockSocket {
    send = vi.fn();
    readyState = 1;
    on = vi.fn();
    off = vi.fn();
}

vi.useFakeTimers();

const PlayerMock = [{
    id: 'player1',
    socket: new MockSocket(),
    status: 'CONNECT_ROOM',
    matchId: '',
    name: 'Player 1',
    tournamentId: undefined,
    chat: new ChatManager("player1")
}, {
    id: 'player2',
    socket: new MockSocket(),
    status: 'CONNECT_ROOM',
    matchId: '',
    name: 'Player 2',
    tournamentId: undefined,
    chat: new ChatManager("player2")
}, {
    id: 'player3',
    socket: new MockSocket(),
    status: 'CONNECT_ROOM',
    matchId: '',
    name: 'Player 3',
    tournamentId: undefined,
    chat: new ChatManager("player3")
}, {
    id: 'player4',
    socket: new MockSocket(),
    status: 'CONNECT_ROOM',
    matchId: '',
    name: 'Player 4',
    tournamentId: undefined,
    chat: new ChatManager("player4")
}]

describe('Tournament Game', () => {
    let socket1: MockSocket;
    let socket2: MockSocket;
    let socket3: MockSocket;
    let socket4: MockSocket;
    let tournament: Tournament;

    beforeEach(() => {
        // Reset rooms and mocks
        connectedRoomInstance.clear();
        socket1 = new MockSocket();
        socket2 = new MockSocket();
        socket3 = new MockSocket();
        socket4 = new MockSocket();

        connectedRoomInstance.addUser('player1');   
        connectedRoomInstance.addUser('player2');
        connectedRoomInstance.addUser('player3');
        connectedRoomInstance.addUser('player4');

        
    });

    it('should start the tournament', async () => {
        joinTournamentRoom('player1');
        joinTournamentRoom('player2');
        joinTournamentRoom('player3');
        joinTournamentRoom('player4');

        // Check that players are in TOURNAMENT_ROOM
        expect(connectedRoomInstance.getById('player1')?.status).toBe('TOURNAMENT_ROOM');
        expect(connectedRoomInstance.getById('player2')?.status).toBe('TOURNAMENT_ROOM');
        expect(connectedRoomInstance.getById('player3')?.status).toBe('TOURNAMENT_ROOM');
        expect(connectedRoomInstance.getById('player4')?.status).toBe('TOURNAMENT_ROOM');

        // Check that a tournament has been created
        expect(tournamentRoom.size).toBe(1);

        const tournamentId = Array.from(tournamentRoom.values())[0].tournamentId;
        
        // Check that players have a tournamentId
        
        expect(connectedRoomInstance.getById('player1')?.tournamentId).toBe(tournamentId);
        expect(connectedRoomInstance.getById('player2')?.tournamentId).toBe(tournamentId);
        expect(connectedRoomInstance.getById('player3')?.tournamentId).toBe(tournamentId);
        expect(connectedRoomInstance.getById('player4')?.tournamentId).toBe(tournamentId);
        
        // Simulate tournament progression and check for winner
        gameEvents.emit('tournament_match_end', {
            winnerId: 'player1',
            loserId: 'player2',
            tournamentId: tournamentId,
            drawMatch: false
        });
        // Wait 5 for promisse
        vi.advanceTimersByTime(6000);
        await Promise.resolve()
        
        gameEvents.emit('tournament_match_end', {
            winnerId: 'player3',
            loserId: 'player4',
            tournamentId: tournamentId,
            drawMatch: false
        });
        
        vi.advanceTimersByTime(6000);
        await Promise.resolve()
        // Final match
        const finalTournament = Array.from(tournamentRoom.values())[0];
        gameEvents.emit('tournament_match_end', {
            winnerId: 'player1',
            loserId: 'player3',
            tournamentId: tournamentId,
            drawMatch: false
        });

        expect(finalTournament.currentBracket.has('player1')).toBe(true);

        vi.advanceTimersByTime(6000);
        await Promise.resolve()
        // Expect tournament to be cleaned up
        expect(tournamentRoom.has(tournamentId)).toBe(false);

    });

});

describe('Tournament Game - Disconnects', () => {
    beforeEach(() => {
        connectedRoomInstance.clear();
        tournamentRoom.clear();

        // Mock players
        const players = ['player1', 'player2', 'player3', 'player4'];
        for (const id of players) {
            const socket = new MockSocket();
            connectedRoomInstance.addUser(id);
        }
    });

    it('should handle a player disconnecting mid-tournament', async () => {
        // Start tournament
        joinTournamentRoom('player1');
        joinTournamentRoom('player2');
        joinTournamentRoom('player3');
        joinTournamentRoom('player4');

        const tournament = Array.from(tournamentRoom.values())[0];
        const tournamentId = tournament.tournamentId;

        // Simulate tournament progression and check for winner
        gameEvents.emit('tournament_match_end', {
            winnerId: 'player1',
            loserId: 'player2',
            tournamentId: tournamentId,
            drawMatch: true
        });
        // Wait 5 for promisse
        vi.advanceTimersByTime(6000);
        await Promise.resolve()
        
        const finalTournament = Array.from(tournamentRoom.values())[0];
        gameEvents.emit('tournament_match_end', {
            winnerId: 'player3',
            loserId: 'player4',
            tournamentId: tournamentId,
            drawMatch: false
        });
        
        vi.advanceTimersByTime(6000);
        await Promise.resolve()
        // Final match
        
        expect(finalTournament.currentBracket.has('player3')).toBe(true);

        vi.advanceTimersByTime(6000);
        await Promise.resolve()
        // Expect tournament to be cleaned up
        expect(tournamentRoom.has(tournamentId)).toBe(false);

        // Check tournament cleaned up
        expect(tournamentRoom.has(tournamentId)).toBe(false);
    });
});


