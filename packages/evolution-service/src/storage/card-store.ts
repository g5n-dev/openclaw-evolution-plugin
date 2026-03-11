/**
 * OpenClaw Evolution Service - Card Store
 *
 * Manages storage and retrieval of evolution cards.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Card,
  CardStatus,
  CardType,
} from '@openclaw-evolution/shared-types';
import { getDatabase } from './database';

// =============================================================================
// Card Filter
// =============================================================================

export interface CardFilter {
  sessionId?: string;
  status?: CardStatus;
  cardType?: CardType;
  candidateId?: string;
  limit?: number;
  offset?: number;
  includeExpired?: boolean;
}

// =============================================================================
// Card Store
// =============================================================================

export class CardStore {
  /**
   * Create a new evolution card from a candidate
   */
  createCard(data: {
    sessionId: string;
    candidateId: string;
    cardType: CardType;
    title: string;
    description: string;
    content: Record<string, unknown>;
    expiresAt?: number;
    metadata?: Record<string, unknown>;
  }): Card {
    const db = getDatabase();

    const cardId = uuidv4();
    const now = Date.now();

    const card: Card = {
      cardId,
      sessionId: data.sessionId,
      candidateId: data.candidateId,
      cardType: data.cardType,
      title: data.title,
      description: data.description,
      status: 'pending',
      content: data.content,
      createdAt: now,
      expiresAt: data.expiresAt,
      metadata: data.metadata,
    };

    const stmt = db.prepare(`
      INSERT INTO cards (
        card_id, session_id, candidate_id, card_type,
        title, description, status, content,
        created_at, expires_at, metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      card.cardId,
      card.sessionId,
      card.candidateId,
      card.cardType,
      card.title,
      card.description,
      card.status,
      JSON.stringify(card.content),
      card.createdAt,
      card.expiresAt ?? null,
      card.metadata ? JSON.stringify(card.metadata) : null
    );

    return card;
  }

  /**
   * Get a card by ID
   */
  getCard(cardId: string): Card | null {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT card_id, session_id, candidate_id, card_type,
             title, description, status, content,
             created_at, expires_at, metadata
      FROM cards
      WHERE card_id = ?
    `);

    const row = stmt.get(cardId) as
      | {
          card_id: string;
          session_id: string;
          candidate_id: string;
          card_type: string;
          title: string;
          description: string;
          status: string;
          content: string;
          created_at: number;
          expires_at: number | null;
          metadata: string | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToCard(row);
  }

  /**
   * Query cards with filters
   */
  queryCards(filter: CardFilter = {}): Card[] {
    const db = getDatabase();

    let sql = `
      SELECT card_id, session_id, candidate_id, card_type,
             title, description, status, content,
             created_at, expires_at, metadata
      FROM cards
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

    if (filter.cardType) {
      conditions.push('card_type = ?');
      params.push(filter.cardType);
    }

    if (filter.candidateId) {
      conditions.push('candidate_id = ?');
      params.push(filter.candidateId);
    }

    // Filter out expired cards unless explicitly requested
    if (!filter.includeExpired) {
      conditions.push('(expires_at IS NULL OR expires_at > ?)');
      params.push(Date.now());
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

    return rows.map((row) => this.mapRowToCard(row));
  }

  /**
   * Update card status
   */
  updateCardStatus(
    cardId: string,
    status: CardStatus,
    metadata?: {
      decisionBy?: string;
      decisionReason?: string;
      decidedAt?: number;
    }
  ): boolean {
    const db = getDatabase();

    const stmt = db.prepare(`
      UPDATE cards
      SET status = ?,
          metadata = json_set(
            COALESCE(metadata, '{}'),
            '$.decisionBy',
            json_extract(COALESCE(metadata, '{}'), '$.decisionBy')
          ),
          metadata = json_set(
            COALESCE(metadata, '{}'),
            '$.decisionReason',
            ?
          ),
          metadata = json_set(
            COALESCE(metadata, '{}'),
            '$.decidedAt',
            ?
          )
      WHERE card_id = ?
    `);

    const result = stmt.run(
      status,
      metadata?.decisionReason ?? null,
      metadata?.decidedAt ?? Date.now(),
      cardId
    );

    return result.changes > 0;
  }

  /**
   * Delete a card
   */
  deleteCard(cardId: string): boolean {
    const db = getDatabase();

    const stmt = db.prepare('DELETE FROM cards WHERE card_id = ?');
    const result = stmt.run(cardId);

    return result.changes > 0;
  }

  /**
   * Get card statistics
   */
  getCardStats(sessionId?: string): {
    total: number;
    byStatus: Record<CardStatus, number>;
    byType: Record<string, number>;
    pending: number;
    expired: number;
  } {
    const db = getDatabase();

    let sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'deferred' THEN 1 ELSE 0 END) as deferred,
        SUM(CASE WHEN expires_at < ? THEN 1 ELSE 0 END) as expired
      FROM cards
    `;

    const params: (string | number)[] = [Date.now()];

    if (sessionId) {
      sql += ' WHERE session_id = ?';
      params.push(sessionId);
    }

    const stmt = db.prepare(sql);
    const row = stmt.get(...params) as {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      deferred: number;
      expired: number;
    };

    return {
      total: row.total,
      byStatus: {
        pending: row.pending,
        approved: row.approved,
        rejected: row.rejected,
        deferred: row.deferred,
        expired: row.expired,
      },
      byType: this.getCardsByType(sessionId),
      pending: row.pending,
      expired: row.expired,
    };
  }

  /**
   * Get cards grouped by type
   */
  private getCardsByType(sessionId?: string): Record<string, number> {
    const db = getDatabase();

    let sql = `
      SELECT card_type, COUNT(*) as count
      FROM cards
      WHERE 1=1
    `;

    if (sessionId) {
      sql += ' AND session_id = ?';
    }

    sql += ' GROUP BY card_type';

    const stmt = db.prepare(sql);
    const rows = sessionId
      ? stmt.all(sessionId)
      : stmt.all();

    const byType: Record<string, number> = {};
    for (const row of rows as Array<{ card_type: string; count: number }>) {
      byType[row.card_type] = row.count;
    }

    return byType;
  }

  /**
   * Map database row to Card object
   */
  private mapRowToCard(row: DatabaseRow): Card {
    return {
      cardId: row.card_id,
      sessionId: row.session_id,
      candidateId: row.candidate_id,
      cardType: row.card_type as CardType,
      title: row.title,
      description: row.description,
      status: row.status as CardStatus,
      content: JSON.parse(row.content),
      createdAt: row.created_at,
      expiresAt: row.expires_at ?? undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }

  /**
   * Clean up expired cards older than specified days
   */
  cleanupExpiredCards(olderThanDays: number = 7): number {
    const db = getDatabase();

    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const stmt = db.prepare(`
      DELETE FROM cards
      WHERE expires_at < ? AND status IN ('pending', 'deferred')
    `);

    const result = stmt.run(cutoffTime);
    return result.changes;
  }
}

// =============================================================================
// Database Row Type
// =============================================================================

type DatabaseRow = {
  card_id: string;
  session_id: string;
  candidate_id: string;
  card_type: string;
  title: string;
  description: string;
  status: string;
  content: string;
  created_at: number;
  expires_at: number | null;
  metadata: string | null;
};

// =============================================================================
// Singleton Instance
// =============================================================================

let cardStoreInstance: CardStore | null = null;

export function getCardStore(): CardStore {
  if (!cardStoreInstance) {
    cardStoreInstance = new CardStore();
  }
  return cardStoreInstance;
}

export function createCardStore(): CardStore {
  return new CardStore();
}
