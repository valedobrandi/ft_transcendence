import { EventEmitter } from 'events';

export const gameEvents = new EventEmitter();
gameEvents.setMaxListeners(100);