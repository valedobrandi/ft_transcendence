import { EventEmitter } from 'events';
import MatchesModel from '../models/matchesModel';
import { GameEventsMap } from '../types/GameEvents';

export const gameEvents = new EventEmitter();

gameEvents.setMaxListeners(100);

class GameEventBus<Events extends Record<string, any>> {
    private listeners = new Map<keyof Events, Function[]>();

    on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(handler);
    }

    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(payload));
        }
    }

    registerListeners(matchesModel: MatchesModel): void {
        this.on('game:savehistory', (data) => {
            const { matchId, player1, player2, score1, score2 } = data;
            matchesModel.saveMatch(matchId, player1, player2, score1, score2);
        });
    }
}

export const GameEvents = new GameEventBus<GameEventsMap>();