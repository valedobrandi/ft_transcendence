// websocket.test.ts
import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import WebSocket from 'ws'

import { fastify } from '../server.js';
import { connectedRoom } from '../state/connectedRoom.js';
import { PlayType } from '../sockets/types.js';
import { waitForMessage } from './utils.js';
import { gameRoom, matchQueue } from '../state/gameRoom.js';

let port: number;

beforeAll(async () => {
    const server = await fastify.listen({ port: 0 });
    port = fastify.server.address().port;
});

afterAll(async () => {
    await fastify.close();
});

describe('MATCH', () => {
    it('Start a Match With Sucess', async () => {
        const ws = new WebSocket(`ws://localhost:${port}/ws`);

        await new Promise<void>(resolve => ws.once('open', resolve));

        const test_client_1 = JSON.stringify({ type: 'CONNECT', id: 'test-client-1' })
        const test_client_2 = JSON.stringify({ type: 'CONNECT', id: 'test-client-2' })

        ws.send(test_client_1);
        let response = await waitForMessage(ws, "message", "CONNECT_ROOM");
        expect(response.message).toContain("CONNECT_ROOM");
        
        ws.send(test_client_2);
        response = await waitForMessage(ws, "message", "CONNECT_ROOM");
        expect(response.message).toContain("CONNECT_ROOM");

        expect(connectedRoom.size).toBe(2);

        const match_request_1 = JSON.stringify({ type: 'MATCH', id: 'test-client-1' });
        const match_request_2 = JSON.stringify({ type: 'MATCH', id: 'test-client-2' });

        ws.send(match_request_1);
        response = await waitForMessage(ws, "message", "MATCH_ROOM");

        expect((connectedRoom.get('test-client-1'))?.status).toBe('MATCH_QUEUE');
        expect(response.message).toContain("MATCH_ROOM");

        ws.send(match_request_2);
        response = await waitForMessage(ws, "message", "GAME_ROOM");
        
        expect((connectedRoom.get('test-client-2'))?.status).toBe('GAME_ROOM');
        expect((connectedRoom.get('test-client-1'))?.status).toBe('GAME_ROOM');
        expect(response.message).toContain("GAME_ROOM");

        expect(gameRoom.size).toBe(1);

    });

});

