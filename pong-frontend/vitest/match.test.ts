
import * as utils from '../src/utils.ts';

import { prettyDOM } from '@testing-library/dom';
import WS from "jest-websocket-mock";
import { id, init } from '../src/app.ts'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { mockCanvas } from './setup.ts';
import { websocketReceiver } from '../src/websocket/websocketReceiver.ts';

const MATCH_ROOM = { status: 200, message: "MATCH_ROOM" };

const GAME_ROOM = {
    "status": 200,
    "message": "GAME_ROOM",
    "payload": {
        "message": "a584015a-ec23-427d-b19d-732ae868aeaa vs 57ae9a3c-1b1c-493e-8706-ced55f639e65"
    },
    "side": "RIGHT",
    "id": "57ae9a3c-1b1c-493e-8706-ced55f639e65"
}

const GAME_OVER = {
    "status": 200,
    "message": "GAME_OVER",
    "payload": {
        "winner": "a584015a-ec23-427d-b19d-732ae868aeaa",
        "message": "YOU LOSE!"
    },
    "finalScore": {
        "userX": 2,
        "userY": 0
    }
}


describe('WebSocket tests', () => {
    let server: WS;
    let client: WebSocket;

    beforeEach(async () => {
        server = new WS('ws://localhost:1234');
        client = new WebSocket('ws://localhost:1234');
        await server.connected;

        // spyOn socket.addEventListener
        vi.spyOn(client, 'addEventListener');

        websocketReceiver(client);
        vi.useFakeTimers()
        mockCanvas();
        id.username = 'testuser';

        document.body.innerHTML = '<div id="root"></div>';
        init();
    });

    it('Match queue', async () => {
        utils.navigateTo('/intra');
        
        expect(id.username).toBe('testuser');
        
        expect(window.location.pathname).toBe('/intra');

        server.send(JSON.stringify(MATCH_ROOM))
        
        expect(client.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));

        expect(document.body.innerHTML).toContain("you have joined the match queue.");

        server.send(JSON.stringify(GAME_ROOM))

        expect(client.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
        
        expect(document.body.innerHTML).toContain(GAME_ROOM.payload.message);

        // Skip setTimeout by 5 seconds
        vi.advanceTimersByTime(5000);
        expect(window.location.pathname).toBe('/match');

        server.send(JSON.stringify(GAME_OVER))
        vi.advanceTimersByTime(5000);
        expect(window.location.pathname).toBe('/intra');

        // Expect "YOU LOSE!" to be in the DOM
        expect(document.body.innerHTML).toContain("YOU LOSE!");

    });
});
