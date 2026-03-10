/**
 * OpenClaw Evolution Plugin - Event Bridge
 *
 * Bridges events between the OpenClaw runtime and the evolution service.
 * Normalizes events and manages batching for efficient transmission.
 */

import type {
  IngestEventsRequest,
  IngestEventsResponse,
  BaseEvent,
} from '@openclaw-evolution/shared-types';
import { createEventId, EventType as EvEventType } from '@openclaw-evolution/shared-types';

// =============================================================================
// Event Bridge Configuration
// =============================================================================

export interface EventBridgeConfig {
  serviceUrl: string;
  batchSize?: number;
  batchTimeout?: number;
  maxRetries?: number;
}

// =============================================================================
// Event Bridge
// =============================================================================

export interface EventBridgeStats {
  totalEvents: number;
  sentEvents: number;
  failedEvents: number;
  pendingEvents: number;
}

export class EventBridge {
  private config: Required<EventBridgeConfig>;
  private eventBuffer: any[] = [];
  private batchTimer?: NodeJS.Timeout;
  private sessionId?: string;
  private stats: EventBridgeStats = {
    totalEvents: 0,
    sentEvents: 0,
    failedEvents: 0,
    pendingEvents: 0,
  };
  private flushPromise?: Promise<void>;

  constructor(config: EventBridgeConfig) {
    this.config = {
      serviceUrl: config.serviceUrl,
      batchSize: config.batchSize ?? 50,
      batchTimeout: config.batchTimeout ?? 5000,
      maxRetries: config.maxRetries ?? 3,
    };
  }

  /**
   * Set the current session ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string | undefined {
    return this.sessionId;
  }

  /**
   * Ingest a single event
   */
  async ingestEvent(event: any): Promise<void> {
    if (!this.sessionId) {
      throw new Error('Session ID not set. Call setSessionId() first.');
    }

    // Ensure event has session ID
    const normalizedEvent = {
      ...event,
      sessionId: this.sessionId,
    };

    this.eventBuffer.push(normalizedEvent);
    this.stats.totalEvents++;
    this.stats.pendingEvents++;

    // Check if we should flush the buffer
    if (this.eventBuffer.length >= this.config.batchSize) {
      await this.flush();
    } else {
      this.scheduleBatchFlush();
    }
  }

  /**
   * Ingest multiple events at once
   */
  async ingestEvents(events: any[]): Promise<void> {
    for (const event of events) {
      await this.ingestEvent(event);
    }
  }

  /**
   * Flush all pending events immediately
   */
  async flush(): Promise<void> {
    // If there's already a flush in progress, wait for it
    if (this.flushPromise) {
      return this.flushPromise;
    }

    // Clear any scheduled flush
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    // If no events to flush, return immediately
    if (this.eventBuffer.length === 0) {
      return;
    }

    this.flushPromise = this.doFlush();

    try {
      await this.flushPromise;
    } finally {
      this.flushPromise = undefined;
    }
  }

  /**
   * Get current statistics
   */
  getStats(): EventBridgeStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics and clear buffer
   */
  reset(): void {
    this.eventBuffer = [];
    this.stats = {
      totalEvents: 0,
      sentEvents: 0,
      failedEvents: 0,
      pendingEvents: 0,
    };

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }
  }

  /**
   * Shutdown the event bridge gracefully
   */
  async shutdown(): Promise<void> {
    await this.flush();
    this.reset();
  }

  // =============================================================================
  // Private Methods
  // =============================================================================

  /**
   * Schedule a batched flush
   */
  private scheduleBatchFlush(): void {
    if (this.batchTimer) {
      return; // Already scheduled
    }

    this.batchTimer = setTimeout(() => {
      this.flush().catch((error) => {
        console.error('Error in scheduled flush:', error);
      });
    }, this.config.batchTimeout);
  }

  /**
   * Perform the actual flush
   */
  private async doFlush(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const batch = this.eventBuffer.splice(0, this.eventBuffer.length);
    this.stats.pendingEvents -= batch.length;

    try {
      const result = await this.sendBatch(batch);

      if (result.processed > 0) {
        this.stats.sentEvents += result.processed;
      }

      if (result.failed > 0) {
        this.stats.failedEvents += result.failed;

        // Re-add failed events to buffer for retry
        const failedIndices = result.errors?.map((e: { eventId: string }) =>
          batch.findIndex((evt) => evt.id === e.eventId)
        );

        if (failedIndices) {
          for (const index of failedIndices) {
            if (index >= 0 && index < batch.length) {
              this.eventBuffer.unshift(batch[index]);
              this.stats.pendingEvents++;
            }
          }
        }
      }
    } catch (error) {
      // All events failed - re-add to buffer
      this.eventBuffer.unshift(...batch);
      this.stats.pendingEvents += batch.length;

      console.error('Failed to send event batch:', error);
    }
  }

  /**
   * Send a batch of events to the evolution service
   */
  private async sendBatch(events: any[]): Promise<IngestEventsResponse> {
    const url = `${this.config.serviceUrl}/v1/events`;
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const request: IngestEventsRequest = {
      sessionId: this.sessionId!,
      events,
      batchId,
    };

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as IngestEventsResponse;
        return data;
      } catch (error) {
        if (attempt === this.config.maxRetries - 1) {
          throw error;
        }

        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    // Should never reach here, but TypeScript needs it
    throw new Error('Maximum retry attempts reached');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Event Normalizer
// =============================================================================

export interface RuntimeEvent {
  type: string;
  timestamp?: number;
  data: Record<string, unknown>;
}

export class EventNormalizer {
  /**
   * Normalize a runtime event to an evolution event
   */
  static normalize(runtimeEvent: RuntimeEvent): any {
    const baseEvent: BaseEvent = {
      id: createEventId(),
      type: runtimeEvent.type as EvEventType,
      timestamp: runtimeEvent.timestamp ?? Date.now(),
      sessionId: '', // Will be set by EventBridge
      metadata: {},
    };

    return {
      ...baseEvent,
      data: runtimeEvent.data,
    };
  }

  /**
   * Validate an event has required fields
   */
  static validate(event: any): boolean {
    return !!(
      event.id &&
      event.type &&
      event.timestamp &&
      event.sessionId &&
      event.data
    );
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createEventBridge(config: EventBridgeConfig): EventBridge {
  return new EventBridge(config);
}
