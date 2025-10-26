// test/setup.ts
import { vi } from 'vitest';

export function mockWebSocket() {
  const wsMock = vi.fn() as unknown as typeof WebSocket;
  Object.assign(wsMock, {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  });
  globalThis.WebSocket = wsMock;
  return wsMock;
}
