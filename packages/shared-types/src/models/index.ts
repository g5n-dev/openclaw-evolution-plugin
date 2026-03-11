/**
 * OpenClaw Evolution Plugin - Data Models
 *
 * Core data models used throughout the evolution system.
 */

export * from './card';
export * from './skill';

// =============================================================================
// Session Model
// =============================================================================

export interface Session {
  sessionId: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'ended' | 'error';
  eventCount: number;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Candidate Model
// =============================================================================

export interface Candidate {
  candidateId: string;
  sessionId: string;
  candidateType: 'skill' | 'rule' | 'memory';
  sourceEventId: string;
  content: string;
  description: string;
  confidence: number;
  status: 'pending' | 'evaluating' | 'approved' | 'rejected';
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Evaluation Model
// =============================================================================

export interface Evaluation {
  evaluationId: string;
  candidateId: string;
  evaluationType: 'automated' | 'manual' | 'distributed';
  status: 'running' | 'passed' | 'failed';
  startedAt: number;
  completedAt?: number;
  score?: number;
  metrics?: Record<string, number>;
  results?: EvaluationResult[];
}

export interface EvaluationResult {
  testCase: string;
  passed: boolean;
  output?: unknown;
  error?: string;
  duration?: number;
}

// =============================================================================
// Skill Registry Model
// =============================================================================

export interface RegisteredSkill {
  skillId: string;
  skillName: string;
  skillType: 'tool' | 'pattern' | 'workflow';
  version: string;
  status: 'active' | 'deprecated' | 'rollback';
  content: string;
  sourceCandidateId: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Trigger Configuration Model
// =============================================================================

export interface TriggerConfig {
  triggerId: string;
  name: string;
  description: string;
  eventType: string;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
  enabled: boolean;
  priority: number;
}

export interface TriggerCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex';
  value: unknown;
}

export interface TriggerAction {
  type: 'extract_candidate' | 'run_evaluation' | 'save_memory';
  config: Record<string, unknown>;
}

// =============================================================================
// Compatibility Profile Model
// =============================================================================

export interface CompatibilityProfile {
  hostVersion: string;
  pluginVersion: string;
  adapterVersion?: string;
  compatibilityLevel: 'full' | 'partial' | 'degraded';
  supportedFeatures: string[];
  unsupportedFeatures: string[];
  eventMappings?: Record<string, string>;
  degradedModes: DegradedMode[];
}

export interface DegradedMode {
  feature: string;
  fallback: string;
  reason: string;
}

// =============================================================================
// Storage Models
// =============================================================================

export interface StoredEvent {
  eventId: string;
  sessionId: string;
  eventType: string;
  eventData: string;
  timestamp: number;
  processed: boolean;
}

export interface StoredCard {
  cardId: string;
  sessionId: string;
  candidateId: string;
  cardType: string;
  cardData: string;
  status: string;
  createdAt: number;
  expiresAt?: number;
}
