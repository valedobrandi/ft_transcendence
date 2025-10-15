import { EventEmitter } from 'node:events';

export const tournamentEvent = new EventEmitter();

tournamentEvent.setMaxListeners(100);