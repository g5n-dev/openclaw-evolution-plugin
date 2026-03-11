/**
 * OpenClaw Evolution Service - Candidates Routes
 *
 * Handles candidate creation and management.
 */

import { Hono } from 'hono';
import type {
  CreateCandidateRequest,
  CandidateResponse,
} from '@openclaw-evolution/shared-types';
import { getCandidateStore } from '../../storage/candidate-store';

export const candidatesRouter = new Hono();

/**
 * Create a candidate
 */
candidatesRouter.post('/', async (c) => {
  try {
    const request = (await c.req.json()) as CreateCandidateRequest;

    // Validate request
    if (!request.sessionId || !request.content) {
      return c.json({
        success: false,
        error: 'Invalid request: missing sessionId or content',
      }, 400);
    }

    const candidateStore = getCandidateStore();

    const candidate = candidateStore.createCandidate({
      sessionId: request.sessionId,
      candidateType: request.candidateType,
      sourceEventId: request.sourceEvent,
      content: request.content,
      description: request.description,
      confidence: 0.5, // Default confidence
      metadata: request.metadata,
    });

    const response: CandidateResponse = {
      candidateId: candidate.candidateId,
      sessionId: candidate.sessionId,
      candidateType: candidate.candidateType,
      status: candidate.status,
      content: candidate.content,
      description: candidate.description,
      confidence: candidate.confidence,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Candidate creation error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Candidate creation failed',
    }, 500);
  }
});

/**
 * List candidates
 */
candidatesRouter.get('/', async (c) => {
  try {
    const sessionId = c.req.query('session_id');
    const status = c.req.query('status');
    const candidateType = c.req.query('candidate_type');
    const limit = c.req.query('limit');
    const offset = c.req.query('offset');

    const candidateStore = getCandidateStore();

    const candidates = candidateStore.queryCandidates({
      sessionId,
      status: status as Candidate['status'] | undefined,
      candidateType: candidateType as Candidate['candidateType'] | undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    return c.json({
      success: true,
      data: {
        candidates: candidates.map((c) => ({
          candidateId: c.candidateId,
          sessionId: c.sessionId,
          candidateType: c.candidateType,
          status: c.status,
          content: c.content,
          description: c.description,
          confidence: c.confidence,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        count: candidates.length,
      },
    });
  } catch (error) {
    console.error('Candidates query error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Candidates query failed',
    }, 500);
  }
});

/**
 * Get a candidate by ID
 */
candidatesRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const candidateStore = getCandidateStore();
    const candidate = candidateStore.getCandidate(id);

    if (!candidate) {
      return c.json({
        success: false,
        error: 'Candidate not found',
      }, 404);
    }

    const response: CandidateResponse = {
      candidateId: candidate.candidateId,
      sessionId: candidate.sessionId,
      candidateType: candidate.candidateType,
      status: candidate.status,
      content: candidate.content,
      description: candidate.description,
      confidence: candidate.confidence,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Candidate query error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Candidate query failed',
    }, 500);
  }
});
