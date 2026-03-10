/**
 * OpenClaw Evolution Service - Insights Routes
 *
 * Handles insights and analytics queries.
 */

import { Hono } from 'hono';
import type {
  DashboardMetrics,
  FunnelMetrics,
  CompatibilityInfo,
} from '@openclaw-evolution/shared-types';

export const insightsRouter = new Hono();

/**
 * Get dashboard metrics
 */
insightsRouter.get('/dashboard', async (c) => {
  try {
    const timeRange = c.req.query('time_range') || 'day';
    const sessionId = c.req.query('session_id');

    // For MVP, return placeholder metrics
    const metrics: DashboardMetrics = {
      totalSessions: 1,
      totalEvents: 100,
      totalCandidates: 5,
      totalEvaluations: 3,
      promotedSkills: 2,
      activeSkills: 2,
      avgEvaluationScore: 0.75,
      eventRate: {
        hourly: 10,
        daily: 100,
      },
    };

    return c.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Dashboard metrics query failed',
    }, 500);
  }
});

/**
 * Get funnel metrics
 */
insightsRouter.get('/funnel', async (c) => {
  try {
    const timeRange = c.req.query('time_range') || 'day';
    const sessionId = c.req.query('session_id');

    // For MVP, return placeholder metrics
    const metrics: FunnelMetrics = {
      eventsCaptured: 100,
      candidatesDetected: 5,
      evaluationsRun: 3,
      cardsPresented: 2,
      skillsPromoted: 1,
      conversionRates: {
        eventToCandidate: 0.05,
        candidateToEvaluation: 0.6,
        evaluationToCard: 0.67,
        cardToPromotion: 0.5,
      },
    };

    return c.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Funnel metrics error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Funnel metrics query failed',
    }, 500);
  }
});

/**
 * Get compatibility information
 */
insightsRouter.get('/compatibility', async (c) => {
  try {
    // For MVP, return placeholder compatibility info
    const info: CompatibilityInfo = {
      hostVersion: '2026.3.8',
      pluginVersion: '0.1.0',
      compatibilityLevel: 'full',
      adapterVersion: undefined,
      supportedFeatures: [
        'event_capture',
        'card_rendering',
        'sidebar_integration',
        'inline_cards',
        'external_cards',
        'avatar_animation',
      ],
      unsupportedFeatures: [],
      degradedModes: [],
    };

    return c.json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.error('Compatibility info error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Compatibility info query failed',
    }, 500);
  }
});
