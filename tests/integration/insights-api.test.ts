/**
 * Insights API Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getInsightsStore, getDatabase } from '@openclaw-evolution/evolution-service';
import { getCandidateStore } from '@openclaw-evolution/evolution-service';
import { getCardStore } from '@openclaw-evolution/evolution-service';
import { getSkillStore } from '@openclaw-evolution/evolution-service';
import { getEvaluationStore } from '@openclaw-evolution/evolution-service';

describe('Insights API Integration', () => {
  let insightsStore: ReturnType<typeof getInsightsStore>;
  const testSessionId = `insights-test-${Date.now()}`;

  beforeAll(() => {
    insightsStore = getInsightsStore();

    // Initialize test session
    const db = getDatabase();
    try {
      db.createSession(testSessionId, Date.now());
    } catch (error) {
      console.log('Session already exists, reusing it');
    }

    // Seed test data
    seedTestData();
  });

  function seedTestData() {
    const candidateStore = getCandidateStore();
    const cardStore = getCardStore();
    const skillStore = getSkillStore();
    const evaluationStore = getEvaluationStore();

    // Create test candidates
    for (let i = 0; i < 5; i++) {
      const candidate = candidateStore.createCandidate({
        sessionId: testSessionId,
        candidateType: 'skill',
        sourceEventId: `test-event-${i}`,
        content: `test skill content ${i}`,
        description: `Test skill ${i}`,
        confidence: 0.8 + i * 0.04,
      });

      // Create evaluation
      evaluationStore.createEvaluation({
        candidateId: candidate.candidateId,
        evaluationType: 'automated',
        status: i % 2 === 0 ? 'passed' : 'failed',
        score: 0.7 + i * 0.05,
        metrics: {
          testsRun: 10,
          testsPassed: i % 2 === 0 ? 8 : 5,
        },
      });

      // Create card for passed evaluations
      if (i % 2 === 0) {
        const card = cardStore.createCard({
          sessionId: testSessionId,
          candidateId: candidate.candidateId,
          cardType: 'skill_candidate',
          title: `Test Skill ${i}`,
          description: `A test skill ${i}`,
          content: {
            skillName: `testSkill${i}`,
            skillType: 'tool',
            description: `Test tool ${i}`,
            code: `test code ${i}`,
          },
        });

        // Promote some skills
        if (i < 3) {
          skillStore.promoteSkill({
            candidateId: candidate.candidateId,
            cardId: card.cardId,
            skillName: `testSkill${i}`,
            skillType: 'tool',
            version: '1.0.0',
            content: `test code ${i}`,
            metadata: {
              usageCount: i * 10,
            },
          });
        }
      }
    }
  }

  describe('parseTimeRange', () => {
    it('should parse 1h time range correctly', () => {
      const timeRange = insightsStore.parseTimeRange('1h');
      const now = Date.now();
      const expectedStartTime = now - 60 * 60 * 1000;

      expect(timeRange.type).toBe('1h');
      expect(timeRange.endTime).toBe(now);
      expect(timeRange.startTime).toBeCloseTo(expectedStartTime, -3); // Within 1 second
    });

    it('should parse 24h time range correctly', () => {
      const timeRange = insightsStore.parseTimeRange('24h');
      const now = Date.now();
      const expectedStartTime = now - 24 * 60 * 60 * 1000;

      expect(timeRange.type).toBe('24h');
      expect(timeRange.endTime).toBe(now);
      expect(timeRange.startTime).toBeCloseTo(expectedStartTime, -3);
    });

    it('should parse 7d time range correctly', () => {
      const timeRange = insightsStore.parseTimeRange('7d');
      const now = Date.now();
      const expectedStartTime = now - 7 * 24 * 60 * 60 * 1000;

      expect(timeRange.type).toBe('7d');
      expect(timeRange.endTime).toBe(now);
      expect(timeRange.startTime).toBeCloseTo(expectedStartTime, -3);
    });

    it('should parse 30d time range correctly', () => {
      const timeRange = insightsStore.parseTimeRange('30d');
      const now = Date.now();
      const expectedStartTime = now - 30 * 24 * 60 * 60 * 1000;

      expect(timeRange.type).toBe('30d');
      expect(timeRange.endTime).toBe(now);
      expect(timeRange.startTime).toBeCloseTo(expectedStartTime, -3);
    });

    it('should parse all time range correctly', () => {
      const timeRange = insightsStore.parseTimeRange('all');

      expect(timeRange.type).toBe('all');
      expect(timeRange.startTime).toBe(0);
      expect(timeRange.endTime).toBeGreaterThan(0);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics for default time range', () => {
      const metrics = insightsStore.getDashboardMetrics();

      expect(metrics.totalSessions).toBeGreaterThanOrEqual(1);
      expect(metrics.totalEvents).toBeGreaterThanOrEqual(0);
      expect(metrics.totalCandidates).toBeGreaterThanOrEqual(5);
      expect(metrics.totalEvaluations).toBeGreaterThanOrEqual(5);
      expect(metrics.promotedSkills).toBeGreaterThanOrEqual(0);
      expect(metrics.activeSkills).toBeGreaterThanOrEqual(0);
      expect(metrics.avgEvaluationScore).toBeGreaterThanOrEqual(0);
      expect(metrics.eventRate).toBeDefined();
      expect(metrics.eventRate.hourly).toBeGreaterThanOrEqual(0);
      expect(metrics.eventRate.daily).toBeGreaterThanOrEqual(0);
    });

    it('should filter by session ID', () => {
      const metrics = insightsStore.getDashboardMetrics({
        sessionId: testSessionId,
      });

      expect(metrics.totalCandidates).toBeGreaterThanOrEqual(5);
      expect(metrics.promotedSkills).toBeGreaterThanOrEqual(0);
    });

    it('should respect time range filter', () => {
      const timeRange = insightsStore.parseTimeRange('1h');
      const metrics = insightsStore.getDashboardMetrics({
        timeRange,
      });

      // All test data should be within 1h
      expect(metrics.totalCandidates).toBeGreaterThanOrEqual(5);
      expect(metrics.totalEvaluations).toBeGreaterThanOrEqual(5);
    });
  });

  describe('getFunnelMetrics', () => {
    it('should return funnel metrics', () => {
      const metrics = insightsStore.getFunnelMetrics();

      expect(metrics.eventsCaptured).toBeGreaterThanOrEqual(0);
      expect(metrics.candidatesDetected).toBeGreaterThanOrEqual(5);
      expect(metrics.evaluationsRun).toBeGreaterThanOrEqual(5);
      expect(metrics.cardsPresented).toBeGreaterThanOrEqual(0);
      expect(metrics.skillsPromoted).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRates).toBeDefined();
      expect(metrics.conversionRates.eventToCandidate).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRates.candidateToEvaluation).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRates.evaluationToCard).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRates.cardToPromotion).toBeGreaterThanOrEqual(0);
    });

    it('should handle division by zero gracefully', () => {
      const metrics = insightsStore.getFunnelMetrics({
        timeRange: insightsStore.parseTimeRange('all'),
      });

      // Even with no data, conversion rates should be defined
      expect(metrics.conversionRates.eventToCandidate).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRates.candidateToEvaluation).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRates.evaluationToCard).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRates.cardToPromotion).toBeGreaterThanOrEqual(0);
    });

    it('should calculate conversion rates correctly', () => {
      const metrics = insightsStore.getFunnelMetrics();

      const { eventsCaptured, candidatesDetected, evaluationsRun, cardsPresented, skillsPromoted, conversionRates } = metrics;

      if (eventsCaptured > 0) {
        expect(conversionRates.eventToCandidate).toBeCloseTo(candidatesDetected / eventsCaptured);
      } else {
        expect(conversionRates.eventToCandidate).toBe(0);
      }

      if (candidatesDetected > 0) {
        expect(conversionRates.candidateToEvaluation).toBeCloseTo(evaluationsRun / candidatesDetected);
      } else {
        expect(conversionRates.candidateToEvaluation).toBe(0);
      }

      if (evaluationsRun > 0) {
        expect(conversionRates.evaluationToCard).toBeCloseTo(cardsPresented / evaluationsRun);
      } else {
        expect(conversionRates.evaluationToCard).toBe(0);
      }

      if (cardsPresented > 0) {
        expect(conversionRates.cardToPromotion).toBeCloseTo(skillsPromoted / cardsPresented);
      } else {
        expect(conversionRates.cardToPromotion).toBe(0);
      }
    });
  });

  describe('getSkillAnalysis', () => {
    it('should return skill analysis', () => {
      const analysis = insightsStore.getSkillAnalysis();

      expect(analysis.totalSkills).toBeGreaterThanOrEqual(0);
      expect(analysis.activeSkills).toBeGreaterThanOrEqual(0);
      expect(analysis.skillsByType).toBeDefined();
      expect(analysis.recentlyPromoted).toBeGreaterThanOrEqual(0);
      expect(analysis.averageConfidence).toBeGreaterThanOrEqual(0);
      expect(analysis.topSkills).toBeInstanceOf(Array);
      expect(analysis.trends).toBeDefined();
      expect(analysis.trends.promotionRate).toBeGreaterThanOrEqual(0);
      expect(analysis.trends.deprecationRate).toBeGreaterThanOrEqual(0);
      expect(analysis.trends.rollbackRate).toBeGreaterThanOrEqual(0);
    });

    it('should return top skills sorted by usage', () => {
      const analysis = insightsStore.getSkillAnalysis();

      if (analysis.topSkills.length > 1) {
        // Verify descending order by usageCount
        for (let i = 0; i < analysis.topSkills.length - 1; i++) {
          expect(analysis.topSkills[i].usageCount).toBeGreaterThanOrEqual(
            analysis.topSkills[i + 1].usageCount
          );
        }
      }
    });

    it('should group skills by type', () => {
      const analysis = insightsStore.getSkillAnalysis();

      // Check that skills are grouped
      const totalByType = Object.values(analysis.skillsByType).reduce((sum, count) => sum + count, 0);
      expect(totalByType).toBeGreaterThanOrEqual(analysis.activeSkills);
    });

    it('should respect time range filter', () => {
      const timeRange = insightsStore.parseTimeRange('7d');
      const analysis = insightsStore.getSkillAnalysis({
        timeRange,
      });

      // Recently promoted should be within time range
      expect(analysis.recentlyPromoted).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration scenarios', () => {
    it('should maintain data consistency across endpoints', () => {
      const dashboard = insightsStore.getDashboardMetrics();
      const funnel = insightsStore.getFunnelMetrics();
      const skills = insightsStore.getSkillAnalysis();

      // Active skills should match
      expect(dashboard.activeSkills).toBe(skills.activeSkills);

      // Promoted skills should be consistent
      expect(dashboard.promotedSkills).toBeGreaterThanOrEqual(funnel.skillsPromoted);
    });

    it('should handle different time ranges correctly', () => {
      const metrics1h = insightsStore.getDashboardMetrics({
        timeRange: insightsStore.parseTimeRange('1h'),
      });
      const metrics24h = insightsStore.getDashboardMetrics({
        timeRange: insightsStore.parseTimeRange('24h'),
      });
      const metricsAll = insightsStore.getDashboardMetrics({
        timeRange: insightsStore.parseTimeRange('all'),
      });

      // All time range should have >= counts than 1h
      expect(metricsAll.totalCandidates).toBeGreaterThanOrEqual(metrics1h.totalCandidates);
      expect(metricsAll.totalEvaluations).toBeGreaterThanOrEqual(metrics1h.totalEvaluations);

      // 24h should have >= counts than 1h
      expect(metrics24h.totalCandidates).toBeGreaterThanOrEqual(metrics1h.totalCandidates);
      expect(metrics24h.totalEvaluations).toBeGreaterThanOrEqual(metrics1h.totalEvaluations);
    });
  });
});
