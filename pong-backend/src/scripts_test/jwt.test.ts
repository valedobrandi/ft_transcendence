// websocket.test.ts
import { beforeAll, afterAll, describe, it, expect, vi, beforeEach } from 'vitest'
import { fastify } from '../server';
import { fastifyServer } from './utils';
import { createSchema } from '../../database/schema';
import { seedUsers } from '../../database/seeds/seed_users';

var server: { close: () => any; };
beforeAll(async () => {
    server = await fastifyServer();
});

afterAll(async () => {
    await server.close();
});

describe('JWT', async () => {
    createSchema();
    seedUsers();
    it('1 - GET JWT', async () => {
        var response;
        // First, create a user to login
        response = await fastify.inject({
            method: 'POST',
            url: '/register',
            payload: {
                username: 'lola',
                password: 'pass',
                email: 'lola@example.com'
            },
        });

        expect(response.statusCode).toBe(201);

        // Then, login to get the JWT
        response = await fastify.inject({
            method: 'POST',
            url: '/login',
            payload: {
                username: 'lola',
                password: 'pass',
            },
        });

        expect(response.statusCode).toBe(201);

        const data = response.json();
        const { accessToken, username } = data.payload;
        expect(accessToken).toBeDefined();
        expect(username).toBe('lola');
        
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
