/**
 * OpenClaw Evolution Service - Cards Routes
 *
 * Handles evolution card operations.
 */

import { Hono } from 'hono';
import type {
  CardResponse,
  CardDecisionRequest,
  CardDecisionResponse,
  CardStatus,
  CardType,
} from '@openclaw-evolution/shared-types';
import { getCardStore } from '../../storage/card-store';

export const cardsRouter = new Hono();

/**
 * List cards
 */
cardsRouter.get('/', async (c) => {
  try {
    const sessionId = c.req.query('session_id');
    const status = c.req.query('status');
    const cardType = c.req.query('card_type');
    const limit = c.req.query('limit');
    const offset = c.req.query('offset');
    const includeExpired = c.req.query('include_expired');

    const cardStore = getCardStore();

    const cards = cardStore.queryCards({
      sessionId,
      status: status as CardStatus | undefined,
      cardType: cardType as CardType | undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      includeExpired: includeExpired === 'true',
    });

    const cardResponses: CardResponse[] = cards.map((card) => ({
      cardId: card.cardId,
      sessionId: card.sessionId,
      candidateId: card.candidateId,
      cardType: card.cardType,
      title: card.title,
      description: card.description,
      status: card.status,
      content: card.content,
      createdAt: card.createdAt,
      expiresAt: card.expiresAt,
      metadata: card.metadata,
    }));

    return c.json({
      success: true,
      data: {
        cards: cardResponses,
        count: cardResponses.length,
      },
    });
  } catch (error) {
    console.error('Cards query error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cards query failed',
      },
      500
    );
  }
});

/**
 * Get a card by ID
 */
cardsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const cardStore = getCardStore();

    const card = cardStore.getCard(id);

    if (!card) {
      return c.json(
        {
          success: false,
          error: 'Card not found',
        },
        404
      );
    }

    const cardResponse: CardResponse = {
      cardId: card.cardId,
      sessionId: card.sessionId,
      candidateId: card.candidateId,
      cardType: card.cardType,
      title: card.title,
      description: card.description,
      status: card.status,
      content: card.content,
      createdAt: card.createdAt,
      expiresAt: card.expiresAt,
      metadata: card.metadata,
    };

    return c.json({
      success: true,
      data: cardResponse,
    });
  } catch (error) {
    console.error('Card query error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Card query failed',
      },
      500
    );
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
      return c.json(
        {
          success: false,
          error: 'Invalid request: missing decision',
        },
        400
      );
    }

    // Validate decision value
    const validDecisions: Array<CardStatus> = ['approved', 'rejected', 'deferred'];
    if (!validDecisions.includes(request.decision as CardStatus)) {
      return c.json(
        {
          success: false,
          error: `Invalid decision: must be one of ${validDecisions.join(', ')}`,
        },
        400
      );
    }

    const cardStore = getCardStore();

    // Check if card exists
    const card = cardStore.getCard(id);
    if (!card) {
      return c.json(
        {
          success: false,
          error: 'Card not found',
        },
        404
      );
    }

    // Check if card is still pending
    if (card.status !== 'pending') {
      return c.json(
        {
          success: false,
          error: `Card already ${card.status}`,
        },
        400
      );
    }

    // Update card status
    const updated = cardStore.updateCardStatus(id, request.decision as CardStatus, {
      decisionBy: request.decisionBy,
      decisionReason: request.reason,
      decidedAt: Date.now(),
    });

    if (!updated) {
      return c.json(
        {
          success: false,
          error: 'Failed to update card status',
        },
        500
      );
    }

    // Prepare next steps based on decision
    const nextSteps: string[] = [];
    if (request.decision === 'approve') {
      nextSteps.push('Candidate promoted for skill registration');
      // TODO: Trigger skill promotion workflow
    } else if (request.decision === 'reject') {
      nextSteps.push('Candidate rejected');
      // TODO: Log rejection reason for analytics
    } else if (request.decision === 'defer') {
      nextSteps.push('Card deferred for later review');
      // TODO: Schedule reminder
    }

    const response: CardDecisionResponse = {
      cardId: id,
      decision: request.decision,
      processedAt: Date.now(),
      nextSteps,
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Card decision error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Card decision failed',
      },
      500
    );
  }
});

/**
 * Get card statistics
 */
cardsRouter.get('/stats/summary', async (c) => {
  try {
    const sessionId = c.req.query('session_id');
    const cardStore = getCardStore();

    const stats = cardStore.getCardStats(sessionId);

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Card stats error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get card stats',
      },
      500
    );
  }
});
