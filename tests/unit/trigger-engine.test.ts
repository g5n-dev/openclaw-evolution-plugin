/**
 * Unit tests for Trigger Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TriggerEngine, getTriggerEngine } from '@openclaw-evolution/evolution-service';
import type { Event } from '@openclaw-evolution/shared-types';
import { EventType } from '@openclaw-evolution/shared-types';

describe('TriggerEngine', () => {
  let engine: TriggerEngine;

  beforeEach(() => {
    engine = getTriggerEngine();
  });

  describe('initialization', () => {
    it('should create trigger engine', () => {
      expect(engine).toBeDefined();
    });

    it('should have default triggers loaded', () => {
      const triggers = engine.getTriggers();
      expect(Array.isArray(triggers)).toBe(true);
      expect(triggers.length).toBeGreaterThan(0);
    });
  });

  describe('trigger management', () => {
    it('should add new trigger', () => {
      const initialCount = engine.getTriggers().length;

      engine.addTrigger({
        triggerId: 'test-trigger',
        name: 'Test Trigger',
        description: 'Test trigger for unit test',
        eventType: 'user_message',
        conditions: [],
        actions: [],
        enabled: true,
        priority: 0,
      });

      const triggers = engine.getTriggers();
      expect(triggers.length).toBe(initialCount + 1);
    });

    it('should remove trigger', () => {
      engine.addTrigger({
        triggerId: 'test-trigger-remove',
        name: 'Test Trigger',
        description: 'Test trigger for removal',
        eventType: 'user_message',
        conditions: [],
        actions: [],
        enabled: true,
        priority: 0,
      });

      const countBefore = engine.getTriggers().length;
      engine.removeTrigger('test-trigger-remove');

      const triggers = engine.getTriggers();
      expect(triggers.length).toBe(countBefore - 1);
    });

    it('should get all triggers', () => {
      const triggers = engine.getTriggers();
      expect(triggers).toBeDefined();
      expect(Array.isArray(triggers)).toBe(true);
      expect(triggers.length).toBeGreaterThan(0);
    });
  });

  describe('default triggers', () => {
    it('should include tool_call_pattern trigger', () => {
      const triggers = engine.getTriggers();
      const toolCallTrigger = triggers.find(t => t.triggerId === 'tool_call_pattern');
      expect(toolCallTrigger).toBeDefined();
      expect(toolCallTrigger?.eventType).toBe('tool_call');
    });

    it('should include error_recovery trigger', () => {
      const triggers = engine.getTriggers();
      const errorRecoveryTrigger = triggers.find(t => t.triggerId === 'error_recovery');
      expect(errorRecoveryTrigger).toBeDefined();
      expect(errorRecoveryTrigger?.eventType).toBe('tool_result');
    });
  });
});
