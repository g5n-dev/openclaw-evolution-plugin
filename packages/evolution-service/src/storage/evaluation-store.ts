/**
 * OpenClaw Evolution Service - Evaluation Store
 *
 * Manages storage and retrieval of evaluation results.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Evaluation } from '@openclaw-evolution/shared-types';
import { getDatabase } from './database';

// =============================================================================
// Evaluation Filter
// =============================================================================

export interface EvaluationFilter {
  candidateId?: string;
  status?: 'running' | 'passed' | 'failed';
  evaluationType?: 'automated' | 'manual' | 'distributed';
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}

// =============================================================================
// Evaluation Store
// =============================================================================

export class EvaluationStore {
  /**
   * Create a new evaluation record
   */
  createEvaluation(data: {
    candidateId: string;
    evaluationType: 'automated' | 'manual' | 'distributed';
    status?: 'running' | 'passed' | 'failed';
    score?: number;
    metrics?: Record<string, number>;
    results?: Array<{
      testCase: string;
      passed: boolean;
      output?: unknown;
      error?: string;
      duration?: number;
    }>;
  }): Evaluation {
    const db = getDatabase();

    const evaluationId = uuidv4();
    const now = Date.now();

    const evaluation: Evaluation = {
      evaluationId,
      candidateId: data.candidateId,
      evaluationType: data.evaluationType,
      status: data.status ?? 'running',
      startedAt: now,
      completedAt: data.status === 'running' ? undefined : now,
      score: data.score,
      metrics: data.metrics,
      results: data.results,
    };

    const stmt = db.prepare(`
      INSERT INTO evaluations (
        evaluation_id, candidate_id, evaluation_type, status,
        started_at, completed_at, score, metrics, results
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      evaluation.evaluationId,
      evaluation.candidateId,
      evaluation.evaluationType,
      evaluation.status,
      evaluation.startedAt,
      evaluation.completedAt ?? null,
      evaluation.score ?? null,
      evaluation.metrics ? JSON.stringify(evaluation.metrics) : null,
      evaluation.results ? JSON.stringify(evaluation.results) : null
    );

    return evaluation;
  }

  /**
   * Get an evaluation by ID
   */
  getEvaluation(evaluationId: string): Evaluation | null {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT evaluation_id, candidate_id, evaluation_type, status,
             started_at, completed_at, score, metrics, results
      FROM evaluations
      WHERE evaluation_id = ?
    `);

    const row = stmt.get(evaluationId) as
      | {
          evaluation_id: string;
          candidate_id: string;
          evaluation_type: string;
          status: string;
          started_at: number;
          completed_at: number | null;
          score: number | null;
          metrics: string | null;
          results: string | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToEvaluation(row);
  }

  /**
   * Query evaluations with filters
   */
  queryEvaluations(filter: EvaluationFilter = {}): Evaluation[] {
    const db = getDatabase();

    let sql = `
      SELECT evaluation_id, candidate_id, evaluation_type, status,
             started_at, completed_at, score, metrics, results
      FROM evaluations
      WHERE 1=1
    `;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filter.candidateId) {
      conditions.push('candidate_id = ?');
      params.push(filter.candidateId);
    }

    if (filter.status) {
      conditions.push('status = ?');
      params.push(filter.status);
    }

    if (filter.evaluationType) {
      conditions.push('evaluation_type = ?');
      params.push(filter.evaluationType);
    }

    if (filter.startTime) {
      conditions.push('started_at >= ?');
      params.push(filter.startTime);
    }

    if (filter.endTime) {
      conditions.push('started_at <= ?');
      params.push(filter.endTime);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY started_at DESC';

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

    return rows.map((row) => this.mapRowToEvaluation(row));
  }

  /**
   * Update an evaluation
   */
  updateEvaluation(
    evaluationId: string,
    updates: {
      status?: 'running' | 'passed' | 'failed';
      score?: number;
      metrics?: Record<string, number>;
      results?: Array<{
        testCase: string;
        passed: boolean;
        output?: unknown;
        error?: string;
        duration?: number;
      }>;
    }
  ): boolean {
    const db = getDatabase();

    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      params.push(updates.status);

      // If status is not running, set completed_at
      if (updates.status !== 'running') {
        fields.push('completed_at = ?');
        params.push(Date.now());
      }
    }

    if (updates.score !== undefined) {
      fields.push('score = ?');
      params.push(updates.score);
    }

    if (updates.metrics !== undefined) {
      fields.push('metrics = ?');
      params.push(JSON.stringify(updates.metrics));
    }

    if (updates.results !== undefined) {
      fields.push('results = ?');
      params.push(JSON.stringify(updates.results));
    }

    if (fields.length === 0) {
      return false;
    }

    params.push(evaluationId);

    const stmt = db.prepare(`
      UPDATE evaluations
      SET ${fields.join(', ')}
      WHERE evaluation_id = ?
    `);

    const result = stmt.run(...params);
    return result.changes > 0;
  }

  /**
   * Get evaluation statistics within a time range
   */
  getEvaluationStats(startTime: number, endTime: number): {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    avgScore: number;
    avgDuration: number;
  } {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        AVG(score) as avg_score,
        AVG(completed_at - started_at) as avg_duration
      FROM evaluations
      WHERE started_at >= ? AND started_at <= ?
        AND completed_at IS NOT NULL
    `);

    const row = stmt.get(startTime, endTime) as {
      total: number;
      passed: number;
      failed: number;
      avg_score: number | null;
      avg_duration: number | null;
    };

    const passRate = row.total > 0 ? (row.passed / row.total) * 100 : 0;

    return {
      total: row.total,
      passed: row.passed,
      failed: row.failed,
      passRate: Math.round(passRate * 100) / 100,
      avgScore: row.avg_score ?? 0,
      avgDuration: row.avg_duration ?? 0,
    };
  }

  /**
   * Get evaluations count by status
   */
  getEvaluationsByStatus(startTime: number, endTime: number): {
    running: number;
    passed: number;
    failed: number;
  } {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT
        SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running,
        SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM evaluations
      WHERE started_at >= ? AND started_at <= ?
    `);

    const row = stmt.get(startTime, endTime) as {
      running: number;
      passed: number;
      failed: number;
    };

    return {
      running: row.running ?? 0,
      passed: row.passed ?? 0,
      failed: row.failed ?? 0,
    };
  }

  /**
   * Get evaluations count by type
   */
  getEvaluationsByType(startTime: number, endTime: number): Record<string, number> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT evaluation_type, COUNT(*) as count
      FROM evaluations
      WHERE started_at >= ? AND started_at <= ?
      GROUP BY evaluation_type
    `);

    const rows = stmt.all(startTime, endTime) as Array<{
      evaluation_type: string;
      count: number;
    }>;

    const byType: Record<string, number> = {};
    for (const row of rows) {
      byType[row.evaluation_type] = row.count;
    }

    return byType;
  }

  /**
   * Map database row to Evaluation object
   */
  private mapRowToEvaluation(row: DatabaseRow): Evaluation {
    return {
      evaluationId: row.evaluation_id,
      candidateId: row.candidate_id,
      evaluationType: row.evaluation_type as Evaluation['evaluationType'],
      status: row.status as Evaluation['status'],
      startedAt: row.started_at,
      completedAt: row.completed_at ?? undefined,
      score: row.score ?? undefined,
      metrics: row.metrics ? (JSON.parse(row.metrics) as Record<string, number>) : undefined,
      results: row.results ? (JSON.parse(row.results) as Evaluation['results']) : undefined,
    };
  }
}

// =============================================================================
// Database Row Type
// =============================================================================

type DatabaseRow = {
  evaluation_id: string;
  candidate_id: string;
  evaluation_type: string;
  status: string;
  started_at: number;
  completed_at: number | null;
  score: number | null;
  metrics: string | null;
  results: string | null;
};

// =============================================================================
// Singleton Instance
// =============================================================================

let evaluationStoreInstance: EvaluationStore | null = null;

export function getEvaluationStore(): EvaluationStore {
  if (!evaluationStoreInstance) {
    evaluationStoreInstance = new EvaluationStore();
  }
  return evaluationStoreInstance;
}

export function createEvaluationStore(): EvaluationStore {
  return new EvaluationStore();
}
