/**
 * OpenClaw Evolution Service - Skills Routes
 *
 * Handles skill promotion, management, and rollback.
 */

import { Hono } from 'hono';
import type {
  PromoteSkillRequest,
  PromoteSkillResponse,
  RollbackSkillRequest,
  RollbackSkillResponse,
  SkillResponse,
  SkillStatus,
  SkillType,
} from '@openclaw-evolution/shared-types';
import { getSkillStore } from '../../storage/skill-store';
import { getCardStore } from '../../storage/card-store';
import { getCandidateStore } from '../../storage/candidate-store';

export const skillsRouter = new Hono();

/**
 * Promote a candidate to a skill
 */
skillsRouter.post('/promote', async (c) => {
  try {
    const request = (await c.req.json()) as PromoteSkillRequest;

    // Validate request
    if (!request.candidateId || !request.skillName) {
      return c.json(
        {
          success: false,
          error: 'Invalid request: missing candidateId or skillName',
        },
        400
      );
    }

    // Validate skill type
    const validTypes: SkillType[] = ['tool', 'pattern', 'workflow'];
    if (!validTypes.includes(request.skillType as SkillType)) {
      return c.json(
        {
          success: false,
          error: `Invalid skillType: must be one of ${validTypes.join(', ')}`,
        },
        400
      );
    }

    // Verify candidate exists and is approved
    const candidateStore = getCandidateStore();
    const candidate = candidateStore.getCandidate(request.candidateId);

    if (!candidate) {
      return c.json(
        {
          success: false,
          error: 'Candidate not found',
        },
        404
      );
    }

    if (candidate.status !== 'approved') {
      return c.json(
        {
          success: false,
          error: `Candidate not approved (current status: ${candidate.status})`,
        },
        400
      );
    }

    // Verify card exists and is approved
    if (request.cardId) {
      const cardStore = getCardStore();
      const card = cardStore.getCard(request.cardId);

      if (!card) {
        return c.json(
          {
            success: false,
            error: 'Card not found',
          },
          404
        );
      }

      if (card.status !== 'approved') {
        return c.json(
          {
            success: false,
            error: `Card not approved (current status: ${card.status})`,
          },
          400
        );
      }

      // Verify card matches candidate
      if (card.candidateId !== request.candidateId) {
        return c.json(
          {
            success: false,
            error: 'Card does not match the candidate',
          },
          400
        );
      }
    }

    // Promote to skill
    const skillStore = getSkillStore();
    const skill = skillStore.promoteSkill({
      candidateId: request.candidateId,
      cardId: request.cardId || '',
      skillName: request.skillName,
      skillType: request.skillType,
      content: request.content,
      version: request.version,
      promotedBy: request.promotedBy,
      promotionReason: request.reason,
    });

    const response: PromoteSkillResponse = {
      skillId: skill.skillId,
      version: skill.version,
      status: skill.status as 'active' | 'pending_rollout',
      registeredAt: skill.createdAt,
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Skill promotion error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Skill promotion failed',
      },
      500
    );
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
      return c.json(
        {
          success: false,
          error: 'Invalid request: missing skillId',
        },
        400
      );
    }

    if (!request.reason) {
      return c.json(
        {
          success: false,
          error: 'Invalid request: missing reason for rollback',
        },
        400
      );
    }

    const skillStore = getSkillStore();
    const skill = skillStore.getSkill(request.skillId);

    if (!skill) {
      return c.json(
        {
          success: false,
          error: 'Skill not found',
        },
        404
      );
    }

    // Perform rollback
    const rolledBack = skillStore.rollbackSkill({
      skillId: request.skillId,
      targetVersion: request.previousVersion,
      reason: request.reason,
      rolledBackBy: 'system', // TODO: Get from auth context
      rollbackAt: Date.now(),
    });

    if (!rolledBack) {
      return c.json(
        {
          success: false,
          error: 'Rollback failed - target version not found',
        },
        400
      );
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
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Skill rollback failed',
      },
      500
    );
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
    const offset = c.req.query('offset');
    const search = c.req.query('search');

    const skillStore = getSkillStore();

    const skills = skillStore.querySkills({
      status: status as SkillStatus | undefined,
      skillType: skillType as SkillType | undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      search,
    });

    const skillResponses: SkillResponse[] = skills.map((skill) => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      skillType: skill.skillType,
      version: skill.version,
      status: skill.status,
      content: skill.content,
      metadata: skill.metadata,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    }));

    return c.json({
      success: true,
      data: {
        skills: skillResponses,
        count: skillResponses.length,
      },
    });
  } catch (error) {
    console.error('Skills query error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Skills query failed',
      },
      500
    );
  }
});

/**
 * Get a skill by ID
 */
skillsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const skillStore = getSkillStore();
    const skill = skillStore.getSkill(id);

    if (!skill) {
      return c.json(
        {
          success: false,
          error: 'Skill not found',
        },
        404
      );
    }

    const skillResponse: SkillResponse = {
      skillId: skill.skillId,
      skillName: skill.skillName,
      skillType: skill.skillType,
      version: skill.version,
      status: skill.status,
      content: skill.content,
      metadata: skill.metadata,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    };

    return c.json({
      success: true,
      data: skillResponse,
    });
  } catch (error) {
    console.error('Skill query error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Skill query failed',
      },
      500
    );
  }
});

/**
 * Get skill statistics
 */
skillsRouter.get('/stats/summary', async (c) => {
  try {
    const skillStore = getSkillStore();
    const stats = skillStore.getSkillStats();

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Skill stats error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get skill stats',
      },
      500
    );
  }
});

/**
 * Delete a skill
 */
skillsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const reason = c.req.query('reason') || 'Manual deletion';

    const skillStore = getSkillStore();
    const skill = skillStore.getSkill(id);

    if (!skill) {
      return c.json(
        {
          success: false,
          error: 'Skill not found',
        },
        404
      );
    }

    const deleted = skillStore.deleteSkill(id);

    if (!deleted) {
      return c.json(
        {
          success: false,
          error: 'Failed to delete skill',
        },
        500
      );
    }

    return c.json({
      success: true,
      data: {
        skillId: id,
        deletedAt: Date.now(),
        reason,
      },
    });
  } catch (error) {
    console.error('Skill deletion error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Skill deletion failed',
      },
      500
    );
  }
});
