/**
 * OpenClaw Evolution Service - Events Routes
 *
 * Handles event ingestion and querying.
 */

import { Hono } from 'hono';
import type {
  IngestEventsRequest,
  IngestEventsResponse,
  EventType,
} from '@openclaw-evolution/shared-types';
import { getEventStore } from '../../storage/event-store';
import { getTriggerEngine } from '../../engines/trigger';

export const eventsRouter = new Hono();

/**
 * Ingest events
 */
eventsRouter.post('/', async (c) => {
  try {
    const request = (await c.req.json()) as IngestEventsRequest;

    // Validate request
    if (!request.sessionId || !request.events || request.events.length === 0) {
      return c.json({
        success: false,
        error: 'Invalid request: missing sessionId or events',
      }, 400);
    }

    const eventStore = getEventStore();

    // Store events
    let processed = 0;
    const failed: Array<{ eventId: string; error: string }> = [];

    for (const event of request.events) {
      try {
        eventStore.storeEvent(event);
        processed++;
      } catch (error) {
        failed.push({
          eventId: event.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Process triggers for stored events
    if (processed > 0) {
      const triggerEngine = getTriggerEngine();
      await triggerEngine.processEvents(request.sessionId, request.events);
    }

    const response: IngestEventsResponse = {
      processed,
      failed: failed.length,
      errors: failed.length > 0 ? failed : undefined,
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Events ingestion error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Events ingestion failed',
    }, 500);
  }
});

/**
 * Query events
 */
eventsRouter.get('/', async (c) => {
  try {
    const sessionId = c.req.query('session_id');
    const eventType = c.req.query('event_type');
    const limit = c.req.query('limit');
    const offset = c.req.query('offset');

    const eventStore = getEventStore();

    const events = eventStore.queryEvents({
      sessionId,
      eventType: eventType as EventType | undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    return c.json({
      success: true,
      data: {
        events,
        count: events.length,
      },
    });
  } catch (error) {
    console.error('Events query error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Events query failed',
    }, 500);
  }
});
