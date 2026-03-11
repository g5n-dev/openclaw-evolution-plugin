/**
 * Skills API Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getSkillStore, getCandidateStore, getCardStore, getDatabase } from '@openclaw-evolution/evolution-service';
import type { SkillType } from '@openclaw-evolution/shared-types';

describe('SkillStore Integration', () => {
  let skillStore: ReturnType<typeof getSkillStore>;
  const testSessionId = `skills-api-test-${Date.now()}`;

  beforeAll(() => {
    skillStore = getSkillStore();

    // Initialize test session
    const db = getDatabase();
    try {
      db.createSession(testSessionId, Date.now());
    } catch (error) {
      console.log('Session already exists, reusing it');
    }
  });

  describe('promoteSkill', () => {
    it('should promote a candidate to a tool skill', () => {
      // Create candidate first
      const candidateStore = getCandidateStore();
      const candidate = candidateStore.createCandidate({
        sessionId: testSessionId,
        candidateType: 'skill',
        sourceEventId: 'test-event-1',
        content: 'test skill content',
        description: 'Test skill for promotion',
        confidence: 0.9,
      });

      // Create card
      const cardStore = getCardStore();
      const card = cardStore.createCard({
        sessionId: testSessionId,
        candidateId: candidate.candidateId,
        cardType: 'skill_candidate',
        title: 'Test Skill Candidate',
        description: 'A test skill',
        content: {
          skillName: 'testTool',
          skillType: 'tool',
          description: 'Test tool',
          code: 'test code',
          language: 'javascript',
          confidence: 0.9,
          estimatedImpact: 'medium',
          useCases: [],
        },
      });

      // Approve card
      cardStore.updateCardStatus(card.cardId, 'approved');

      // Promote to skill
      const skill = skillStore.promoteSkill({
        candidateId: candidate.candidateId,
        cardId: card.cardId,
        skillName: 'testTool',
        skillType: 'tool' as SkillType,
        content: JSON.stringify({ name: 'testTool', code: 'test code' }),
        version: '1.0.0',
        promotedBy: 'test-user',
        promotionReason: 'Test promotion',
      });

      expect(skill).toBeDefined();
      expect(skill.skillId).toBeDefined();
      expect(skill.skillName).toBe('testTool');
      expect(skill.version).toBe('1.0.0');
      expect(skill.status).toBe('active');

      // Verify skill can be retrieved
      const retrieved = skillStore.getSkill(skill.skillId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.skillName).toBe('testTool');
    });

    it('should create a pattern skill', () => {
      const candidateStore = getCandidateStore();
      const candidate = candidateStore.createCandidate({
        sessionId: testSessionId,
        candidateType: 'skill',
        sourceEventId: 'test-event-2',
        content: 'pattern content',
        description: 'Test pattern',
        confidence: 0.8,
      });

      const cardStore = getCardStore();
      const card = cardStore.createCard({
        sessionId: testSessionId,
        candidateId: candidate.candidateId,
        cardType: 'skill_candidate',
        title: 'Test Pattern',
        description: 'Test pattern skill',
        content: {
          skillName: 'testPattern',
          skillType: 'pattern',
          description: 'Test pattern',
          code: 'pattern code',
          language: 'typescript',
          confidence: 0.8,
          estimatedImpact: 'high',
          useCases: ['case1', 'case2'],
        },
      });

      cardStore.updateCardStatus(card.cardId, 'approved');

      const skill = skillStore.promoteSkill({
        candidateId: candidate.candidateId,
        cardId: card.cardId,
        skillName: 'testPattern',
        skillType: 'pattern' as SkillType,
        content: JSON.stringify({ name: 'testPattern', pattern: 'test pattern' }),
        version: '1.0.0',
      });

      expect(skill.skillType).toBe('pattern');
    });

    it('should create a workflow skill', () => {
      const candidateStore = getCandidateStore();
      const candidate = candidateStore.createCandidate({
        sessionId: testSessionId,
        candidateType: 'skill',
        sourceEventId: 'test-event-3',
        content: 'workflow content',
        description: 'Test workflow',
        confidence: 0.85,
      });

      const cardStore = getCardStore();
      const card = cardStore.createCard({
        sessionId: testSessionId,
        candidateId: candidate.candidateId,
        cardType: 'skill_candidate',
        title: 'Test Workflow',
        description: 'Test workflow skill',
        content: {
          skillName: 'testWorkflow',
          skillType: 'workflow',
          description: 'Test workflow',
          code: 'workflow code',
          language: 'python',
          confidence: 0.85,
          estimatedImpact: 'high',
          useCases: [],
        },
      });

      cardStore.updateCardStatus(card.cardId, 'approved');

      const skill = skillStore.promoteSkill({
        candidateId: candidate.candidateId,
        cardId: card.cardId,
        skillName: 'testWorkflow',
        skillType: 'workflow' as SkillType,
        content: JSON.stringify({ name: 'testWorkflow', steps: [] }),
        version: '1.0.0',
      });

      expect(skill.skillType).toBe('workflow');
    });
  });

  describe('querySkills', () => {
    it('should query all skills', () => {
      const skills = skillStore.querySkills();
      expect(skills.length).toBeGreaterThan(0);
    });

    it('should filter skills by type', () => {
      const toolSkills = skillStore.querySkills({ skillType: 'tool' as SkillType });
      expect(toolSkills.length).toBeGreaterThan(0);
      expect(toolSkills.every((s) => s.skillType === 'tool')).toBe(true);
    });

    it('should filter skills by status', () => {
      const activeSkills = skillStore.querySkills({ status: 'active' });
      expect(activeSkills.length).toBeGreaterThan(0);
      expect(activeSkills.every((s) => s.status === 'active')).toBe(true);
    });

    it('should search skills by name', () => {
      const results = skillStore.searchSkills('test', 10);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((s) => s.skillName.includes('test'))).toBe(true);
    });
  });

  describe('rollbackSkill', () => {
    it('should rollback a skill to previous version', () => {
      // Create initial skill v1.0.0
      const candidateStore = getCandidateStore();
      const candidate = candidateStore.createCandidate({
        sessionId: testSessionId,
        candidateType: 'skill',
        sourceEventId: 'test-event-rollback-v1',
        content: 'v1 content',
        description: 'Test rollback v1',
        confidence: 0.9,
      });

      const cardStore = getCardStore();
      const card = cardStore.createCard({
        sessionId: testSessionId,
        candidateId: candidate.candidateId,
        cardType: 'skill_candidate',
        title: 'Test Rollback',
        description: 'For rollback testing',
        content: {
          skillName: 'rollbackTest',
          skillType: 'tool',
          description: 'Test',
          code: 'v1 code',
          language: 'javascript',
          confidence: 0.9,
          estimatedImpact: 'medium',
          useCases: [],
        },
      });

      cardStore.updateCardStatus(card.cardId, 'approved');

      const skill = skillStore.promoteSkill({
        candidateId: candidate.candidateId,
        cardId: card.cardId,
        skillName: 'rollbackTest',
        skillType: 'tool' as SkillType,
        content: JSON.stringify({ name: 'rollbackTest', code: 'v1 code' }),
        version: '1.0.0',
      });

      expect(skill.version).toBe('1.0.0');

      // Update skill to v2.0.0
      const updated = skillStore.updateSkill(skill.skillId, {
        content: JSON.stringify({ name: 'rollbackTest', code: 'v2 code' }),
        version: '2.0.0',
        updatedBy: 'test-user',
        changeReason: 'Updated to v2.0.0',
      });

      expect(updated).toBeDefined();
      expect(updated?.version).toBe('2.0.0');

      // Rollback to 1.0.0
      const rolledBack = skillStore.rollbackSkill({
        skillId: skill.skillId,
        targetVersion: '1.0.0',
        reason: 'Testing rollback',
        rolledBackBy: 'test-user',
        rollbackAt: Date.now(),
      });

      expect(rolledBack).toBe(true);

      // Verify skill was rolled back
      const rolledBackSkill = skillStore.getSkill(skill.skillId);
      expect(rolledBackSkill?.version).toBe('1.0.0');
      expect(rolledBackSkill?.status).toBe('rollback');
      expect(rolledBackSkill?.content).toContain('v1 code');
    });
  });

  describe('getSkillStats', () => {
    it('should return skill statistics', () => {
      const stats = skillStore.getSkillStats();

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byStatus).toBeDefined();
      expect(stats.byType).toBeDefined();
    });
  });
});
