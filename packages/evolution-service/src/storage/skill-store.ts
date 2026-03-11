/**
 * OpenClaw Evolution Service - Skill Store
 *
 * Manages storage and retrieval of promoted skills.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Skill,
  SkillType,
  SkillStatus,
  SkillFilter,
  SkillVersion,
  SkillPromotion,
  SkillRollback,
} from '@openclaw-evolution/shared-types';
import { getDatabase } from './database';

// =============================================================================
// Skill Store
// =============================================================================

export class SkillStore {
  /**
   * Promote a candidate to a skill
   */
  promoteSkill(promotion: SkillPromotion): Skill {
    const db = getDatabase();

    const skillId = uuidv4();
    const now = Date.now();
    const version = promotion.version || '1.0.0';

    const skill: Skill = {
      skillId,
      skillName: promotion.skillName,
      skillType: promotion.skillType,
      version,
      status: 'active',
      content: promotion.content,
      sourceCandidateId: promotion.candidateId,
      sourceCardId: promotion.cardId,
      createdAt: now,
      updatedAt: now,
      metadata: {
        author: promotion.promotedBy,
        description: `Promoted from candidate ${promotion.candidateId}`,
        confidence: 1.0,
        evaluationScore: 1.0,
        usageCount: 0,
        changelog: [
          {
            version,
            timestamp: now,
            changes: [`Initial promotion from candidate ${promotion.candidateId}`],
            author: promotion.promotedBy || 'system',
          },
        ],
      },
    };

    const stmt = db.prepare(`
      INSERT INTO skills (
        skill_id, skill_name, skill_type, version, status,
        content, source_candidate_id, created_at, updated_at, metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      skill.skillId,
      skill.skillName,
      skill.skillType,
      skill.version,
      skill.status,
      skill.content,
      skill.sourceCandidateId,
      skill.createdAt,
      skill.updatedAt,
      skill.metadata ? JSON.stringify(skill.metadata) : null
    );

    // Save version history
    this.saveSkillVersion(skill, promotion.promotedBy || 'system', promotion.promotionReason || 'Initial promotion');

    return skill;
  }

  /**
   * Get a skill by ID
   */
  getSkill(skillId: string): Skill | null {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT skill_id, skill_name, skill_type, version, status,
             content, source_candidate_id, created_at, updated_at, metadata
      FROM skills
      WHERE skill_id = ?
    `);

    const row = stmt.get(skillId) as
      | {
          skill_id: string;
          skill_name: string;
          skill_type: string;
          version: string;
          status: string;
          content: string;
          source_candidate_id: string;
          created_at: number;
          updated_at: number;
          metadata: string | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToSkill(row);
  }

  /**
   * Query skills with filters
   */
  querySkills(filter: SkillFilter = {}): Skill[] {
    const db = getDatabase();

    let sql = `
      SELECT skill_id, skill_name, skill_type, version, status,
             content, source_candidate_id, created_at, updated_at, metadata
      FROM skills
      WHERE 1=1
    `;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filter.status) {
      conditions.push('status = ?');
      params.push(filter.status);
    }

    if (filter.skillType) {
      conditions.push('skill_type = ?');
      params.push(filter.skillType);
    }

    if (filter.search) {
      conditions.push('(skill_name LIKE ? OR content LIKE ?)');
      const searchTerm = `%${filter.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    if (filter.limit) {
      sql += ' LIMIT ?';
      params.push(filter.limit);
    }

    if (filter.offset) {
      sql += ' OFFSET ?';
      params.push(filter.offset);
    }

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as DatabaseRow[];

    return rows.map((row) => this.mapRowToSkill(row));
  }

  /**
   * Update skill status
   */
  updateSkillStatus(
    skillId: string,
    status: SkillStatus,
    metadata?: {
      deprecatedReason?: string;
      rollbackReason?: string;
    }
  ): boolean {
    const db = getDatabase();

    const stmt = db.prepare(`
      UPDATE skills
      SET status = ?,
          updated_at = ?,
          metadata = json_set(
            COALESCE(metadata, '{}'),
            '$.deprecatedReason',
            ?
          ),
          metadata = json_set(
            COALESCE(metadata, '{}'),
            '$.rollbackReason',
            ?
          )
      WHERE skill_id = ?
    `);

    const result = stmt.run(
      status,
      Date.now(),
      metadata?.deprecatedReason ?? null,
      metadata?.rollbackReason ?? null,
      skillId
    );

    return result.changes > 0;
  }

  /**
   * Rollback a skill to a previous version
   */
  rollbackSkill(rollback: SkillRollback): boolean {
    const db = getDatabase();

    // Get current skill
    const currentSkill = this.getSkill(rollback.skillId);
    if (!currentSkill) {
      return false;
    }

    // Find target version
    const targetVersion = rollback.targetVersion || this.getPreviousVersion(currentSkill.version);
    if (!targetVersion) {
      return false;
    }

    // Get version history
    const versionHistory = this.getVersionHistory(rollback.skillId);
    const targetVersionData = versionHistory.find((v) => v.version === targetVersion);

    if (!targetVersionData) {
      return false;
    }

    // Update skill with old content
    const stmt = db.prepare(`
      UPDATE skills
      SET content = ?,
          version = ?,
          status = 'rollback',
          updated_at = ?,
          metadata = json_set(
            COALESCE(metadata, '{}'),
            '$.rollbackReason',
            ?
          )
      WHERE skill_id = ?
    `);

    const result = stmt.run(
      targetVersionData.content,
      targetVersion,
      Date.now(),
      rollback.reason,
      rollback.skillId
    );

    // Save rollback as new version entry
    this.saveSkillVersion(currentSkill, rollback.rolledBackBy, rollback.reason);

    return result.changes > 0;
  }

  /**
   * Update a skill
   */
  updateSkill(
    skillId: string,
    updates: {
      content?: string;
      version?: string;
      updatedBy?: string;
      changeReason?: string;
    }
  ): Skill | null {
    const db = getDatabase();

    const skill = this.getSkill(skillId);
    if (!skill) {
      return null;
    }

    const now = Date.now();
    const newVersion = updates.version || skill.version;
    const newContent = updates.content || skill.content;

    // Update skill
    const stmt = db.prepare(`
      UPDATE skills
      SET content = ?,
          version = ?,
          updated_at = ?
      WHERE skill_id = ?
    `);

    const result = stmt.run(newContent, newVersion, now, skillId);

    if (result.changes === 0) {
      return null;
    }

    // Save version history
    const updatedSkill: Skill = {
      ...skill,
      content: newContent,
      version: newVersion,
      updatedAt: now,
    };

    this.saveSkillVersion(updatedSkill, updates.updatedBy || 'system', updates.changeReason || 'Skill update');

    return this.getSkill(skillId);
  }

  /**
   * Delete a skill
   */
  deleteSkill(skillId: string): boolean {
    const db = getDatabase();

    // First delete version history
    db.prepare('DELETE FROM skill_versions WHERE skill_id = ?').run(skillId);

    const stmt = db.prepare('DELETE FROM skills WHERE skill_id = ?');
    const result = stmt.run(skillId);

    return result.changes > 0;
  }

  /**
   * Get skill statistics
   */
  getSkillStats(): {
    total: number;
    byStatus: Record<SkillStatus, number>;
    byType: Record<SkillType, number>;
    recentPromotions: number;
  } {
    const db = getDatabase();

    const statsStmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'deprecated' THEN 1 ELSE 0 END) as deprecated,
        SUM(CASE WHEN status = 'rollback' THEN 1 ELSE 0 END) as rollback,
        SUM(CASE WHEN status = 'pending_rollout' THEN 1 ELSE 0 END) as pending_rollout
      FROM skills
    `);

    const stats = statsStmt.get() as {
      total: number;
      active: number;
      deprecated: number;
      rollback: number;
      pending_rollout: number;
    };

    const byTypeStmt = db.prepare(`
      SELECT skill_type, COUNT(*) as count
      FROM skills
      GROUP BY skill_type
    `);

    const typeRows = byTypeStmt.all() as Array<{ skill_type: string; count: number }>;

    const byType: Record<string, number> = {};
    for (const row of typeRows) {
      byType[row.skill_type] = row.count;
    }

    // Get recent promotions (last 7 days)
    const recentStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM skills
      WHERE created_at > ?
    `);

    const recent = recentStmt.get(Date.now() - 7 * 24 * 60 * 60 * 1000) as { count: number };

    return {
      total: stats.total,
      byStatus: {
        active: stats.active,
        deprecated: stats.deprecated,
        rollback: stats.rollback,
        pending_rollout: stats.pending_rollout,
      },
      byType: byType as Record<SkillType, number>,
      recentPromotions: recent.count,
    };
  }

  /**
   * Search skills by name or content
   */
  searchSkills(query: string, limit = 10): Skill[] {
    return this.querySkills({
      search: query,
      limit,
    });
  }

  /**
   * Get skills by type
   */
  getSkillsByType(skillType: SkillType): Skill[] {
    return this.querySkills({ skillType });
  }

  /**
   * Get version history for a skill
   */
  getVersionHistory(skillId: string): SkillVersion[] {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT version, content, created_at, created_by, change_reason
      FROM skill_versions
      WHERE skill_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(skillId) as VersionHistoryRow[];

    return rows.map((row) => ({
      skillId,
      version: row.version,
      content: row.content,
      createdAt: row.created_at,
      createdBy: row.created_by,
      changeReason: row.change_reason,
    }));
  }

  /**
   * Get previous version
   */
  private getPreviousVersion(currentVersion: string): string | null {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    if (patch > 0) {
      return `${major}.${minor}.${patch - 1}`;
    } else if (minor > 0) {
      return `${major}.${minor - 1}.0`;
    } else if (major > 0) {
      return `${major - 1}.0.0`;
    }

    return null;
  }

  /**
   * Save skill version
   */
  private saveSkillVersion(skill: Skill, createdBy: string, reason: string): void {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO skill_versions (
        skill_id, version, content, created_at, created_by, change_reason
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      skill.skillId,
      skill.version,
      skill.content,
      skill.createdAt,
      createdBy,
      reason
    );
  }

  /**
   * Map database row to Skill object
   */
  private mapRowToSkill(row: DatabaseRow): Skill {
    const skillType = row.skill_type as SkillType;

    return {
      skillId: row.skill_id,
      skillName: row.skill_name,
      skillType,
      version: row.version,
      status: row.status as SkillStatus,
      content: row.content,
      sourceCandidateId: row.source_candidate_id,
      sourceCardId: '', // Not stored in current schema
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }
}

// =============================================================================
// Database Row Types
// =============================================================================

type DatabaseRow = {
  skill_id: string;
  skill_name: string;
  skill_type: string;
  version: string;
  status: string;
  content: string;
  source_candidate_id: string;
  created_at: number;
  updated_at: number;
  metadata: string | null;
};

type VersionHistoryRow = {
  version: string;
  content: string;
  created_at: number;
  created_by: string;
  change_reason: string;
};

// =============================================================================
// Singleton Instance
// =============================================================================

let skillStoreInstance: SkillStore | null = null;

export function getSkillStore(): SkillStore {
  if (!skillStoreInstance) {
    skillStoreInstance = new SkillStore();
  }
  return skillStoreInstance;
}

export function createSkillStore(): SkillStore {
  return new SkillStore();
}
