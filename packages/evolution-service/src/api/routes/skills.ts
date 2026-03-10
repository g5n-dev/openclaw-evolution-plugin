/**
 * OpenClaw Evolution Service - Skills Routes
 *
 * Handles skill promotion and management.
 */

import { Hono } from 'hono';
import type {
  PromoteSkillRequest,
  PromoteSkillResponse,
  RollbackSkillRequest,
  RollbackSkillResponse,
  ListSkillsRequest,
  SkillResponse,
} from '@openclaw-evolution/shared-types';
import { v4 as uuidv4 } from 'uuid';

export const skillsRouter = new Hono();

/**
 * Promote a candidate to a skill
 */
skillsRouter.post('/promote', async (c) => {
  try {
    const request = (await c.req.json()) as PromoteSkillRequest;

    // Validate request
    if (!request.candidateId || !request.skillName) {
      return c.json({
        success: false,
        error: 'Invalid request: missing candidateId or skillName',
      }, 400);
    }

    // For MVP, just acknowledge
    const skillId = uuidv4();
    const version = '1.0.0';

    const response: PromoteSkillResponse = {
      skillId,
      version,
      status: 'active',
      registeredAt: Date.now(),
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Skill promotion error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Skill promotion failed',
    }, 500);
  }
});

/**
 * Rollback a skill
 */
skillsRouter.post('/rollback', async (c) => {
  try {
    const request = (await c.req.json()) as RollbackSkillRequest;

    // Validate request
    if (!request.skillId) {
      return c.json({
        success: false,
        error: 'Invalid request: missing skillId',
      }, 400);
    }

    const response: RollbackSkillResponse = {
      skillId: request.skillId,
      previousVersion: request.previousVersion,
      rolledBackAt: Date.now(),
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Skill rollback error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Skill rollback failed',
    }, 500);
  }
});

/**
 * List skills
 */
skillsRouter.get('/', async (c) => {
  try {
    const status = c.req.query('status');
    const skillType = c.req.query('skill_type');
    const limit = c.req.query('limit');

    // For MVP, return empty list
    return c.json({
      success: true,
      data: {
        skills: [],
        count: 0,
      },
    });
  } catch (error) {
    console.error('Skills query error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Skills query failed',
    }, 500);
  }
});

/**
 * Get a skill by ID
 */
skillsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // For MVP, return placeholder
    return c.json({
      success: true,
      data: {
        skillId: id,
        skillName: 'Example Skill',
        skillType: 'tool',
        version: '1.0.0',
        status: 'active',
        content: '{}',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as SkillResponse,
    });
  } catch (error) {
    console.error('Skill query error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Skill query failed',
    }, 500);
  }
});
