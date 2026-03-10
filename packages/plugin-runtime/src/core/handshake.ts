/**
 * OpenClaw Evolution Plugin - Handshake Manager
 *
 * Manages the handshake protocol with the OpenClaw runtime.
 * Handles compatibility negotiation and session establishment.
 */

import type {
  HandshakeRequest,
  HandshakeResponse,
} from '@openclaw-evolution/shared-types';

// =============================================================================
// Plugin Info Configuration
// =============================================================================

export const PLUGIN_INFO = {
  name: '@openclaw-evolution/plugin-runtime',
  version: '0.1.0',
  minHostVersion: '2026.3.0',
  capabilities: [
    'event_capture',
    'card_rendering',
    'sidebar_integration',
    'inline_cards',
    'external_cards',
  ] as const,
};

// =============================================================================
// Handshake Manager
// =============================================================================

export interface HandshakeManagerConfig {
  serviceUrl: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface HandshakeResult {
  success: boolean;
  sessionId?: string;
  hostInfo?: HandshakeResponse['hostInfo'];
  grantedCapabilities?: string[];
  compatibility?: HandshakeResponse['compatibility'];
  error?: string;
}

export class HandshakeManager {
  private config: HandshakeManagerConfig;
  private handshakeResult?: HandshakeResult;

  constructor(config: HandshakeManagerConfig) {
    this.config = {
      timeout: 5000,
      retryAttempts: 3,
      ...config,
    };
  }

  /**
   * Perform handshake with the evolution service
   */
  async performHandshake(_runtimeInfo?: {
    version: string;
    capabilities: string[];
  }): Promise<HandshakeResult> {
    try {
      const request: HandshakeRequest = {
        pluginInfo: {
          name: PLUGIN_INFO.name,
          version: PLUGIN_INFO.version,
          minHostVersion: PLUGIN_INFO.minHostVersion,
          capabilities: [...PLUGIN_INFO.capabilities],
        },
      };

      // Send handshake to evolution service
      const response = await this.sendHandshakeRequest(request);

      if (response.success && response.data) {
        this.handshakeResult = {
          success: true,
          sessionId: response.data.sessionId,
          hostInfo: response.data.hostInfo,
          grantedCapabilities: response.data.grantedCapabilities,
          compatibility: response.data.compatibility,
        };

        return this.handshakeResult;
      }

      return {
        success: false,
        error: response.error || 'Handshake failed',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown handshake error',
      };
    }
  }

  /**
   * Check if a capability is granted
   */
  hasCapability(capability: string): boolean {
    return (
      this.handshakeResult?.grantedCapabilities?.includes(capability) ?? false
    );
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string | undefined {
    return this.handshakeResult?.sessionId;
  }

  /**
   * Get compatibility level
   */
  getCompatibilityLevel(): 'full' | 'partial' | 'degraded' | undefined {
    return this.handshakeResult?.compatibility?.level;
  }

  /**
   * Check if running in degraded mode
   */
  isDegradedMode(): boolean {
    return this.getCompatibilityLevel() === 'degraded';
  }

  /**
   * Get handshake result
   */
  getHandshakeResult(): HandshakeResult | undefined {
    return this.handshakeResult;
  }

  /**
   * Reset handshake state
   */
  reset(): void {
    this.handshakeResult = undefined;
  }

  // =============================================================================
  // Private Methods
  // =============================================================================

  /**
   * Send handshake request to evolution service
   */
  private async sendHandshakeRequest(
    request: HandshakeRequest
  ): Promise<{ success: boolean; data?: HandshakeResponse; error?: string }> {
    const url = `${this.config.serviceUrl}/v1/runtime/handshake`;

    for (let attempt = 0; attempt < this.config.retryAttempts!; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout
        );

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as HandshakeResponse;
        return { success: true, data };
      } catch (error) {
        if (attempt === this.config.retryAttempts! - 1) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Handshake request failed',
          };
        }

        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    return {
      success: false,
      error: 'Maximum retry attempts reached',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createHandshakeManager(
  config: HandshakeManagerConfig
): HandshakeManager {
  return new HandshakeManager(config);
}
