// websocket.test.ts
import { beforeAll, afterAll, describe, it, expect, vi, beforeEach } from 'vitest'
import WebSocket from 'ws'
import { fastify } from '../server.js';
import { connectedRoomInstance } from '../state/connectedRoom.js';
import { authenticationRoomInstance } from '../state/authenticationRoom.js';
import { waitForMessage } from './utils.js';
import bcrypt from 'bcrypt';
import { AuthService } from '../services/authService.js';
import { UsersModel } from '../models/usersModel.js';
import { AuthController } from '../controllers/authController.js';


let port: number | null = null;
beforeAll(async () => {
    await fastify.listen({ port: 0 });
    const adress = fastify.server.address();
    if (adress) port = typeof adress === 'string' ? null : adress.port;
});

afterAll(async () => {
    await fastify.close();
});


describe('JWT', () => {
    it('1 - GENERATE JWT', async () => {
        const ws = new WebSocket(`ws://localhost:${port}/ws`);
        await new Promise(resolve => ws.once('open', resolve));

        const loginRoute = await fastify.inject({
            method: 'POST',
            url: '/login',
            body: {
                username: 'lola',
                password: 'pass',
            }
        });


        expect(loginRoute.statusCode).toBe(201);
        const { accessToken } = JSON.parse(loginRoute.payload);
        console.log(JSON.stringify(loginRoute.payload));
        expect(accessToken).toBeDefined();
        const profileRoute = await fastify.inject({
            method: 'GET',
            url: '/profile',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        expect(profileRoute.statusCode).toBe(200)

    });

});

