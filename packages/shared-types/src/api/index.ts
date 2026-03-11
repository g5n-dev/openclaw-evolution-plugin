/**
 * OpenClaw Evolution Plugin - API Types
 *
 * This module defines all API request and response types used
 * for communication between the plugin runtime and evolution service.
 */

import { Event } from '../events';

// =============================================================================
// Common API Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// Runtime API
// =============================================================================

export interface HandshakeRequest {
  pluginInfo: {
    name: string;
    version: string;
    minHostVersion: string;
    capabilities: string[];
  };
}

export interface HandshakeResponse {
  sessionId: string;
  hostInfo: {
    version: string;
    capabilities: string[];
  };
  grantedCapabilities: string[];
  compatibility: {
    level: 'full' | 'partial' | 'degraded';
    adapterVersion?: string;
  };
}

// =============================================================================
// Events API
// =============================================================================

export interface IngestEventsRequest {
  sessionId: string;
  events: Event[];
  batchId?: string;
}

export interface IngestEventsResponse {
  processed: number;
  failed: number;
  errors?: Array<{
    eventId: string;
    error: string;
  }>;
}

// =============================================================================
// Candidates API
// =============================================================================

export interface CreateCandidateRequest {
  sessionId: string;
  candidateType: 'skill' | 'rule' | 'memory';
  sourceEvent: string;
  content: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface CandidateResponse {
  candidateId: string;
  sessionId: string;
  candidateType: string;
  status: 'pending' | 'evaluating' | 'approved' | 'rejected';
  content: string;
  description: string;
  confidence: number;
  createdAt: number;
  updatedAt: number;
}

export interface ListCandidatesRequest {
  sessionId?: string;
  status?: string;
  candidateType?: string;
  limit?: number;
  offset?: number;
}

// =============================================================================
// Evaluations API
// =============================================================================

export interface RunEvaluationRequest {
  candidateId: string;
  evaluationType: 'automated' | 'manual' | 'distributed';
  testCases?: string[];
  context?: Record<string, unknown>;
}

export interface RunEvaluationResponse {
  evaluationId: string;
  candidateId: string;
  status: 'running' | 'passed' | 'failed';
  startedAt: number;
  completedAt?: number;
  score?: number;
  metrics?: Record<string, number>;
}

export interface GetEvaluationRequest {
  evaluationId: string;
}

export interface EvaluationResponse {
  evaluationId: string;
  candidateId: string;
  status: 'running' | 'passed' | 'failed';
  evaluationType: string;
  startedAt: number;
  completedAt?: number;
  score?: number;
  metrics?: Record<string, number>;
  results?: Array<{
    testCase: string;
    passed: boolean;
    output?: unknown;
    error?: string;
  }>;
}

// =============================================================================
// Cards API
// =============================================================================

export interface ListCardsRequest {
  sessionId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'deferred';
  limit?: number;
  offset?: number;
}

export interface CardResponse {
  cardId: string;
  sessionId: string;
  candidateId: string;
  cardType: string;
  title: string;
  description: string;
  content: Record<string, unknown>;
  status: string;
  createdAt: number;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
}

export interface CardDecisionRequest {
  decision: 'approve' | 'reject' | 'defer';
  comment?: string;
}

export interface CardDecisionResponse {
  cardId: string;
  decision: string;
  processedAt: number;
  nextSteps?: string[];
}

// =============================================================================
// Skills API
// =============================================================================

export interface PromoteSkillRequest {
  candidateId: string;
  cardId: string;
  skillName: string;
  skillType: 'tool' | 'pattern' | 'workflow';
  version: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface PromoteSkillResponse {
  skillId: string;
  version: string;
  status: 'active' | 'pending_rollout';
  registeredAt: number;
}

export interface RollbackSkillRequest {
  skillId: string;
  reason: string;
  previousVersion?: string;
}

export interface RollbackSkillResponse {
  skillId: string;
  previousVersion?: string;
  rolledBackAt: number;
}

export interface ListSkillsRequest {
  status?: 'active' | 'deprecated' | 'rollback';
  skillType?: string;
  limit?: number;
  offset?: number;
}

export interface SkillResponse {
  skillId: string;
  skillName: string;
  skillType: string;
  version: string;
  status: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

// =============================================================================
// Insights API
// =============================================================================

export interface DashboardMetrics {
  totalSessions: number;
  totalEvents: number;
  totalCandidates: number;
  totalEvaluations: number;
  promotedSkills: number;
  activeSkills: number;
  avgEvaluationScore: number;
  eventRate: {
    hourly: number;
    daily: number;
  };
}

export interface FunnelMetrics {
  eventsCaptured: number;
  candidatesDetected: number;
  evaluationsRun: number;
  cardsPresented: number;
  skillsPromoted: number;
  conversionRates: {
    eventToCandidate: number;
    candidateToEvaluation: number;
    evaluationToCard: number;
    cardToPromotion: number;
  };
}

export interface SkillAnalysis {
  totalSkills: number;
  activeSkills: number;
  skillsByType: Record<string, number>;
  recentlyPromoted: number;
  averageConfidence: number;
  topSkills: Array<{
    skillId: string;
    skillName: string;
    skillType: string;
    usageCount: number;
    confidence: number;
  }>;
  trends: {
    promotionRate: number;
    deprecationRate: number;
    rollbackRate: number;
  };
}

export interface CompatibilityInfo {
  hostVersion: string;
  pluginVersion: string;
  compatibilityLevel: 'full' | 'partial' | 'degraded';
  adapterVersion?: string;
  supportedFeatures: string[];
  unsupportedFeatures: string[];
  degradedModes: Array<{
    feature: string;
    fallback: string;
  }>;
}

export interface GetDashboardRequest {
  timeRange?: 'hour' | 'day' | 'week' | 'month';
  sessionId?: string;
}

export interface GetFunnelRequest {
  timeRange?: 'hour' | 'day' | 'week' | 'month';
  sessionId?: string;
}
