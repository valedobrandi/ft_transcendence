
import * as websocketModule from '../src/websocket';
import { prettyDOM } from '@testing-library/dom';
import WS from "jest-websocket-mock";
import {init} from '../src/app.ts'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

describe('WebSocket tests', () => {
    let server: WS;
    let client: WebSocket;

    beforeEach(async () => {
        server = new WS('ws://localhost:1234');
        client = new WebSocket('ws://localhost:1234');
        await server.connected;

        vi.spyOn(websocketModule, 'getSocket').mockReturnValue(client);
        document.body.innerHTML = '<div id="root"></div>';
        window.history.pushState({}, '', '/intra');
        init();
    });

    it('Match queue', async () => {

        const msg = { status: 200, message: "MATCH_ROOM" };
        server.send(JSON.stringify(msg))
        console.log(prettyDOM(document.body));
        console.log(document.body.innerHTML);
        
    });
});
