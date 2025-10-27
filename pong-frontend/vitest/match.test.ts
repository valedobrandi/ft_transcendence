
import * as websocketModule from '../src/websocket.ts';
import * as utils from '../src/utils.ts';

import { prettyDOM } from '@testing-library/dom';
import WS from "jest-websocket-mock";
import {init} from '../src/app.ts'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { mockCanvas } from './setup.ts';

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

        vi.spyOn(websocketModule, 'getSocket').mockReturnValue(client);
        vi.useFakeTimers()
        mockCanvas();

        document.body.innerHTML = '<div id="root"></div>';
        window.history.pushState({}, '', '/intra');
        init();
    });

    it('Match queue', async () => {
        
        server.send(JSON.stringify(MATCH_ROOM))
        expect(document.body.innerHTML).toContain("you have joined the match queue.");

        server.send(JSON.stringify(GAME_ROOM))
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
