import { EventEmitter } from 'node:events';

export const matchQueueEvent = new EventEmitter();

matchQueueEvent.setMaxListeners(100);