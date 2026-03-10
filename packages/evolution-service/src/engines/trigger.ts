/**
 * OpenClaw Evolution Service - Trigger Engine
 *
 * Monitors events and triggers actions based on configured rules.
 */

import type { Event, TriggerConfig } from '@openclaw-evolution/shared-types';
import { getCandidateExtractor } from './extractor';

// =============================================================================
// Default Trigger Configuration
// =============================================================================

const DEFAULT_TRIGGERS: TriggerConfig[] = [
  {
    triggerId: 'tool_call_pattern',
    name: 'Tool Call Pattern Detection',
    description: 'Detects repeated tool usage patterns',
    eventType: 'tool_call',
    conditions: [],
    actions: [
      {
        type: 'extract_candidate',
        config: {
          candidateType: 'skill',
        },
      },
    ],
    enabled: true,
    priority: 1,
  },
  {
    triggerId: 'error_recovery',
    name: 'Error Recovery Detection',
    description: 'Detects successful error recovery patterns',
    eventType: 'tool_result',
    conditions: [
      {
        field: 'data.success',
        operator: 'eq',
        value: false,
      },
    ],
    actions: [
      {
        type: 'extract_candidate',
        config: {
          candidateType: 'rule',
        },
      },
    ],
    enabled: true,
    priority: 2,
  },
];

// =============================================================================
// Trigger Engine
// =============================================================================

export class TriggerEngine {
  private triggers: Map<string, TriggerConfig> = new Map();

  constructor() {
    // Initialize with default triggers
    for (const trigger of DEFAULT_TRIGGERS) {
      this.triggers.set(trigger.triggerId, trigger);
    }
  }

  /**
   * Process events and evaluate triggers
   */
  async processEvents(sessionId: string, events: Event[]): Promise<void> {
    for (const event of events) {
      await this.processEvent(sessionId, event);
    }
  }

  /**
   * Process a single event
   */
  async processEvent(sessionId: string, event: Event): Promise<void> {
    // Find matching triggers
    const matchingTriggers = this.findMatchingTriggers(event);

    // Execute trigger actions
    for (const trigger of matchingTriggers) {
      await this.executeTriggerActions(sessionId, event, trigger);
    }
  }

  /**
   * Find triggers that match the event
   */
  private findMatchingTriggers(event: Event): TriggerConfig[] {
    const matching: TriggerConfig[] = [];

    for (const trigger of this.triggers.values()) {
      if (!trigger.enabled) {
        continue;
      }

      // Check event type
      if (trigger.eventType !== event.type) {
        continue;
      }

      // Check conditions
      if (this.evaluateConditions(event, trigger.conditions)) {
        matching.push(trigger);
      }
    }

    // Sort by priority (higher priority first)
    matching.sort((a, b) => b.priority - a.priority);

    return matching;
  }

  /**
   * Evaluate trigger conditions
   */
  private evaluateConditions(
    event: Event,
    conditions: TriggerConfig['conditions']
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    for (const condition of conditions) {
      const fieldValue = this.getFieldValue(event, condition.field);

      let matches = false;

      switch (condition.operator) {
        case 'eq':
          matches = fieldValue === condition.value;
          break;
        case 'ne':
          matches = fieldValue !== condition.value;
          break;
        case 'gt':
          matches = typeof fieldValue === 'number' && fieldValue > (condition.value as number);
          break;
        case 'lt':
          matches = typeof fieldValue === 'number' && fieldValue < (condition.value as number);
          break;
        case 'gte':
          matches = typeof fieldValue === 'number' && fieldValue >= (condition.value as number);
          break;
        case 'lte':
          matches = typeof fieldValue === 'number' && fieldValue <= (condition.value as number);
          break;
        case 'contains':
          matches = typeof fieldValue === 'string' && fieldValue.includes(condition.value as string);
          break;
        case 'regex':
          try {
            const regex = new RegExp(condition.value as string);
            matches = typeof fieldValue === 'string' && regex.test(fieldValue);
          } catch {
            matches = false;
          }
          break;
      }

      if (!matches) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get field value from event
   */
  private getFieldValue(event: Event, field: string): unknown {
    const keys = field.split('.');
    let value: unknown = event;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Execute trigger actions
   */
  private async executeTriggerActions(
    sessionId: string,
    event: Event,
    trigger: TriggerConfig
  ): Promise<void> {
    for (const action of trigger.actions) {
      switch (action.type) {
        case 'extract_candidate':
          await this.extractCandidate(sessionId, event, action.config as Record<string, unknown>);
          break;
        case 'run_evaluation':
          // TODO: Implement evaluation trigger
          break;
        case 'save_memory':
          // TODO: Implement memory save trigger
          break;
      }
    }
  }

  /**
   * Extract a candidate from an event
   */
  private async extractCandidate(
    sessionId: string,
    event: Event,
    config: Record<string, unknown>
  ): Promise<void> {
    const extractor = getCandidateExtractor();
    await extractor.extractFromEvent(sessionId, event, {
      candidateType: config.candidateType as 'skill' | 'rule' | 'memory',
    });
  }

  /**
   * Add a custom trigger
   */
  addTrigger(trigger: TriggerConfig): void {
    this.triggers.set(trigger.triggerId, trigger);
  }

  /**
   * Remove a trigger
   */
  removeTrigger(triggerId: string): void {
    this.triggers.delete(triggerId);
  }

  /**
   * Get all triggers
   */
  getTriggers(): TriggerConfig[] {
    return Array.from(this.triggers.values());
  }
}

// =============================================================================
// Factory
// =============================================================================

let triggerEngineInstance: TriggerEngine | undefined;

export function getTriggerEngine(): TriggerEngine {
  if (!triggerEngineInstance) {
    triggerEngineInstance = new TriggerEngine();
  }
  return triggerEngineInstance;
}
