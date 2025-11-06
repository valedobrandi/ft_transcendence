// websocket.test.ts
import { beforeAll, afterAll, describe, it, expect, vi, beforeEach } from 'vitest'
import WebSocket from 'ws'
import { fastify } from '../server.js';



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
		const response = await fetch(`http://localhost:3000/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(
				{
					username: 'lola',
					password: 'pass',
				}
			)
		});

		const data = await response.json();
		expect(data.payload).toHaveProperty('accessToken');


		const profile = await fetch(`http://localhost:3000/profile`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${data.payload.accessToken}`,
			},

		});

		expect(profile.status).toBe(200);
		const profileData = await profile.json();
		expect(profileData.payload).toHaveProperty('username', 'lola');
	});

});

