import { EventEmitter } from 'events';
import MatchesModel from '../models/matchesModel.js';
import { EventsMap } from '../types/GameEvents.js';
import { PingPong } from '../classes/PingPong.js';
import { print } from '../server.js';

export const events = new EventEmitter();

events.setMaxListeners(10);

class EventBus<Events extends Record<string, any>> {
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


    async registerListeners(matchesModel: MatchesModel) {
        this.on('game:savehistory', async (data) => {
            const { matchId, player1, player2, score1, score2 } = data;
            await matchesModel.saveMatch(matchId, player1, player2, score1, score2);
        });

        this.on('game:start', (data) => {
            //print(`[GAME SETTINGS]: ${data.settings}`);
            const newMatch = new PingPong(data.matchId, data.settings);
            newMatch.createMatch(data.oponentes[0], data.oponentes[1]);
        })
    }
}

export const eventsBus = new EventBus<EventsMap>();