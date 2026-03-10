/**
 * Verification tests for core functionality
 */

import { describe, it, expect } from 'vitest';
import { EventType, createEventId, AvatarStage } from '@openclaw-evolution/shared-types';
import { createHandshakeManager, PLUGIN_INFO } from '@openclaw-evolution/plugin-runtime';
import { createAvatarManager } from '@openclaw-evolution/evolution-engine';

describe('Verification Tests', () => {
  describe('Shared Types', () => {
    it('should have correct EventType values', () => {
      expect(EventType.USER_MESSAGE).toBe('user_message');
      expect(createEventId().startsWith('evt_')).toBe(true);
    });

    it('should have correct AvatarStage values', () => {
      expect(AvatarStage.BASE).toBe('base');
      expect(AvatarStage.AWAKENED).toBe('awakened');
      expect(AvatarStage.LEARNED).toBe('learned');
      expect(AvatarStage.EVOLVED).toBe('evolved');
    });
  });

  describe('Plugin Runtime', () => {
    it('should create HandshakeManager', () => {
      const manager = createHandshakeManager({ serviceUrl: 'http://localhost:3001' });
      expect(manager).toBeDefined();
    });

    it('should have correct PLUGIN_INFO', () => {
      expect(PLUGIN_INFO.name).toBe('@openclaw-evolution/plugin-runtime');
    });
  });

  describe('Evolution Engine', () => {
    it('should create AvatarManager', () => {
      const avatar = createAvatarManager();
      const state = avatar.getState();
      expect(state.currentStage).toBe('base');
    });
  });
});
