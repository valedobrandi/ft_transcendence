import { EventEmitter } from 'node:events';

export const torunamentEvent = new EventEmitter();

torunamentEvent.setMaxListeners(100);