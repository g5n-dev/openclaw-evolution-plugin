/**
 * Unit tests for EvolutionDatabase
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EvolutionDatabase, closeDatabase } from '@openclaw-evolution/evolution-service';

describe('EvolutionDatabase', () => {
  let db: EvolutionDatabase;

  beforeEach(() => {
    db = new EvolutionDatabase({ memory: true });
  });

  afterEach(() => {
    db.close();
    closeDatabase();
  });

  describe('initialization', () => {
    it('should create in-memory database', () => {
      expect(db).toBeDefined();
      const rawDb = db.getDatabase();
      expect(rawDb).toBeDefined();
    });

    it('should enable foreign keys', () => {
      const result = db.getDatabase().pragma('foreign_keys', { simple: true });
      // In-memory database returns number, file-based returns string
      expect(result).toBeTruthy();
    });

    it('should use WAL mode or memory mode', () => {
      const result = db.getDatabase().pragma('journal_mode', { simple: true });
      // In-memory databases use 'memory' mode instead of 'wal'
      expect(['wal', 'memory']).toContain(result);
    });
  });

  describe('createSession', () => {
    it('should create a new session', () => {
      db.createSession('test-session', Date.now());

      const stmt = db.prepare('SELECT * FROM sessions WHERE session_id = ?');
      const row = stmt.get('test-session');
      expect(row).toBeDefined();
    });

    it('should set default status to active', () => {
      db.createSession('test-session', Date.now());

      const stmt = db.prepare('SELECT status FROM sessions WHERE session_id = ?');
      const row = stmt.get('test-session') as { status: string };
      expect(row.status).toBe('active');
    });
  });

  describe('transaction', () => {
    it('should execute transaction successfully', () => {
      let executed = false;

      db.transaction(() => {
        executed = true;
        db.createSession('tx-session', Date.now());
      });

      expect(executed).toBe(true);

      const stmt = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE session_id = ?');
      const row = stmt.get('tx-session') as { count: number };
      expect(row.count).toBe(1);
    });

    it('should rollback on error', () => {
      try {
        db.transaction(() => {
          db.createSession('tx-session-1', Date.now());
          throw new Error('Test error');
        });
      } catch (error) {
        // Expected error
      }

      const stmt = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE session_id = ?');
      const row = stmt.get('tx-session-1') as { count: number };
      expect(row.count).toBe(0);
    });
  });

  describe('prepare and exec', () => {
    it('should prepare statements', () => {
      const stmt = db.prepare('SELECT 1 as result');
      expect(stmt).toBeDefined();
    });

    it('should execute queries', () => {
      // Create a session to verify database operations work
      db.createSession('test-exec-session', Date.now());

      const stmt = db.prepare('SELECT * FROM sessions WHERE session_id = ?');
      const row = stmt.get('test-exec-session');
      expect(row).toBeDefined();
    });
  });

  describe('close', () => {
    it('should close database connection', () => {
      const testDb = new EvolutionDatabase({ memory: true });
      expect(() => testDb.close()).not.toThrow();
    });
  });
});
