// websocket.test.ts
import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import WebSocket from 'ws'

import { fastify } from '../server.js';
import { connectedRoom } from '../state/connectedRoom.js';
import { ConnectType } from '../sockets/types.js';


let port: number;

beforeAll(async () => {
    const server = await fastify.listen({ port: 0 });
    port = fastify.server.address().port;
});

afterAll(async () => {
    await fastify.close();
});

describe('WebSocket connect/disconnect logic', () => {
    it('adds client on connection and removes on close', async () => {
        const ws = new WebSocket(`ws://localhost:${port}/ws`);

        await new Promise(resolve => ws.once('open', resolve));
        // CONNECT_ROOM should add the client to connectedRoom
        const action = JSON.stringify({ type: 'CONNECT', id: 'test-client-1' })

        ws.send(action);

        await new Promise(res => setTimeout(res, 50));

        expect(connectedRoom.size).toBe(1);

        ws.close();

        await new Promise<void>((resolve) => ws.once('close', resolve));

        expect(connectedRoom.size).toBe(0);

    });

});

