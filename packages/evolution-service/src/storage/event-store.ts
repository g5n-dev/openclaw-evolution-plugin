/**
 * OpenClaw Evolution Service - Event Store
 *
 * Manages storage and retrieval of evolution events.
 */

import type { Event, EventType } from '@openclaw-evolution/shared-types';
import { getDatabase } from './database';

// =============================================================================
// Event Store
// =============================================================================

export interface EventFilter {
  sessionId?: string;
  eventType?: EventType;
  processed?: boolean;
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}

export class EventStore {
  constructor() {
    // Use shared database instance
  }

  /**
   * Store a single event
   */
  storeEvent(event: Event): void {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO events (event_id, session_id, event_type, event_data, timestamp, processed)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

    stmt.run(
      event.id,
      event.sessionId,
      event.type,
      JSON.stringify(event),
      event.timestamp
    );
  }

  /**
   * Store multiple events in a transaction
   */
  storeEvents(events: Event[]): void {
    const db = getDatabase();

    const insertFn = () => {
      const stmt = db.prepare(`
        INSERT INTO events (event_id, session_id, event_type, event_data, timestamp, processed)
        VALUES (?, ?, ?, ?, ?, 0)
      `);

      for (const event of events) {
        stmt.run(
          event.id,
          event.sessionId,
          event.type,
          JSON.stringify(event),
          event.timestamp
        );
      }
    };

    db.transaction(insertFn);
  }

  /**
   * Get an event by ID
   */
  getEvent(eventId: string): Event | null {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT event_data
      FROM events
      WHERE event_id = ?
    `);

    const row = stmt.get(eventId) as { event_data: string } | undefined;

    if (!row) {
      return null;
    }

    return JSON.parse(row.event_data) as Event;
  }

  /**
   * Query events with filters
   */
  queryEvents(filter: EventFilter = {}): Event[] {
    const db = getDatabase();

    let sql = 'SELECT event_data FROM events WHERE 1=1';
    const params: unknown[] = [];

    if (filter.sessionId) {
      sql += ' AND session_id = ?';
      params.push(filter.sessionId);
    }

    if (filter.eventType) {
      sql += ' AND event_type = ?';
      params.push(filter.eventType);
    }

    if (filter.processed !== undefined) {
      sql += ' AND processed = ?';
      params.push(filter.processed ? 1 : 0);
    }

    if (filter.startTime) {
      sql += ' AND timestamp >= ?';
      params.push(filter.startTime);
    }

    if (filter.endTime) {
      sql += ' AND timestamp <= ?';
      params.push(filter.endTime);
    }

    sql += ' ORDER BY timestamp DESC';

    if (filter.limit) {
      sql += ' LIMIT ?';
      params.push(filter.limit);
    }

    if (filter.offset) {
      sql += ' OFFSET ?';
      params.push(filter.offset);
    }

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as { event_data: string }[];

    return rows.map((row) => JSON.parse(row.event_data) as Event);
  }

  /**
   * Mark events as processed
   */
  markProcessed(eventIds: string[]): void {
    const db = getDatabase();

    const markMany = db.transaction(() => {
      const stmt = db.prepare(`
        UPDATE events
        SET processed = 1
        WHERE event_id = ?
      `);

      for (const eventId of eventIds) {
        stmt.run(eventId);
      }
    }) as unknown as () => void;

    markMany();
  }

  /**
   * Get event count for a session
   */
  getSessionEventCount(sessionId: string): number {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE session_id = ?
    `);

    const row = stmt.get(sessionId) as { count: number };

    return row.count;
  }

  /**
   * Delete events for a session
   */
  deleteSessionEvents(sessionId: string): void {
    const db = getDatabase();

    const stmt = db.prepare('DELETE FROM events WHERE session_id = ?');
    stmt.run(sessionId);
  }
}

// =============================================================================
// Factory
// =============================================================================

let eventStoreInstance: EventStore | undefined;

export function getEventStore(): EventStore {
  if (!eventStoreInstance) {
    eventStoreInstance = new EventStore();
  }
  return eventStoreInstance;
}
