/**
 * Tests for evolution-engine package
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AvatarManager, createAvatarManager } from '@openclaw-evolution/evolution-engine';

describe('AvatarManager', () => {
  let manager: AvatarManager;

  beforeEach(() => {
    manager = createAvatarManager();
  });

  describe('initialization', () => {
    it('should create avatar with default config', () => {
      expect(manager).toBeDefined();
      const state = manager.getState();
      expect(state.currentStage).toBe('base');
      expect(state.mutations).toEqual([]);
      expect(state.evolutionCount).toBe(0);
    });

    it('should create avatar with custom config', () => {
      const customManager = createAvatarManager({
        baseColor: '#ff0000',
        size: 300,
      });

      expect(customManager).toBeDefined();
    });
  });

  describe('getState', () => {
    it('should return state copy', () => {
      const state1 = manager.getState();
      const state2 = manager.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different references
    });
  });

  describe('getStage', () => {
    it('should return initial stage', () => {
      expect(manager.getStage()).toBe('base');
    });
  });

  describe('getMutations', () => {
    it('should return empty mutations initially', () => {
      expect(manager.getMutations()).toEqual([]);
    });

    it('should return added mutations', () => {
      manager.addMutations(['shell_glow']);
      expect(manager.getMutations()).toContain('shell_glow');
    });
  });

  describe('addMutations', () => {
    it('should add unique mutations', () => {
      manager.addMutations(['shell_glow', 'node_expand']);
      const mutations = manager.getMutations();

      expect(mutations).toContain('shell_glow');
      expect(mutations).toContain('node_expand');
      expect(mutations.length).toBe(2);
    });

    it('should not add duplicate mutations', () => {
      manager.addMutations(['shell_glow']);
      manager.addMutations(['shell_glow']);
      const mutations = manager.getMutations();

      expect(mutations.filter((m) => m === 'shell_glow').length).toBe(1);
    });
  });

  describe('evolveToStage', () => {
    it('should evolve to awakened stage', () => {
      manager.evolveToStage('awakened' as any);
      expect(manager.getStage()).toBe('awakened');
      expect(manager.getState().evolutionCount).toBe(1);
      expect(manager.getMutations()).toContain('shell_glow');
    });

    it('should evolve to learned stage', () => {
      manager.evolveToStage('awakened' as any);
      manager.evolveToStage('learned' as any);
      expect(manager.getStage()).toBe('learned');
      expect(manager.getState().evolutionCount).toBe(2);
    });

    it('should track stage history', () => {
      manager.evolveToStage('awakened' as any);
      const history = manager.getStageHistory();

      expect(history.length).toBe(1);
      expect(history[0].stage).toBe('awakened');
    });
  });

  describe('reset', () => {
    it('should reset avatar to initial state', () => {
      manager.evolveToStage('awakened' as any);
      manager.reset();

      expect(manager.getStage()).toBe('base');
      expect(manager.getMutations()).toEqual([]);
      expect(manager.getState().evolutionCount).toBe(0);
    });
  });

  describe('toJSON', () => {
    it('should serialize state', () => {
      const json = manager.toJSON();

      expect(json).toHaveProperty('avatarId');
      expect(json).toHaveProperty('currentStage');
      expect(json).toHaveProperty('mutations');
      expect(json).toHaveProperty('config');
    });
  });
});
