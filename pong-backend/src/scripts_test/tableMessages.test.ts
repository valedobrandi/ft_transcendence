// websocket.test.ts
import { describe, it, expect} from 'vitest'
import { fastify } from '../server.js';
import { userMock } from './Mock.js';

describe('TABLE MESSAGES TEST', () => {
	it('01 - SEND A MESSAGE FROM ALICE TO BOB', async () => {
        const sendMessageResponse = await fastify.inject({
            method: 'POST',
            url: '/send-message',
            body: {
                senderId: userMock['alice'].id,
                receiverId: userMock['bob'].id,
                message: 'Hello Bob!'
            }
        });

        expect(sendMessageResponse.statusCode).toBe(200);
    });

    it('02 - RETRIEVE MESSAGES BETWEEN ALICE AND BOB', async () => {
        const getMessagesResponse = await fastify.inject({
            method: 'GET',
            url: '/get-messages',
            query: {
                userId1: userMock['alice'].id.toString(),
                userId2: userMock['bob'].id.toString()
            }
        });

        const response = getMessagesResponse.json();
        expect(response.messages).toBeDefined();
        expect(response.messages.length).toBeGreaterThan(0);
        expect(response.messages[0].content).toBe('Hello Bob!');
    });
});

