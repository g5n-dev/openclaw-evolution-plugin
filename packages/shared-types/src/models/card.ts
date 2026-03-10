/**
 * OpenClaw Evolution Plugin - Card Models
 *
 * Evolution cards are presented to users for decision making.
 * They represent candidate improvements awaiting approval.
 */

// Card models define evolution card types and structures

// =============================================================================
// Card Types
// =============================================================================

export enum CardType {
  SKILL_CANDIDATE = 'skill_candidate',
  RULE_UPDATE = 'rule_update',
  MEMORY_SUGGESTION = 'memory_suggestion',
  EVALUATION_FAILED = 'evaluation_failed',
  EVALUATION_PASSED = 'evaluation_passed',
}

export enum CardStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DEFERRED = 'deferred',
  EXPIRED = 'expired',
}

// =============================================================================
// Base Card
// =============================================================================

export interface BaseCard {
  cardId: string;
  sessionId: string;
  candidateId: string;
  cardType: CardType;
  title: string;
  description: string;
  status: CardStatus;
  content: Record<string, unknown>;
  createdAt: number;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Skill Candidate Card
// =============================================================================

export interface SkillCandidateCard extends BaseCard {
  cardType: CardType.SKILL_CANDIDATE;
  content: {
    skillName: string;
    skillType: 'tool' | 'pattern' | 'workflow';
    description: string;
    code: string;
    language: string;
    confidence: number;
    estimatedImpact: 'low' | 'medium' | 'high';
    useCases: string[];
    risks?: string[];
  };
}

// =============================================================================
// Rule Update Card
// =============================================================================

export interface RuleUpdateCard extends BaseCard {
  cardType: CardType.RULE_UPDATE;
  content: {
    ruleName: string;
    currentRule: string;
    proposedRule: string;
    changeType: 'add' | 'modify' | 'remove';
    reason: string;
    estimatedImpact: 'low' | 'medium' | 'high';
    affectedScenarios: string[];
  };
}

// =============================================================================
// Memory Suggestion Card
// =============================================================================

export interface MemorySuggestionCard extends BaseCard {
  cardType: CardType.MEMORY_SUGGESTION;
  content: {
    memoryType: 'semantic' | 'episodic' | 'procedural';
    content: string;
    tags: string[];
    importance: 'low' | 'medium' | 'high';
    retrievalCount: number;
    confidence: number;
  };
}

// =============================================================================
// Evaluation Failed Card
// =============================================================================

export interface EvaluationFailedCard extends BaseCard {
  cardType: CardType.EVALUATION_FAILED;
  content: {
    candidateId: string;
    failureReason: string;
    failedTests: Array<{
      name: string;
      error: string;
    }>;
    canRetry: boolean;
    suggestions?: string[];
  };
}

// =============================================================================
// Evaluation Passed Card
// =============================================================================

export interface EvaluationPassedCard extends BaseCard {
  cardType: CardType.EVALUATION_PASSED;
  content: {
    candidateId: string;
    score: number;
    passedTests: number;
    totalTests: number;
    metrics: Record<string, number>;
    recommendedAction: 'promote' | 'review' | 'defer';
  };
}

// =============================================================================
// Card Union
// =============================================================================

export type Card =
  | SkillCandidateCard
  | RuleUpdateCard
  | MemorySuggestionCard
  | EvaluationFailedCard
  | EvaluationPassedCard;

// =============================================================================
// Card Rendering Options
// =============================================================================

export interface CardRenderOptions {
  format: 'inline' | 'sidebar' | 'external';
  interactive: boolean;
  showMetadata: boolean;
  showConfidence: boolean;
  allowDefer: boolean;
}

export interface CardRenderResult {
  success: boolean;
  format: string;
  canRender: boolean;
  fallbackAvailable: boolean;
  renderData?: Record<string, unknown>;
}
