/**
 * Unit tests for Evaluator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Evaluator, getEvaluator } from '@openclaw-evolution/evolution-service';

describe('Evaluator', () => {
  let evaluator: Evaluator;

  beforeEach(() => {
    evaluator = getEvaluator();
  });

  describe('evaluation', () => {
    it('should run automated evaluation', async () => {
      const result = await evaluator.runEvaluation({
        candidateId: 'cand-1',
        evaluationType: 'automated',
      });

      expect(result).toBeDefined();
      expect(result.evaluationId).toBeDefined();
      expect(result.candidateId).toBe('cand-1');
      expect(result.evaluationType).toBe('automated');
      expect(result.status).toMatch(/^(passed|failed|running|pending)$/);
      expect(result.startedAt).toBeDefined();
    });

    it('should run manual evaluation', async () => {
      const result = await evaluator.runEvaluation({
        candidateId: 'cand-1',
        evaluationType: 'manual',
        testCases: ['case-1', 'case-2'],
      });

      expect(result).toBeDefined();
      expect(result.evaluationType).toBe('manual');
    });

    it('should run distributed evaluation', async () => {
      const result = await evaluator.runEvaluation({
        candidateId: 'cand-1',
        evaluationType: 'distributed',
        context: { region: 'us-east-1' },
      });

      expect(result).toBeDefined();
      expect(result.evaluationType).toBe('distributed');
    });

    it('should complete evaluation with results', async () => {
      const result = await evaluator.runEvaluation({
        candidateId: 'cand-1',
        evaluationType: 'automated',
      });

      // Wait for async evaluation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.status).not.toBe('running');
      if (result.status === 'passed' || result.status === 'failed') {
        expect(result.completedAt).toBeDefined();
        expect(result.completedAt).toBeGreaterThanOrEqual(result.startedAt);
      }
    });
  });

  describe('scoring', () => {
    it('should assign score for passed evaluations', async () => {
      const result = await evaluator.runEvaluation({
        candidateId: 'cand-1',
        evaluationType: 'automated',
      });

      // Wait for evaluation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      if (result.status === 'passed') {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
      }
    });
  });
});
