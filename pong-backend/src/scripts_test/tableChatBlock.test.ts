// websocket.test.ts
import { fastify } from '../server.js';
import { userMock } from './Mock.js';
import { fastifyServer } from './utils';
import { createSchema } from '../../database/schema.js';
import { seedUsers } from '../../database/seeds/seed_users.js';
import { beforeAll, afterAll, describe, it, expect, vi, beforeEach } from 'vitest'


var server: { close: () => any; };
beforeAll(async () => {
    server = await fastifyServer();
});

afterAll(async () => {
    await server.close();
});

describe('TABLE CHATBLOCK TEST', () => {
        createSchema();
        seedUsers();
	it('01 - ADD A USER TO THE BLOCK LIST', async () => {
        await fastify.inject({
            method: 'POST',
            url: '/block-user',
            body: {
                userId: userMock['alice'].id,
                blockedUserId: userMock['bob'].id
            }
        });
	});

    it('02 - GET BLOCKED USERS', async () => {
        const getBlockedUsers = await fastify.inject({
            method: 'GET',
            url: '/blocked-users',
            query: {
                userId: userMock['alice'].id.toString()
            }
        });

        const response = getBlockedUsers.json();
        expect(getBlockedUsers.statusCode).toBe(200);
        expect(response.blockedUsers).toBeDefined();
        console.log(response.blockedUsers);
        expect(response.blockedUsers).toContain(userMock['bob'].id);
    });

    it('03 - REMOVE A USER FROM THE BLOCK LIST', async () => {
        await fastify.inject({
            method: 'DELETE',
            url: '/unblock-user',
            body: {
                userId: userMock['alice'].id,
                blockedUserId: userMock['bob'].id
            }
        });

        const getBlockedUsersAfterUnblock = await fastify.inject({
            method: 'GET',
            url: '/blocked-users',
            query: {
                userId: userMock['alice'].id.toString()
            }
        });

        const responseAfterUnblock = getBlockedUsersAfterUnblock.json();
        expect(responseAfterUnblock.blockedUsers).toBeDefined();
        expect(responseAfterUnblock.blockedUsers).not.toContain(userMock['bob'].id);
    });

});

