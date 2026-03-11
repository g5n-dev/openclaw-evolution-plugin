/**
 * OpenClaw Evolution Plugin - Skill Models
 *
 * Skills are promoted candidates that have been approved.
 * They can be tools, patterns, workflows, rules, or memories.
 */

// =============================================================================
// Skill Types
// =============================================================================

export enum SkillType {
  TOOL = 'tool',
  PATTERN = 'pattern',
  WORKFLOW = 'workflow',
  RULE = 'rule',
  MEMORY = 'memory',
}

export enum SkillStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ROLLBACK = 'rollback',
  PENDING_ROLLOUT = 'pending_rollout',
}

// =============================================================================
// Base Skill
// =============================================================================

export interface BaseSkill {
  skillId: string;
  skillName: string;
  skillType: SkillType;
  version: string;
  status: SkillStatus;
  content: string;
  sourceCandidateId: string;
  sourceCardId: string;
  createdAt: number;
  updatedAt: number;
  metadata?: SkillMetadata;
}

// =============================================================================
// Skill Metadata
// =============================================================================

export interface SkillMetadata {
  author?: string;
  description?: string;
  tags?: string[];
  confidence?: number;
  evaluationScore?: number;
  usageCount?: number;
  lastUsedAt?: number;
  dependencies?: string[];
  deprecatedReason?: string;
  rollbackReason?: string;
  changelog?: SkillChangelogEntry[];
}

export interface SkillChangelogEntry {
  version: string;
  timestamp: number;
  changes: string[];
  author: string;
}

// =============================================================================
// Tool Skill
// =============================================================================

export interface ToolSkill extends BaseSkill {
  skillType: SkillType.TOOL;
  content: string; // JSON stringified tool definition
  metadata?: SkillMetadata & {
    language?: string;
    parameters?: unknown;
    examples?: Array<{ input: unknown; output: unknown }>;
  };
}

// =============================================================================
// Pattern Skill
// =============================================================================

export interface PatternSkill extends BaseSkill {
  skillType: SkillType.PATTERN;
  content: string; // JSON stringified pattern definition
  metadata?: SkillMetadata & {
    applicableContexts?: string[];
    antiPatterns?: string[];
  };
}

// =============================================================================
// Workflow Skill
// =============================================================================

export interface WorkflowSkill extends BaseSkill {
  skillType: SkillType.WORKFLOW;
  content: string; // JSON stringified workflow definition
  metadata?: SkillMetadata & {
    steps?: WorkflowStep[];
    estimatedDuration?: number;
  };
}

export interface WorkflowStep {
  stepId: string;
  action: string;
  parameters?: Record<string, unknown>;
  timeout?: number;
}

// =============================================================================
// Rule Skill
// =============================================================================

export interface RuleSkill extends BaseSkill {
  skillType: SkillType.RULE;
  content: string; // JSON stringified rule definition
  metadata?: SkillMetadata & {
    priority?: number;
    conditions?: string[];
    actions?: string[];
  };
}

// =============================================================================
// Memory Skill
// =============================================================================

export interface MemorySkill extends BaseSkill {
  skillType: SkillType.MEMORY;
  content: string; // JSON stringified memory definition
  metadata?: SkillMetadata & {
    memoryType?: 'semantic' | 'episodic' | 'procedural';
    retrievalCount?: number;
    importance?: 'low' | 'medium' | 'high';
    tags?: string[];
  };
}

// =============================================================================
// Skill Union
// =============================================================================

export type Skill =
  | ToolSkill
  | PatternSkill
  | WorkflowSkill
  | RuleSkill
  | MemorySkill;

// =============================================================================
// Skill Version
// =============================================================================

export interface SkillVersion {
  skillId: string;
  version: string;
  content: string;
  createdAt: number;
  createdBy: string;
  changeReason: string;
}

// =============================================================================
// Skill Filter
// =============================================================================

export interface SkillFilter {
  status?: SkillStatus;
  skillType?: SkillType;
  limit?: number;
  offset?: number;
  search?: string;
}

// =============================================================================
// Skill Promotion
// =============================================================================

export interface SkillPromotion {
  candidateId: string;
  cardId: string;
  skillName: string;
  skillType: SkillType;
  content: string;
  version?: string;
  promotedBy?: string;
  promotionReason?: string;
}

// =============================================================================
// Skill Rollback
// =============================================================================

export interface SkillRollback {
  skillId: string;
  targetVersion?: string;
  reason: string;
  rolledBackBy: string;
  rollbackAt: number;
  preserveVersion?: boolean;
}
