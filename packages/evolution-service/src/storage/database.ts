/**
 * OpenClaw Evolution Service - Database Layer
 *
 * SQLite-based storage for events, candidates, evaluations, and cards.
 */

import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { join } from 'path';

// =============================================================================
// Database Configuration
// =============================================================================

export interface DatabaseConfig {
  path?: string;
  memory?: boolean;
}

// =============================================================================
// Database Schema
// =============================================================================

const SCHEMA = `
-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  status TEXT NOT NULL,
  event_count INTEGER DEFAULT 0,
  metadata TEXT
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  processed INTEGER DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
  candidate_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  candidate_type TEXT NOT NULL,
  source_event_id TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence REAL NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  metadata TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE INDEX IF NOT EXISTS idx_candidates_session ON candidates(session_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);

-- Evaluations
CREATE TABLE IF NOT EXISTS evaluations (
  evaluation_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  evaluation_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  score REAL,
  metrics TEXT,
  results TEXT,
  FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_evaluations_candidate ON evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);

-- Cards
CREATE TABLE IF NOT EXISTS cards (
  card_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  card_type TEXT NOT NULL,
  card_data TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER,
  metadata TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_cards_session ON cards(session_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  skill_id TEXT PRIMARY KEY,
  skill_name TEXT NOT NULL,
  skill_type TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL,
  content TEXT NOT NULL,
  source_candidate_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_skills_status ON skills(status);
CREATE INDEX IF NOT EXISTS idx_skills_type ON skills(skill_type);

-- Triggers
CREATE TABLE IF NOT EXISTS triggers (
  trigger_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  conditions TEXT NOT NULL,
  actions TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0
);
`;

// =============================================================================
// Database Class
// =============================================================================

export class EvolutionDatabase {
  private db: Database.Database;

  constructor(config: DatabaseConfig = {}) {
    if (config.memory) {
      this.db = new Database(':memory:');
    } else {
      const dbPath = config.path || join(process.cwd(), 'data', 'evolution.db');
      const dbDir = join(dbPath, '..');

      try {
        mkdirSync(dbDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      this.db = new Database(dbPath);
    }

    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this.initializeSchema();
  }

  /**
   * Initialize database schema
   */
  private initializeSchema(): void {
    this.db.exec(SCHEMA);
  }

  /**
   * Create a new session
   */
  createSession(
    sessionId: string,
    startTime: number,
    status = 'active'
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (session_id, start_time, status, event_count)
      VALUES (?, ?, ?, 0)
    `);
    stmt.run(sessionId, startTime, status);
  }

  /**
   * Get the underlying database instance
   */
  getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * Execute a transaction
   */
  transaction<T>(fn: (db: Database.Database) => T): T {
    return this.db.transaction(fn)(this.db);
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }

  /**
   * Prepare a statement
   */
  prepare(sql: string): Database.Statement {
    return this.db.prepare(sql);
  }

  /**
   * Execute a SQL statement
   */
  exec(sql: string): void {
    this.db.exec(sql);
  }
}

// =============================================================================
// Factory
// =============================================================================

let dbInstance: EvolutionDatabase | undefined;

export function getDatabase(config?: DatabaseConfig): EvolutionDatabase {
  if (!dbInstance) {
    dbInstance = new EvolutionDatabase(config);
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = undefined;
  }
}
