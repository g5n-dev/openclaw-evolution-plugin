/**
 * Tests for shared-types package
 */

import { describe, it, expect } from 'vitest';
import { EventType, createEventId } from '@openclaw-evolution/shared-types';

describe('Shared Types', () => {
  describe('EventType', () => {
    it('should have all required event types', () => {
      expect(EventType.USER_MESSAGE).toBe('user_message');
      expect(EventType.ASSISTANT_RESPONSE).toBe('assistant_response');
      expect(EventType.TOOL_CALL).toBe('tool_call');
      expect(EventType.TOOL_RESULT).toBe('tool_result');
      expect(EventType.SESSION_END).toBe('session_end');
      expect(EventType.FEEDBACK).toBe('feedback');
      expect(EventType.CORRECTION).toBe('correction');
      expect(EventType.CANDIDATE_DETECTED).toBe('candidate_detected');
      expect(EventType.EVALUATION_STARTED).toBe('evaluation_started');
      expect(EventType.EVALUATION_PASSED).toBe('evaluation_passed');
      expect(EventType.EVALUATION_FAILED).toBe('evaluation_failed');
      expect(EventType.SKILL_PROMOTED).toBe('skill_promoted');
      expect(EventType.SKILL_ROLLED_BACK).toBe('skill_rolled_back');
      expect(EventType.MEMORY_SAVED).toBe('memory_saved');
      expect(EventType.CARD_PRESENTED).toBe('card_presented');
      expect(EventType.CARD_DECISION).toBe('card_decision');
      expect(EventType.AVATAR_INITIALIZED).toBe('avatar_initialized');
      expect(EventType.AVATAR_STAGE_CHANGED).toBe('avatar_stage_changed');
      expect(EventType.ANIMATION_TRIGGERED).toBe('animation_triggered');
      expect(EventType.MUTATION_APPLIED).toBe('mutation_applied');
      expect(EventType.REPLAY_EVENT_LOGGED).toBe('replay_event_logged');
    });
  });

  describe('createEventId', () => {
    it('should create unique event IDs', () => {
      const id1 = createEventId();
      const id2 = createEventId();

      expect(id1).toMatch(/^evt_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^evt_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('AvatarStage', () => {
    it('should have correct stage values', () => {
      const { AvatarStage } = require('@openclaw-evolution/shared-types');

      expect(AvatarStage.BASE).toBe('base');
      expect(AvatarStage.AWAKENED).toBe('awakened');
      expect(AvatarStage.LEARNED).toBe('learned');
      expect(AvatarStage.EVOLVED).toBe('evolved');
    });
  });

  describe('AnimationType', () => {
    it('should have correct animation types', () => {
      const { AnimationType } = require('@openclaw-evolution/shared-types');

      expect(AnimationType.PULSE).toBe('pulse');
      expect(AnimationType.EVALUATING).toBe('evaluating');
      expect(AnimationType.ACTIVATION).toBe('activation');
      expect(AnimationType.MUTATION).toBe('mutation');
      expect(AnimationType.CELEBRATION).toBe('celebration');
      expect(AnimationType.ERROR).toBe('error');
    });
  });

  describe('AnimationIntensity', () => {
    it('should have correct intensity values', () => {
      const { AnimationIntensity } = require('@openclaw-evolution/shared-types');

      expect(AnimationIntensity.LOW).toBe('low');
      expect(AnimationIntensity.MEDIUM).toBe('medium');
      expect(AnimationIntensity.HIGH).toBe('high');
    });
  });
});
