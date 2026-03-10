/**
 * OpenClaw Evolution Console - Types
 *
 * Shared types for the console application.
 */

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
