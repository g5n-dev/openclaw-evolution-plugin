/**
 * OpenClaw Evolution Service - Evaluations Routes
 *
 * Handles candidate evaluation operations.
 */

import { Hono } from 'hono';
import type {
  RunEvaluationRequest,
  RunEvaluationResponse,
  GetEvaluationRequest,
  EvaluationResponse,
} from '@openclaw-evolution/shared-types';
import { v4 as uuidv4 } from 'uuid';
import { getCandidateStore } from '../../storage/candidate-store';
import { getEvaluator } from '../../engines/evaluator';

export const evaluationsRouter = new Hono();

/**
 * Run an evaluation
 */
evaluationsRouter.post('/run', async (c) => {
  try {
    const request = (await c.req.json()) as RunEvaluationRequest;

    // Validate request
    if (!request.candidateId) {
      return c.json({
        success: false,
        error: 'Invalid request: missing candidateId',
      }, 400);
    }

    // Check if candidate exists
    const candidateStore = getCandidateStore();
    const candidate = candidateStore.getCandidate(request.candidateId);

    if (!candidate) {
      return c.json({
        success: false,
        error: 'Candidate not found',
      }, 404);
    }

    // Run evaluation
    const evaluator = getEvaluator();
    const evaluation = await evaluator.runEvaluation({
      candidateId: request.candidateId,
      evaluationType: request.evaluationType,
      testCases: request.testCases,
      context: request.context,
    });

    const response: RunEvaluationResponse = {
      evaluationId: evaluation.evaluationId,
      candidateId: evaluation.candidateId,
      status: evaluation.status,
      startedAt: evaluation.startedAt,
      completedAt: evaluation.completedAt,
      score: evaluation.score,
      metrics: evaluation.metrics,
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Evaluation run error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Evaluation run failed',
    }, 500);
  }
});

/**
 * Get an evaluation
 */
evaluationsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // For now, return a placeholder
    return c.json({
      success: true,
      data: {
        evaluationId: id,
        candidateId: '',
        status: 'passed',
        evaluationType: 'automated',
        startedAt: Date.now(),
        completedAt: Date.now(),
        score: 0.8,
        metrics: {},
      } as EvaluationResponse,
    });
  } catch (error) {
    console.error('Evaluation query error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Evaluation query failed',
    }, 500);
  }
});
