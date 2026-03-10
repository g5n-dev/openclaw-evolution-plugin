/**
 * Integration tests for Evolution Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EvolutionDatabase, getDatabase, closeDatabase } from '@openclaw-evolution/evolution-service';
import { EventStore, getEventStore } from '@openclaw-evolution/evolution-service';
import { CandidateStore, getCandidateStore } from '@openclaw-evolution/evolution-service';
import type { Event } from '@openclaw-evolution/shared-types';
import { EventType, createEventId } from '@openclaw-evolution/shared-types';

describe('Evolution Service Integration', () => {
  let db: any;

  beforeEach(() => {
    // Use in-memory database for tests
    db = getDatabase({ memory: true });
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('EventStore', () => {
    let store: EventStore;

    beforeEach(() => {
      store = getEventStore();
      // Create a test session first
      db.createSession('test-session', Date.now());
    });

    it('should store an event', () => {
      const event: Event = {
        id: createEventId(),
        type: EventType.USER_MESSAGE as any,
        timestamp: Date.now(),
        sessionId: 'test-session',
        data: { content: 'test' },
      };

      store.storeEvent(event);

      const retrieved = store.getEvent(event.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(event.id);
    });

    it('should store multiple events', () => {
      const events: Event[] = [
        {
          id: createEventId(),
          type: EventType.USER_MESSAGE as any,
          timestamp: Date.now(),
          sessionId: 'test-session',
          data: { content: 'test1' },
        },
        {
          id: createEventId(),
          type: EventType.ASSISTANT_RESPONSE as any,
          timestamp: Date.now(),
          sessionId: 'test-session',
          data: { content: 'test2' },
        },
      ];

      store.storeEvents(events);

      const retrieved = store.queryEvents({ sessionId: 'test-session' });
      expect(retrieved.length).toBe(2);
    });

    it('should query events by session', () => {
      // Create sessions first
      db.createSession('session-1', Date.now());
      db.createSession('session-2', Date.now());

      const event1: Event = {
        id: createEventId(),
        type: EventType.USER_MESSAGE as any,
        timestamp: Date.now(),
        sessionId: 'session-1',
        data: { content: 'test' },
      };

      const event2: Event = {
        id: createEventId(),
        type: EventType.USER_MESSAGE as any,
        timestamp: Date.now(),
        sessionId: 'session-2',
        data: { content: 'test' },
      };

      store.storeEvent(event1);
      store.storeEvent(event2);

      const session1Events = store.queryEvents({ sessionId: 'session-1' });
      const session2Events = store.queryEvents({ sessionId: 'session-2' });

      expect(session1Events.length).toBe(1);
      expect(session2Events.length).toBe(1);
      expect(session1Events[0].id).toBe(event1.id);
      expect(session2Events[0].id).toBe(event2.id);
    });
  });

  describe('CandidateStore', () => {
    let store: CandidateStore;

    beforeEach(() => {
      store = getCandidateStore();
      // Create a test session first
      db.createSession('test-session', Date.now());
    });

    it('should create a candidate', () => {
      const candidate = store.createCandidate({
        sessionId: 'test-session',
        candidateType: 'skill',
        sourceEventId: 'event-1',
        content: 'test content',
        description: 'test candidate',
        confidence: 0.8,
      });

      expect(candidate).toBeDefined();
      expect(candidate.candidateId).toBeDefined();
      expect(candidate.status).toBe('pending');
    });

    it('should retrieve a candidate', () => {
      const created = store.createCandidate({
        sessionId: 'test-session',
        candidateType: 'rule',
        sourceEventId: 'event-1',
        content: 'test content',
        description: 'test candidate',
        confidence: 0.6,
      });

      const retrieved = store.getCandidate(created.candidateId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.candidateId).toBe(created.candidateId);
      expect(retrieved?.description).toBe('test candidate');
    });

    it('should update candidate status', () => {
      const candidate = store.createCandidate({
        sessionId: 'test-session',
        candidateType: 'memory',
        sourceEventId: 'event-1',
        content: 'test content',
        description: 'test candidate',
        confidence: 0.7,
      });

      store.updateCandidateStatus(candidate.candidateId, 'approved');

      const updated = store.getCandidate(candidate.candidateId);
      expect(updated?.status).toBe('approved');
    });
  });

  describe('Database Integration', () => {
    it('should share database instance across stores', () => {
      const eventStore = getEventStore();
      const candidateStore = getCandidateStore();

      expect(eventStore).toBeDefined();
      expect(candidateStore).toBeDefined();

      // Both should use the same database instance
      const db1 = getDatabase();
      const db2 = getDatabase();

      expect(db1).toBeDefined();
      expect(db2).toBeDefined();
      expect(db1).toBe(db2);
    });
  });
});
