/**
 * Integration tests for Evolution Service API
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { EvolutionServer } from '@openclaw-evolution/evolution-service';

describe('Evolution Service API Integration', () => {
  let server: EvolutionServer;
  let baseUrl: string;

  beforeAll(async () => {
    server = new EvolutionServer({
      port: 0, // Use random available port
      host: 'localhost',
    });

    await server.start();
    const port = (server as any).server?.port || 3001;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('POST /v1/runtime/handshake', () => {
    it('should perform handshake successfully', { timeout: 10000 }, async () => {
      const response = await fetch(`${baseUrl}/v1/runtime/handshake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pluginInfo: {
            name: '@test/plugin',
            version: '1.0.0',
            minHostVersion: '2026.3.0',
            capabilities: ['event_capture'],
          },
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.sessionId).toBeDefined();
      expect(data.hostInfo).toBeDefined();
    });

    it('should return error for invalid handshake', { timeout: 10000 }, async () => {
      const response = await fetch(`${baseUrl}/v1/runtime/handshake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /v1/events', () => {
    it('should accept events', { timeout: 10000 }, async () => {
      const response = await fetch(`${baseUrl}/v1/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [
            {
              id: 'evt-test-1',
              type: 'user_message',
              timestamp: Date.now(),
              sessionId: 'test-session',
              data: { content: 'test' },
            },
          ],
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.accepted).toBe(1);
    });
  });

  describe('GET /v1/insights/dashboard', () => {
    it('should return dashboard metrics', { timeout: 10000 }, async () => {
      const response = await fetch(`${baseUrl}/v1/insights/dashboard`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('totalSessions');
      expect(data).toHaveProperty('totalEvents');
    });
  });
});
