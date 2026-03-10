/**
 * OpenClaw Evolution Plugin - Event Types
 *
 * This module defines all event types used throughout the evolution system.
 * Events are the core mechanism for capturing runtime behavior and triggering evolution.
 */

// =============================================================================
// Core Event Types
// =============================================================================

export enum EventType {
  // Runtime Events
  USER_MESSAGE = 'user_message',
  ASSISTANT_RESPONSE = 'assistant_response',
  TOOL_CALL = 'tool_call',
  TOOL_RESULT = 'tool_result',
  SESSION_END = 'session_end',

  // Feedback Events
  FEEDBACK = 'feedback',
  CORRECTION = 'correction',

  // Evolution Events
  CANDIDATE_DETECTED = 'candidate_detected',
  EVALUATION_STARTED = 'evaluation_started',
  EVALUATION_PASSED = 'evaluation_passed',
  EVALUATION_FAILED = 'evaluation_failed',
  SKILL_PROMOTED = 'skill_promoted',
  SKILL_ROLLED_BACK = 'skill_rolled_back',
  MEMORY_SAVED = 'memory_saved',

  // Card Events
  CARD_PRESENTED = 'card_presented',
  CARD_DECISION = 'card_decision',

  // Visual/Avatar Events
  AVATAR_INITIALIZED = 'avatar_initialized',
  AVATAR_STAGE_CHANGED = 'avatar_stage_changed',
  ANIMATION_TRIGGERED = 'animation_triggered',
  MUTATION_APPLIED = 'mutation_applied',
  REPLAY_EVENT_LOGGED = 'replay_event_logged',
}

export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: number;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Runtime Events
// =============================================================================

export interface UserMessageEvent extends BaseEvent {
  type: EventType.USER_MESSAGE;
  data: {
    content: string;
    userId?: string;
    messageId: string;
  };
}

export interface AssistantResponseEvent extends BaseEvent {
  type: EventType.ASSISTANT_RESPONSE;
  data: {
    content: string;
    messageId: string;
    model: string;
    tokensUsed?: number;
  };
}

export interface ToolCallEvent extends BaseEvent {
  type: EventType.TOOL_CALL;
  data: {
    toolName: string;
    toolId: string;
    parameters: Record<string, unknown>;
    messageId: string;
  };
}

export interface ToolResultEvent extends BaseEvent {
  type: EventType.TOOL_RESULT;
  data: {
    toolId: string;
    success: boolean;
    result?: unknown;
    error?: string;
    duration?: number;
  };
}

export interface SessionEndEvent extends BaseEvent {
  type: EventType.SESSION_END;
  data: {
    reason: 'user_closed' | 'timeout' | 'error';
    duration: number;
    messageCount: number;
  };
}

// =============================================================================
// Feedback Events
// =============================================================================

export interface FeedbackEvent extends BaseEvent {
  type: EventType.FEEDBACK;
  data: {
    targetId: string;
    targetType: 'message' | 'tool_call' | 'response';
    feedback: 'positive' | 'negative' | 'neutral';
    comment?: string;
    userId?: string;
  };
}

export interface CorrectionEvent extends BaseEvent {
  type: EventType.CORRECTION;
  data: {
    originalContent: string;
    correctedContent: string;
    messageId: string;
    userId?: string;
  };
}

// =============================================================================
// Evolution Events
// =============================================================================

export interface CandidateDetectedEvent extends BaseEvent {
  type: EventType.CANDIDATE_DETECTED;
  data: {
    candidateId: string;
    candidateType: 'skill' | 'rule' | 'memory';
    sourceEvent: string;
    confidence: number;
    description: string;
    content: string;
  };
}

export interface EvaluationStartedEvent extends BaseEvent {
  type: EventType.EVALUATION_STARTED;
  data: {
    evaluationId: string;
    candidateId: string;
    evaluationType: 'automated' | 'manual' | 'distributed';
  };
}

export interface EvaluationPassedEvent extends BaseEvent {
  type: EventType.EVALUATION_PASSED;
  data: {
    evaluationId: string;
    candidateId: string;
    score: number;
    metrics: Record<string, number>;
  };
}

export interface EvaluationFailedEvent extends BaseEvent {
  type: EventType.EVALUATION_FAILED;
  data: {
    evaluationId: string;
    candidateId: string;
    reason: string;
    score?: number;
  };
}

export interface SkillPromotedEvent extends BaseEvent {
  type: EventType.SKILL_PROMOTED;
  data: {
    skillId: string;
    skillName: string;
    skillType: 'tool' | 'pattern' | 'workflow';
    version: string;
  };
}

export interface SkillRolledBackEvent extends BaseEvent {
  type: EventType.SKILL_ROLLED_BACK;
  data: {
    skillId: string;
    previousVersion?: string;
    reason: string;
  };
}

export interface MemorySavedEvent extends BaseEvent {
  type: EventType.MEMORY_SAVED;
  data: {
    memoryId: string;
    memoryType: 'semantic' | 'episodic' | 'procedural';
    content: string;
    tags?: string[];
  };
}

// =============================================================================
// Card Events
// =============================================================================

export interface CardPresentedEvent extends BaseEvent {
  type: EventType.CARD_PRESENTED;
  data: {
    cardId: string;
    cardType: string;
    candidateId: string;
    sessionId: string;
    title: string;
    description: string;
  };
}

export interface CardDecisionEvent extends BaseEvent {
  type: EventType.CARD_DECISION;
  data: {
    cardId: string;
    decision: 'approve' | 'reject' | 'defer';
    userId?: string;
    comment?: string;
  };
}

// =============================================================================
// Visual/Avatar Events
// =============================================================================

export interface AvatarInitializedEvent extends BaseEvent {
  type: EventType.AVATAR_INITIALIZED;
  data: {
    avatarId: string;
    initialStage: AvatarStage;
    config: AvatarConfig;
  };
}

export interface AvatarStageChangedEvent extends BaseEvent {
  type: EventType.AVATAR_STAGE_CHANGED;
  data: {
    avatarId: string;
    fromStage: AvatarStage;
    toStage: AvatarStage;
    trigger: string;
  };
}

export interface AnimationTriggeredEvent extends BaseEvent {
  type: EventType.ANIMATION_TRIGGERED;
  data: {
    avatarId: string;
    animationType: AnimationType;
    intensity: AnimationIntensity;
    duration: number;
  };
}

export interface MutationAppliedEvent extends BaseEvent {
  type: EventType.MUTATION_APPLIED;
  data: {
    avatarId: string;
    mutations: MutationType[];
    reason: string;
  };
}

export interface ReplayEventLoggedEvent extends BaseEvent {
  type: EventType.REPLAY_EVENT_LOGGED;
  data: {
    eventId: string;
    replayUrl?: string;
    timestamp: number;
  };
}

// =============================================================================
// Avatar Types
// =============================================================================

export enum AvatarStage {
  BASE = 'base',
  AWAKENED = 'awakened',
  LEARNED = 'learned',
  EVOLVED = 'evolved',
}

export enum AnimationType {
  PULSE = 'pulse',
  EVALUATING = 'evaluating',
  ACTIVATION = 'activation',
  MUTATION = 'mutation',
  CELEBRATION = 'celebration',
  ERROR = 'error',
}

export enum AnimationIntensity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export type MutationType =
  | 'shell_glow'
  | 'node_expand'
  | 'badge_attach'
  | 'color_shift'
  | 'particle_emit'
  | 'geometry_transform';

export interface AvatarConfig {
  baseColor: string;
  size: number;
  position: [number, number, number];
  animationEnabled: boolean;
  quality: 'low' | 'medium' | 'high';
}

// =============================================================================
// Event Union
// =============================================================================

export type Event =
  | UserMessageEvent
  | AssistantResponseEvent
  | ToolCallEvent
  | ToolResultEvent
  | SessionEndEvent
  | FeedbackEvent
  | CorrectionEvent
  | CandidateDetectedEvent
  | EvaluationStartedEvent
  | EvaluationPassedEvent
  | EvaluationFailedEvent
  | SkillPromotedEvent
  | SkillRolledBackEvent
  | MemorySavedEvent
  | CardPresentedEvent
  | CardDecisionEvent
  | AvatarInitializedEvent
  | AvatarStageChangedEvent
  | AnimationTriggeredEvent
  | MutationAppliedEvent
  | ReplayEventLoggedEvent;

// =============================================================================
// Event Helpers
// =============================================================================

export function isEventType<T extends Event>(
  event: Event,
  type: EventType
): event is T {
  return event.type === type;
}

export function createEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// Runtime Event (for plugin input)
// =============================================================================

export interface RuntimeEvent {
  type: string;
  timestamp?: number;
  data: Record<string, unknown>;
}
