/**
 * OpenClaw Evolution Service - Cards Routes
 *
 * Handles evolution card operations.
 */

import { Hono } from 'hono';
import type {
  ListCardsRequest,
  CardResponse,
  CardDecisionRequest,
  CardDecisionResponse,
} from '@openclaw-evolution/shared-types';
import { v4 as uuidv4 } from 'uuid';

export const cardsRouter = new Hono();

/**
 * List cards
 */
cardsRouter.get('/', async (c) => {
  try {
    const sessionId = c.req.query('session_id');
    const status = c.req.query('status');
    const limit = c.req.query('limit');

    // For MVP, return empty list
    return c.json({
      success: true,
      data: {
        cards: [],
        count: 0,
      },
    });
  } catch (error) {
    console.error('Cards query error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Cards query failed',
    }, 500);
  }
});

/**
 * Get a card by ID
 */
cardsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // For MVP, return placeholder
    return c.json({
      success: true,
      data: {
        cardId: id,
        sessionId: '',
        candidateId: '',
        cardType: 'skill_candidate',
        title: 'Example Card',
        description: 'This is a placeholder card',
        status: 'pending',
        content: {},
        createdAt: Date.now(),
      } as CardResponse,
    });
  } catch (error) {
    console.error('Card query error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Card query failed',
    }, 500);
  }
});

/**
 * Submit card decision
 */
cardsRouter.post('/:id/decision', async (c) => {
  try {
    const id = c.req.param('id');
    const request = (await c.req.json()) as CardDecisionRequest;

    // Validate request
    if (!request.decision) {
      return c.json({
        success: false,
        error: 'Invalid request: missing decision',
      }, 400);
    }

    // For MVP, just acknowledge
    const response: CardDecisionResponse = {
      cardId: id,
      decision: request.decision,
      processedAt: Date.now(),
      nextSteps: request.decision === 'approve' ? ['Skill promoted'] : [],
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Card decision error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Card decision failed',
    }, 500);
  }
});
