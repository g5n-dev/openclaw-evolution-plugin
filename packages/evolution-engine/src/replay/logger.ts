/**
 * OpenClaw Evolution Engine - Replay Logger
 *
 * Logs all evolution events for replay functionality.
 */

export interface ReplayEvent {
  eventId: string;
  timestamp: number;
  eventType: string;
  data: Record<string, unknown>;
  replayData?: {
    snapshot: Record<string, unknown>;
    mutations: string[];
    duration?: number;
  };
}

export interface BaseEvent {
  id: string;
  sessionId: string;
  timestamp: number;
  type: string;
  data: unknown;
}

export interface ReplaySession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  events: ReplayEvent[];
  avatarSnapshot: {
    stage: string;
    mutations: string[];
    evolutionCount: number;
  };
}

export class ReplayLogger {
  private sessions: Map<string, ReplaySession> = new Map();
  private currentSessionId?: string;

  /**
   * Start a replay session
   */
  startSession(sessionId: string): void {
    this.currentSessionId = sessionId;

    this.sessions.set(sessionId, {
      sessionId,
      startTime: Date.now(),
      events: [],
      avatarSnapshot: {
        stage: 'base',
        mutations: [],
        evolutionCount: 0,
      },
    });
  }

  /**
   * End a replay session
   */
  endSession(sessionId?: string): void {
    const id = sessionId || this.currentSessionId;
    if (!id) return;

    const session = this.sessions.get(id);
    if (session) {
      session.endTime = Date.now();
    }

    if (id === this.currentSessionId) {
      this.currentSessionId = undefined;
    }
  }

  /**
   * Log an event for replay
   */
  logEvent(
    event: BaseEvent,
    replayData?: {
      snapshot?: Record<string, unknown>;
      mutations?: string[];
      duration?: number;
    }
  ): void {
    const sessionId = event.sessionId;

    let session = this.sessions.get(sessionId);
    if (!session) {
      this.startSession(sessionId);
      session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Failed to create session for ${sessionId}`);
      }
    }

    session.events.push({
      eventId: event.id,
      timestamp: event.timestamp,
      eventType: event.type,
      data: event.data as Record<string, unknown>,
      replayData,
    });
  }

  /**
   * Update avatar snapshot
   */
  updateAvatarSnapshot(
    sessionId: string,
    snapshot: {
      stage: string;
      mutations: string[];
      evolutionCount: number;
    }
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.avatarSnapshot = snapshot;
    }
  }

  /**
   * Get replay session
   */
  getSession(sessionId: string): ReplaySession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): ReplaySession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get replay data for a session
   */
  getReplayData(sessionId: string): {
    session: ReplaySession;
    duration: number;
    eventCount: number;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const endTime = session.endTime || Date.now();
    const duration = endTime - session.startTime;

    return {
      session,
      duration,
      eventCount: session.events.length,
    };
  }

  /**
   * Export replay data
   */
  exportReplay(sessionId: string): string | null {
    const data = this.getReplayData(sessionId);
    if (!data) return null;

    return JSON.stringify({
      sessionId: data.session.sessionId,
      startTime: data.session.startTime,
      endTime: data.session.endTime,
      duration: data.duration,
      eventCount: data.eventCount,
      events: data.session.events,
      avatarSnapshot: data.session.avatarSnapshot,
    }, null, 2);
  }

  /**
   * Clear all sessions
   */
  clear(): void {
    this.sessions.clear();
    this.currentSessionId = undefined;
  }
}

export function createReplayLogger(): ReplayLogger {
  return new ReplayLogger();
}
