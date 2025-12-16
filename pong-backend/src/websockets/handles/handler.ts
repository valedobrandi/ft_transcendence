import type { WebSocket } from 'ws';
import { MessageType } from '../types.js';
import { CONNECT, } from './CONNECT.js';
import { MATCH } from './MATCH.js';
import { MOVE_PADDLE } from './MOVE_PADDLE.js';
import { PLAY } from './PLAY.js';
import { QUIT_MATCH, TOURNAMENT } from './TOURNAMENT.js';
import { chatHandler } from './ChatHandler.js';
import { print } from '../../server.js';

export function handleMessage(conn: WebSocket, msg: MessageType) {
    if (msg.type !== 'MOVE_PADDLE' && msg.type !== 'input') {
        print(`[WEBSOCKET INCOMING]: ${JSON.stringify(msg)}`);
    }
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
        case 'PLAY':
            PLAY(msg, conn);
            break;
        case 'TOURNAMENT':
            TOURNAMENT(msg, conn);
            break;
        case 'CHAT':
            chatHandler.service(msg);
            break;
        case 'QUIT_MATCH':
            QUIT_MATCH(msg);
            break;
    }
}
