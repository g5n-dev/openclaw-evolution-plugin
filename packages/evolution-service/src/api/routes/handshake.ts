/**
 * OpenClaw Evolution Service - Handshake Routes
 *
 * Handles runtime handshake and compatibility negotiation.
 */

import { Hono } from 'hono';
import type {
  HandshakeRequest,
  HandshakeResponse,
} from '@openclaw-evolution/shared-types';
import { v4 as uuidv4 } from 'uuid';

export const handshakeRouter = new Hono();

handshakeRouter.post('/handshake', async (c) => {
  try {
    const request = (await c.req.json()) as HandshakeRequest;

    // Validate request
    if (!request.pluginInfo?.name || !request.pluginInfo?.version) {
      return c.json({
        success: false,
        error: 'Invalid plugin info',
      }, 400);
    }

    // Create session
    const sessionId = uuidv4();

    // Determine compatibility level
    const compatibilityLevel = determineCompatibilityLevel(
      request.pluginInfo.minHostVersion,
      request.pluginInfo.capabilities
    );

    // Grant capabilities based on compatibility
    const grantedCapabilities = grantCapabilities(
      request.pluginInfo.capabilities,
      compatibilityLevel
    );

    const response: HandshakeResponse = {
      sessionId,
      hostInfo: {
        version: '2026.3.8',
        capabilities: grantedCapabilities,
      },
      grantedCapabilities,
      compatibility: {
        level: compatibilityLevel.level,
        adapterVersion: compatibilityLevel.adapterVersion,
      },
    };

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Handshake error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Handshake failed',
    }, 500);
  }
});

// =============================================================================
// Helper Functions
// =============================================================================

function determineCompatibilityLevel(
  minVersion: string,
  requestedCapabilities: string[]
): { level: 'full' | 'partial' | 'degraded'; adapterVersion?: string } {
  // For now, assume full compatibility
  // In production, this would check against actual host version
  return {
    level: 'full',
  };
}

function grantCapabilities(
  requestedCapabilities: string[],
  compatibilityLevel: { level: 'full' | 'partial' | 'degraded' }
): string[] {
  // All supported capabilities
  const supportedCapabilities = [
    'event_capture',
    'card_rendering',
    'sidebar_integration',
    'inline_cards',
    'external_cards',
    'avatar_animation',
  ];

  // Filter requested capabilities against supported ones
  const granted = requestedCapabilities.filter((cap) =>
    supportedCapabilities.includes(cap)
  );

  // In degraded mode, limit capabilities
  if (compatibilityLevel.level === 'degraded') {
    return granted.filter((cap) =>
      ['event_capture', 'external_cards'].includes(cap)
    );
  }

  return granted;
}
