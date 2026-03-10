/**
 * OpenClaw Evolution Service - Candidate Store
 *
 * Manages storage and retrieval of evolution candidates.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Candidate } from '@openclaw-evolution/shared-types';
import { getDatabase } from './database';

// =============================================================================
// Candidate Store
// =============================================================================

export interface CandidateFilter {
  sessionId?: string;
  status?: Candidate['status'];
  candidateType?: Candidate['candidateType'];
  limit?: number;
  offset?: number;
}

export class CandidateStore {
  constructor() {
    // Use shared database instance
  }

  /**
   * Create a new candidate
   */
  createCandidate(data: {
    sessionId: string;
    candidateType: Candidate['candidateType'];
    sourceEventId: string;
    content: string;
    description: string;
    confidence: number;
    metadata?: Record<string, unknown>;
  }): Candidate {
    const db = getDatabase();

    const candidate: Candidate = {
      candidateId: uuidv4(),
      sessionId: data.sessionId,
      candidateType: data.candidateType,
      sourceEventId: data.sourceEventId,
      content: data.content,
      description: data.description,
      confidence: data.confidence,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: data.metadata,
    };

    const stmt = db.prepare(`
      INSERT INTO candidates (
        candidate_id, session_id, candidate_type, source_event_id,
        content, description, confidence, status,
        created_at, updated_at, metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      candidate.candidateId,
      candidate.sessionId,
      candidate.candidateType,
      candidate.sourceEventId,
      candidate.content,
      candidate.description,
      candidate.confidence,
      candidate.status,
      candidate.createdAt,
      candidate.updatedAt,
      candidate.metadata ? JSON.stringify(candidate.metadata) : null
    );

    return candidate;
  }

  /**
   * Get a candidate by ID
   */
  getCandidate(candidateId: string): Candidate | null {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT candidate_id, session_id, candidate_type, source_event_id,
             content, description, confidence, status,
             created_at, updated_at, metadata
      FROM candidates
      WHERE candidate_id = ?
    `);

    const row = stmt.get(candidateId) as
      | {
          candidate_id: string;
          session_id: string;
          candidate_type: string;
          source_event_id: string;
          content: string;
          description: string;
          confidence: number;
          status: string;
          created_at: number;
          updated_at: number;
          metadata: string | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      candidateId: row.candidate_id,
      sessionId: row.session_id,
      candidateType: row.candidate_type as Candidate['candidateType'],
      sourceEventId: row.source_event_id,
      content: row.content,
      description: row.description,
      confidence: row.confidence,
      status: row.status as Candidate['status'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }

  /**
   * Query candidates with filters
   */
  queryCandidates(filter: CandidateFilter = {}): Candidate[] {
    const db = getDatabase();

    let sql = `
      SELECT candidate_id, session_id, candidate_type, source_event_id,
             content, description, confidence, status,
             created_at, updated_at, metadata
      FROM candidates
      WHERE 1=1
    `;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filter.sessionId) {
      conditions.push('session_id = ?');
      params.push(filter.sessionId);
    }

    if (filter.status) {
      conditions.push('status = ?');
      params.push(filter.status);
    }

    if (filter.candidateType) {
      conditions.push('candidate_type = ?');
      params.push(filter.candidateType);
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
    const rows = stmt.all(...params) as any[];

    return rows.map((row) => ({
      candidateId: row.candidate_id,
      sessionId: row.session_id,
      candidateType: row.candidate_type as Candidate['candidateType'],
      sourceEventId: row.source_event_id,
      content: row.content,
      description: row.description,
      confidence: row.confidence,
      status: row.status as Candidate['status'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }

  /**
   * Update candidate status
   */
  updateCandidateStatus(
    candidateId: string,
    status: Candidate['status']
  ): void {
    const db = getDatabase();

    const stmt = db.prepare(`
      UPDATE candidates
      SET status = ?, updated_at = ?
      WHERE candidate_id = ?
    `);

    stmt.run(status, Date.now(), candidateId);
  }

  /**
   * Delete a candidate
   */
  deleteCandidate(candidateId: string): void {
    const db = getDatabase();

    const stmt = db.prepare('DELETE FROM candidates WHERE candidate_id = ?');
    stmt.run(candidateId);
  }
}

// =============================================================================
// Factory
// =============================================================================

let candidateStoreInstance: CandidateStore | undefined;

export function getCandidateStore(): CandidateStore {
  if (!candidateStoreInstance) {
    candidateStoreInstance = new CandidateStore();
  }
  return candidateStoreInstance;
}
