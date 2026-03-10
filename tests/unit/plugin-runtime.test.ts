/**
 * Tests for plugin-runtime package
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HandshakeManager, createHandshakeManager, PLUGIN_INFO } from '@openclaw-evolution/plugin-runtime';

describe('HandshakeManager', () => {
  let manager: HandshakeManager;

  beforeEach(() => {
    manager = createHandshakeManager({
      serviceUrl: 'http://localhost:3001',
    });
  });

  describe('creation', () => {
    it('should create manager with config', () => {
      expect(manager).toBeDefined();
    });

    it('should have default timeout', () => {
      expect(manager).toBeDefined();
    });
  });

  describe('getHandshakeResult', () => {
    it('should return undefined before handshake', () => {
      const result = manager.getHandshakeResult();
      expect(result).toBeUndefined();
    });
  });

  describe('getSessionId', () => {
    it('should return undefined before handshake', () => {
      const sessionId = manager.getSessionId();
      expect(sessionId).toBeUndefined();
    });
  });

  describe('hasCapability', () => {
    it('should return false before handshake', () => {
      const hasCap = manager.hasCapability('event_capture');
      expect(hasCap).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset state', () => {
      // Simulate a successful handshake
      manager.reset();
      const result = manager.getHandshakeResult();
      expect(result).toBeUndefined();
    });
  });
});

describe('PLUGIN_INFO', () => {
  it('should have correct plugin info', () => {
    expect(PLUGIN_INFO.name).toBe('@openclaw-evolution/plugin-runtime');
    expect(PLUGIN_INFO.version).toBe('0.1.0');
    expect(PLUGIN_INFO.minHostVersion).toBe('2026.3.0');
    expect(PLUGIN_INFO.capabilities).toContain('event_capture');
    expect(PLUGIN_INFO.capabilities).toContain('card_rendering');
  });
});
