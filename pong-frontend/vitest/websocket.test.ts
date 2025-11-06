
import WS from "jest-websocket-mock";
import * as websocket from '../src/websocket.ts';
import { id, init } from '../src/app.ts'
import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { mockCanvas, } from './setup.ts';
import * as websocketReceiverModule from '../src/websocket/websocketReceiver.ts';
import { navigateTo } from "../src/utils.ts";
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
	var server: WS;
	const WS_URL = 'ws://localhost:1234';
	const spyWebsocketReceiver = vi.spyOn(websocketReceiverModule, 'websocketReceiver');
	beforeEach(async () => {
		server = new WS('ws://localhost:1234');

		mockCanvas();
		id.username = 'testuser';
		id.id = 1;
		document.body.innerHTML = '<div id="root"></div>';
		init();
	});

	afterEach(() => {
		server.close();
		vi.restoreAllMocks();
	});

	it('01 - WEBSOCKET CONNECTED', async () => {
		const client = websocket.initSocket(WS_URL, "testuser");
		await server.connected;
		// Nagivate to /intra
		navigateTo('/intra');
		// Expect socket to be open
		expect(client.readyState).toBe(WebSocket.OPEN);

		// Wait for async event dispatch
		await new Promise((r) => setTimeout(r, 10));
		console.log(document.body.innerHTML);

		client.close();
	});
});
