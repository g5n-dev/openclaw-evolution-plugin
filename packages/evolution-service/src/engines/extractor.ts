/**
 * OpenClaw Evolution Service - Candidate Extractor
 *
 * Extracts improvement candidates from events.
 */

import type { Event, Candidate } from '@openclaw-evolution/shared-types';
import { getCandidateStore } from '../storage/candidate-store';

// =============================================================================
// Candidate Extractor
// =============================================================================

export interface ExtractorConfig {
  candidateType: 'skill' | 'rule' | 'memory';
  minConfidence?: number;
}

export class CandidateExtractor {
  /**
   * Extract a candidate from an event
   */
  async extractFromEvent(
    sessionId: string,
    event: Event,
    config: ExtractorConfig
  ): Promise<Candidate | null> {
    switch (config.candidateType) {
      case 'skill':
        return this.extractSkill(sessionId, event);
      case 'rule':
        return this.extractRule(sessionId, event);
      case 'memory':
        return this.extractMemory(sessionId, event);
      default:
        return null;
    }
  }

  /**
   * Extract a skill candidate
   */
  private async extractSkill(
    sessionId: string,
    event: Event
  ): Promise<Candidate | null> {
    // Look for tool call patterns
    if (event.type !== 'tool_call' && event.type !== 'tool_result') {
      return null;
    }

    const toolName = (event.data as { toolName?: string }).toolName;
    if (!toolName) {
      return null;
    }

    const candidateStore = getCandidateStore();

    const candidate = candidateStore.createCandidate({
      sessionId,
      candidateType: 'skill',
      sourceEventId: event.id,
      content: this.generateSkillContent(event),
      description: `Detected tool usage pattern: ${toolName}`,
      confidence: 0.6,
      metadata: {
        toolName,
        eventType: event.type,
      },
    });

    return candidate;
  }

  /**
   * Extract a rule candidate
   */
  private async extractRule(
    sessionId: string,
    event: Event
  ): Promise<Candidate | null> {
    // Look for error patterns or corrections
    if (event.type === 'tool_result') {
      const success = (event.data as { success?: boolean }).success;

      if (success === false) {
        const candidateStore = getCandidateStore();

        const candidate = candidateStore.createCandidate({
          sessionId,
          candidateType: 'rule',
          sourceEventId: event.id,
          content: this.generateRuleContent(event),
          description: 'Detected error recovery pattern',
          confidence: 0.5,
          metadata: {
            errorType: 'tool_failure',
          },
        });

        return candidate;
      }
    }

    return null;
  }

  /**
   * Extract a memory candidate
   */
  private async extractMemory(
    sessionId: string,
    event: Event
  ): Promise<Candidate | null> {
    // Extract useful information from assistant responses
    if (event.type === 'assistant_response') {
      const content = (event.data as { content?: string }).content;
      if (!content || content.length < 100) {
        return null;
      }

      const candidateStore = getCandidateStore();

      const candidate = candidateStore.createCandidate({
        sessionId,
        candidateType: 'memory',
        sourceEventId: event.id,
        content: this.generateMemoryContent(event),
        description: 'Potentially useful information from conversation',
        confidence: 0.4,
        metadata: {
          contentLength: content.length,
        },
      });

      return candidate;
    }

    return null;
  }

  /**
   * Generate skill content
   */
  private generateSkillContent(event: Event): string {
    const data = event.data as Record<string, unknown>;

    return JSON.stringify({
      type: 'skill',
      name: `tool_pattern_${data.toolName}`,
      description: `Repeated usage pattern for tool: ${data.toolName}`,
      pattern: {
        toolName: data.toolName,
        typicalParameters: data.parameters,
      },
    }, null, 2);
  }

  /**
   * Generate rule content
   */
  private generateRuleContent(event: Event): string {
    const data = event.data as Record<string, unknown>;

    return JSON.stringify({
      type: 'rule',
      name: 'error_avoidance_rule',
      description: 'Rule to avoid known error conditions',
      condition: {
        toolName: data.toolName,
        parameters: data.parameters,
      },
      action: 'avoid',
    }, null, 2);
  }

  /**
   * Generate memory content
   */
  private generateMemoryContent(event: Event): string {
    const data = event.data as Record<string, unknown>;

    return JSON.stringify({
      type: 'memory',
      content: data.content,
      source: 'assistant_response',
      timestamp: event.timestamp,
    }, null, 2);
  }
}

// =============================================================================
// Factory
// =============================================================================

let candidateExtractorInstance: CandidateExtractor | undefined;

export function getCandidateExtractor(): CandidateExtractor {
  if (!candidateExtractorInstance) {
    candidateExtractorInstance = new CandidateExtractor();
  }
  return candidateExtractorInstance;
}
