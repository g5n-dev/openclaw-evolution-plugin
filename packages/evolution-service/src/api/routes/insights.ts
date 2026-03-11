/**
 * OpenClaw Evolution Service - Insights Routes
 *
 * Handles insights and analytics queries.
 */

import { Hono } from 'hono';
import type { CompatibilityInfo } from '@openclaw-evolution/shared-types';
import { getInsightsStore } from '../../storage/insights-store';

export const insightsRouter = new Hono();

/**
 * Get dashboard metrics
 */
insightsRouter.get('/dashboard', async (c) => {
  try {
    const timeRange = c.req.query('time_range') || '24h';
    const sessionId = c.req.query('session_id');

    const insightsStore = getInsightsStore();
    const metrics = insightsStore.getDashboardMetrics({
      timeRange: insightsStore.parseTimeRange(timeRange),
      sessionId,
    });

    return c.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Dashboard metrics query failed',
      },
      500
    );
  }
});

/**
 * Get funnel metrics
 */
insightsRouter.get('/funnel', async (c) => {
  try {
    const timeRange = c.req.query('time_range') || '24h';
    const sessionId = c.req.query('session_id');

    const insightsStore = getInsightsStore();
    const metrics = insightsStore.getFunnelMetrics({
      timeRange: insightsStore.parseTimeRange(timeRange),
      sessionId,
    });

    return c.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Funnel metrics error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Funnel metrics query failed',
      },
      500
    );
  }
});

/**
 * Get skill analysis
 */
insightsRouter.get('/skills', async (c) => {
  try {
    const timeRange = c.req.query('time_range') || '7d';

    const insightsStore = getInsightsStore();
    const analysis = insightsStore.getSkillAnalysis({
      timeRange: insightsStore.parseTimeRange(timeRange),
    });

    return c.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Skill analysis error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Skill analysis query failed',
      },
      500
    );
  }
});

/**
 * Get compatibility information
 */
insightsRouter.get('/compatibility', async (c) => {
  try {
    // For MVP, return placeholder compatibility info
    // This would be enhanced with real compatibility detection in the future
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
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Compatibility info query failed',
      },
      500
    );
  }
});
