import WS from 'jest-websocket-mock';
import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { mockCanvas } from './setup.ts';

describe('WebSocket tests', () => {
  let server: WS | null = null;

  beforeEach(() => {
    // provide DOM root and view container used by renderRoute
    document.body.innerHTML = '<div id="root"><div id="view-container"></div></div>';
    // optional canvas mock used by some components
    if (typeof mockCanvas === 'function') mockCanvas();
  });

  afterEach(() => {
    WS.clean();
    server = null;
    vi.resetModules(); // ensure mocked modules do not leak between tests
  });

  it('opens websocket when navigating to /intra', async () => {
    // Mock endpoints module before importing app so views will use this websocket URL
    vi.mock('../src/endPoints', () => ({
      endpoint: {
        pong_backend_websocket: `ws://localhost:1234/ws`,
        pong_backend_api: 'http://localhost:3000/api',
      },
    }));

    // Import app after mocking endpoints so the mock is used during module initialization
    const app = await import('../src/app.ts');
    const { id, init } = app;

    // Ensure user is logged in so protected /intra route will be rendered
    id.username = 'tester';

    // Start mock server for the exact URL the client will open (includes query param)
    server = new WS(`ws://localhost:1234/ws?username=${id.username}`);

    // Navigate to /intra and initialize the app which will render the route and open the socket
    window.history.pushState({}, '', '/intra');
    // init is synchronous here, but wait for connection from server
    init();

    // Wait until client connects
    await server.connected;

    expect(server.clients.length).toBeGreaterThan(0);
  });
});

