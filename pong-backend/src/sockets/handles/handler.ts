import type { WebSocket } from 'ws';
import { MessageType } from '../types.js';
import { CONNECT, } from './CONNECT.js';
import { MATCH } from './MATCH.js';
import { MOVE_PADDLE } from './MOVE_PADDLE.js';

export function handleMessage(conn: WebSocket, msg: MessageType) {
    console.log('Received message:', msg);
    switch (msg.type) {
        case 'CONNECT':
            CONNECT(msg, conn);
            break;
        case 'MATCH':
            MATCH(msg, conn);
            break;
        case 'MOVE_PADDLE':
            MOVE_PADDLE(msg);
            break;
    }
}