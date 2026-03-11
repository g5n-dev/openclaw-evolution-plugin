/**
 * Integration tests for Evolution Service API
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { EvolutionServer } from '@openclaw-evolution/evolution-service';

describe('Evolution Service API Integration', () => {
  let server: EvolutionServer;

  beforeAll(async () => {
    server = new EvolutionServer({
      port: 0,
      host: 'localhost',
    });

    await server.start();
  });

  describe('POST /v1/runtime/handshake', () => {
    it('should perform handshake successfully', async () => {
      const app = server.getApp();
      const response = await app.request('/v1/runtime/handshake', {
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
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.sessionId).toBeDefined();
      expect(result.data.hostInfo).toBeDefined();
    });

    it('should return error for invalid handshake', async () => {
      const app = server.getApp();
      const response = await app.request('/v1/runtime/handshake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /v1/events', () => {
    it('should accept events', async () => {
      const app = server.getApp();
      const response = await app.request('/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-session-123',
          events: [
            {
              id: 'evt-test-1',
              type: 'user_message',
              timestamp: Date.now(),
              sessionId: 'test-session-123',
              data: { content: 'test' },
            },
          ],
        }),
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.processed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /v1/insights/dashboard', () => {
    it('should return dashboard metrics', async () => {
      const app = server.getApp();
      const response = await app.request('/v1/insights/dashboard');

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalSessions');
      expect(result.data).toHaveProperty('totalEvents');
    });
  });
});
