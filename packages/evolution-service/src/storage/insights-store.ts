/**
 * OpenClaw Evolution Service - Insights Store
 *
 * Unified data access layer for insights and analytics.
 */

import type {
  DashboardMetrics,
  FunnelMetrics,
} from '@openclaw-evolution/shared-types';
import { getDatabase } from './database';
import { getEvaluationStore } from './evaluation-store';

// =============================================================================
// Time Range
// =============================================================================

export interface TimeRange {
  type: '1h' | '24h' | '7d' | '30d' | 'all';
  startTime: number;
  endTime: number;
}

// =============================================================================
// Insights Filter
// =============================================================================

export interface InsightsFilter {
  timeRange?: TimeRange;
  sessionId?: string;
}

// =============================================================================
// Skill Analysis (NEW)
// =============================================================================

export interface SkillAnalysis {
  totalSkills: number;
  activeSkills: number;
  skillsByType: Record<string, number>;
  recentlyPromoted: number;
  averageConfidence: number;
  topSkills: Array<{
    skillId: string;
    skillName: string;
    skillType: string;
    usageCount: number;
    confidence: number;
  }>;
  trends: {
    promotionRate: number;
    deprecationRate: number;
    rollbackRate: number;
  };
}

// =============================================================================
// Insights Store
// =============================================================================

export class InsightsStore {
  private evaluationStore = getEvaluationStore();

  /**
   * Parse time range string to TimeRange object
   */
  parseTimeRange(timeRange: string): TimeRange {
    const now = Date.now();
    const startTime = (() => {
      switch (timeRange) {
        case '1h':
          return now - 60 * 60 * 1000;
        case '24h':
          return now - 24 * 60 * 60 * 1000;
        case '7d':
          return now - 7 * 24 * 60 * 60 * 1000;
        case '30d':
          return now - 30 * 24 * 60 * 60 * 1000;
        case 'all':
          return 0;
        default:
          return now - 24 * 60 * 60 * 1000; // Default to 24h
      }
    })();

    return {
      type: timeRange as TimeRange['type'],
      startTime,
      endTime: now,
    };
  }

  /**
   * Get dashboard metrics
   */
  getDashboardMetrics(filter?: InsightsFilter): DashboardMetrics {
    const db = getDatabase();

    const timeRange = filter?.timeRange ?? this.parseTimeRange('24h');
    const { startTime, endTime } = timeRange;

    // Build session filter condition
    const sessionCondition = filter?.sessionId
      ? 'AND session_id = ?'
      : '';

    // Total sessions
    const sessionsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM sessions
      WHERE start_time >= ? AND start_time <= ?
      ${sessionCondition}
    `);
    const sessionsResult = filter?.sessionId
      ? sessionsStmt.get(startTime, endTime, filter.sessionId)
      : sessionsStmt.get(startTime, endTime);
    const totalSessions = (sessionsResult as { count: number }).count;

    // Total events
    const eventsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE timestamp >= ? AND timestamp <= ?
      ${filter?.sessionId ? 'AND session_id = ?' : ''}
    `);
    const eventsResult = filter?.sessionId
      ? eventsStmt.get(startTime, endTime, filter.sessionId)
      : eventsStmt.get(startTime, endTime);
    const totalEvents = (eventsResult as { count: number }).count;

    // Total candidates
    const candidatesStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM candidates
      WHERE created_at >= ? AND created_at <= ?
      ${filter?.sessionId ? 'AND session_id = ?' : ''}
    `);
    const candidatesResult = filter?.sessionId
      ? candidatesStmt.get(startTime, endTime, filter.sessionId)
      : candidatesStmt.get(startTime, endTime);
    const totalCandidates = (candidatesResult as { count: number }).count;

    // Total evaluations (from EvaluationStore)
    const evaluationStats = this.evaluationStore.getEvaluationStats(startTime, endTime);
    const totalEvaluations = evaluationStats.total;

    // Promoted skills
    const promotedStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM skills
      WHERE created_at >= ? AND created_at <= ?
      ${filter?.sessionId ? 'AND source_candidate_id IN (SELECT candidate_id FROM candidates WHERE session_id = ?)' : ''}
    `);
    const promotedResult = filter?.sessionId
      ? promotedStmt.get(startTime, endTime, filter.sessionId)
      : promotedStmt.get(startTime, endTime);
    const promotedSkills = (promotedResult as { count: number }).count;

    // Active skills
    const activeStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM skills
      WHERE status = 'active'
    `);
    const activeResult = activeStmt.get();
    const activeSkills = (activeResult as { count: number }).count;

    // Average evaluation score
    const avgEvaluationScore = evaluationStats.avgScore;

    // Event rate (hourly and daily)
    const hourlyDuration = Math.max(1, (endTime - startTime) / (60 * 60 * 1000)); // in hours
    const dailyDuration = Math.max(1, (endTime - startTime) / (24 * 60 * 60 * 1000)); // in days
    const eventRate = {
      hourly: Math.round(totalEvents / hourlyDuration),
      daily: Math.round(totalEvents / dailyDuration),
    };

    return {
      totalSessions,
      totalEvents,
      totalCandidates,
      totalEvaluations,
      promotedSkills,
      activeSkills,
      avgEvaluationScore,
      eventRate,
    };
  }

  /**
   * Get funnel metrics
   */
  getFunnelMetrics(filter?: InsightsFilter): FunnelMetrics {
    const db = getDatabase();

    const timeRange = filter?.timeRange ?? this.parseTimeRange('24h');
    const { startTime, endTime } = timeRange;

    const sessionCondition = filter?.sessionId
      ? 'AND session_id = ?'
      : '';

    // Events captured
    const eventsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE timestamp >= ? AND timestamp <= ?
      ${sessionCondition}
    `);
    const eventsResult = filter?.sessionId
      ? eventsStmt.get(startTime, endTime, filter.sessionId)
      : eventsStmt.get(startTime, endTime);
    const eventsCaptured = (eventsResult as { count: number }).count;

    // Candidates detected
    const candidatesStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM candidates
      WHERE created_at >= ? AND created_at <= ?
      ${sessionCondition}
    `);
    const candidatesResult = filter?.sessionId
      ? candidatesStmt.get(startTime, endTime, filter.sessionId)
      : candidatesStmt.get(startTime, endTime);
    const candidatesDetected = (candidatesResult as { count: number }).count;

    // Evaluations run
    const evaluationsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM evaluations
      WHERE started_at >= ? AND started_at <= ?
    `);
    const evaluationsResult = evaluationsStmt.get(startTime, endTime);
    const evaluationsRun = (evaluationsResult as { count: number }).count;

    // Cards presented
    const cardsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM cards
      WHERE created_at >= ? AND created_at <= ?
      ${sessionCondition}
    `);
    const cardsResult = filter?.sessionId
      ? cardsStmt.get(startTime, endTime, filter.sessionId)
      : cardsStmt.get(startTime, endTime);
    const cardsPresented = (cardsResult as { count: number }).count;

    // Skills promoted
    const promotedStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM skills
      WHERE created_at >= ? AND created_at <= ?
      ${filter?.sessionId ? 'AND source_candidate_id IN (SELECT candidate_id FROM candidates WHERE session_id = ?)' : ''}
    `);
    const promotedResult = filter?.sessionId
      ? promotedStmt.get(startTime, endTime, filter.sessionId)
      : promotedStmt.get(startTime, endTime);
    const skillsPromoted = (promotedResult as { count: number }).count;

    // Conversion rates (handle division by zero)
    const conversionRates = {
      eventToCandidate: eventsCaptured > 0
        ? Math.round((candidatesDetected / eventsCaptured) * 1000) / 1000
        : 0,
      candidateToEvaluation: candidatesDetected > 0
        ? Math.round((evaluationsRun / candidatesDetected) * 1000) / 1000
        : 0,
      evaluationToCard: evaluationsRun > 0
        ? Math.round((cardsPresented / evaluationsRun) * 1000) / 1000
        : 0,
      cardToPromotion: cardsPresented > 0
        ? Math.round((skillsPromoted / cardsPresented) * 1000) / 1000
        : 0,
    };

    return {
      eventsCaptured,
      candidatesDetected,
      evaluationsRun,
      cardsPresented,
      skillsPromoted,
      conversionRates,
    };
  }

  /**
   * Get skill analysis
   */
  getSkillAnalysis(filter?: InsightsFilter): SkillAnalysis {
    const db = getDatabase();

    const timeRange = filter?.timeRange ?? this.parseTimeRange('7d');
    const { startTime, endTime } = timeRange;

    // Total skills
    const totalStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM skills
    `);
    const totalResult = totalStmt.get();
    const totalSkills = (totalResult as { count: number }).count;

    // Active skills
    const activeStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM skills
      WHERE status = 'active'
    `);
    const activeResult = activeStmt.get();
    const activeSkills = (activeResult as { count: number }).count;

    // Skills by type
    const byTypeStmt = db.prepare(`
      SELECT skill_type, COUNT(*) as count
      FROM skills
      WHERE status = 'active'
      GROUP BY skill_type
    `);
    const byTypeRows = byTypeStmt.all() as Array<{ skill_type: string; count: number }>;
    const skillsByType: Record<string, number> = {};
    for (const row of byTypeRows) {
      skillsByType[row.skill_type] = row.count;
    }

    // Recently promoted (within time range)
    const recentStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM skills
      WHERE created_at >= ? AND created_at <= ?
    `);
    const recentResult = recentStmt.get(startTime, endTime);
    const recentlyPromoted = (recentResult as { count: number }).count;

    // Average confidence (from candidates that became skills)
    const confStmt = db.prepare(`
      SELECT AVG(c.confidence) as avg_conf
      FROM skills s
      JOIN candidates c ON s.source_candidate_id = c.candidate_id
      WHERE s.created_at >= ? AND s.created_at <= ?
    `);
    const confResult = confStmt.get(startTime, endTime);
    const averageConfidence = confResult && (confResult as { avg_conf: number | null }).avg_conf !== null
      ? Math.round((confResult as { avg_conf: number }).avg_conf * 1000) / 1000
      : 0;

    // Top skills (by usage count from metadata)
    const topSkillsStmt = db.prepare(`
      SELECT
        s.skill_id,
        s.skill_name,
        s.skill_type,
        json_extract(s.metadata, '$.usageCount') as usage_count
      FROM skills s
      WHERE s.status = 'active'
      ORDER BY usage_count DESC
      LIMIT 10
    `);
    const topSkillsRows = topSkillsStmt.all() as Array<{
      skill_id: string;
      skill_name: string;
      skill_type: string;
      usage_count: number | null;
    }>;
    const topSkills = topSkillsRows.map((row) => ({
      skillId: row.skill_id,
      skillName: row.skill_name,
      skillType: row.skill_type,
      usageCount: row.usage_count ?? 0,
      confidence: 0.8, // Placeholder - could be computed from evaluations
    }));

    // Trends
    const trendsStmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as promoted,
        SUM(CASE WHEN status = 'deprecated' THEN 1 ELSE 0 END) as deprecated,
        SUM(CASE WHEN status = 'rollback' THEN 1 ELSE 0 END) as rollback
      FROM skills
      WHERE created_at >= ? AND created_at <= ?
    `);
    const trendsResult = trendsStmt.get(startTime, endTime) as {
      total: number;
      promoted: number;
      deprecated: number;
      rollback: number;
    };
    const trends = {
      promotionRate: trendsResult.total > 0
        ? Math.round((trendsResult.promoted / trendsResult.total) * 1000) / 1000
        : 0,
      deprecationRate: trendsResult.total > 0
        ? Math.round((trendsResult.deprecated / trendsResult.total) * 1000) / 1000
        : 0,
      rollbackRate: trendsResult.total > 0
        ? Math.round((trendsResult.rollback / trendsResult.total) * 1000) / 1000
        : 0,
    };

    return {
      totalSkills,
      activeSkills,
      skillsByType,
      recentlyPromoted,
      averageConfidence,
      topSkills,
      trends,
    };
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let insightsStoreInstance: InsightsStore | null = null;

export function getInsightsStore(): InsightsStore {
  if (!insightsStoreInstance) {
    insightsStoreInstance = new InsightsStore();
  }
  return insightsStoreInstance;
}

export function createInsightsStore(): InsightsStore {
  return new InsightsStore();
}
