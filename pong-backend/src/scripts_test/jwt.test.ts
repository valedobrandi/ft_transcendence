// websocket.test.ts
import { beforeAll, afterAll, describe, it, expect, vi, beforeEach } from 'vitest'
import { createSchema } from '../../database/schema.js';


describe('JWT', () => {

	beforeAll(async () => { createSchema(); });

	afterAll(async () => { createSchema(); });

	it('1 - GENERATE JWT', async () => {
		const registerResponse = await fetch(`http://localhost:3000/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: 'alice@example.com',
				username: 'alice',
				password: 'hashed_password_1',
			}),
		});
		expect(registerResponse.status).toBe(201);

		const response = await fetch(`http://localhost:3000/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(
				{
					username: 'alice',
					password: 'hashed_password_1',
				}
			)
		});

		expect(response.status).toBe(201);

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
		expect(profileData.payload).toHaveProperty('username', 'alice');
		expect(profileData.payload).toHaveProperty('id', 1);

	});

});

