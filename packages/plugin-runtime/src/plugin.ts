/**
 * OpenClaw Evolution Plugin - Main Plugin Entry Point
 *
 * This is the main entry point for the OpenClaw Evolution Plugin.
 * It initializes all core components and manages the plugin lifecycle.
 */

import { HandshakeManager, createHandshakeManager } from './core/handshake';
import { EventBridge, createEventBridge, EventNormalizer } from './core/event-bridge';
import {
  CompatibilityManager,
  createCompatibilityManager,
} from './compatibility/manager';
import type { RuntimeEvent } from '@openclaw-evolution/shared-types';
import { EventType } from '@openclaw-evolution/shared-types';

// =============================================================================
// Plugin Configuration
// =============================================================================

export interface PluginConfig {
  serviceUrl: string;
  enableCardRendering?: boolean;
  enableAvatarAnimation?: boolean;
  batchSize?: number;
  batchTimeout?: number;
}

export interface PluginContext {
  runtimeVersion: string;
  sessionId: string;
  capabilities: string[];
  eventBus: {
    on(event: string, handler: (data: unknown) => void): void;
    emit(event: string, data: unknown): void;
  };
}

// =============================================================================
// OpenClaw Evolution Plugin
// =============================================================================

export class OpenClawEvolutionPlugin {
  private config: PluginConfig;
  private context?: PluginContext;
  private handshakeManager?: HandshakeManager;
  private eventBridge?: EventBridge;
  private compatibilityManager?: CompatibilityManager;
  private isInitialized = false;
  private eventHandlers: Map<string, (data: unknown) => void> = new Map();

  constructor(config: PluginConfig = { serviceUrl: 'http://localhost:3001' }) {
    this.config = {
      enableCardRendering: true,
      enableAvatarAnimation: true,
      batchSize: 50,
      batchTimeout: 5000,
      ...config,
    };
  }

  /**
   * Initialize the plugin
   */
  async initialize(context: PluginContext): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Plugin already initialized');
    }

    this.context = context;

    // Initialize compatibility manager first
    this.compatibilityManager = createCompatibilityManager({
      hostVersion: context.runtimeVersion,
    });

    // Check compatibility level
    if (this.compatibilityManager.isDegraded()) {
      console.warn(
        '[OpenClaw Evolution] Running in degraded mode. Some features may be limited.'
      );
    }

    // Initialize handshake manager
    this.handshakeManager = createHandshakeManager({
      serviceUrl: this.config.serviceUrl,
    });

    // Perform handshake
    const handshakeResult = await this.handshakeManager.performHandshake({
      version: context.runtimeVersion,
      capabilities: context.capabilities,
    });

    if (!handshakeResult.success) {
      throw new Error(
        `Handshake failed: ${handshakeResult.error}. Cannot initialize plugin.`
      );
    }

    console.log('[OpenClaw Evolution] Handshake successful', {
      sessionId: handshakeResult.sessionId,
      hostVersion: handshakeResult.hostInfo?.version,
      grantedCapabilities: handshakeResult.grantedCapabilities,
    });

    // Initialize event bridge
    this.eventBridge = createEventBridge({
      serviceUrl: this.config.serviceUrl,
      batchSize: this.config.batchSize,
      batchTimeout: this.config.batchTimeout,
    });

    this.eventBridge.setSessionId(handshakeResult.sessionId!);

    // Register event handlers
    this.registerEventHandlers();

    this.isInitialized = true;

    console.log('[OpenClaw Evolution] Plugin initialized successfully');
  }

  /**
   * Shutdown the plugin
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    // Unregister event handlers
    this.unregisterEventHandlers();

    // Flush any pending events
    if (this.eventBridge) {
      await this.eventBridge.shutdown();
    }

    // Reset state
    this.handshakeManager?.reset();
    this.isInitialized = false;

    console.log('[OpenClaw Evolution] Plugin shutdown complete');
  }

  /**
   * Get plugin status
   */
  getStatus(): {
    initialized: boolean;
    sessionId?: string;
    compatibilityLevel?: string;
    supportedFeatures: string[];
    stats?: {
      totalEvents: number;
      sentEvents: number;
      failedEvents: number;
      pendingEvents: number;
    };
  } {
    return {
      initialized: this.isInitialized,
      sessionId: this.handshakeManager?.getSessionId(),
      compatibilityLevel: this.compatibilityManager?.getCompatibilityLevel(),
      supportedFeatures:
        this.compatibilityManager?.getProfile().supportedFeatures ?? [],
      stats: this.eventBridge?.getStats(),
    };
  }

  /**
   * Get capability report
   */
  getCapabilityReport() {
    return this.compatibilityManager?.getCapabilityReport();
  }

  /**
   * Manually ingest an event
   */
  async ingestEvent(runtimeEvent: RuntimeEvent): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Plugin not initialized');
    }

    // Normalize the event
    const event = EventNormalizer.normalize(runtimeEvent);

    // Map event fields for compatibility
    const mappedEvent = this.compatibilityManager!.mapEvent(event);

    // Send to event bridge
    await this.eventBridge!.ingestEvent(mappedEvent);
  }

  /**
   * Flush pending events
   */
  async flushEvents(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Plugin not initialized');
    }

    await this.eventBridge!.flush();
  }

  // =============================================================================
  // Private Methods
  // =============================================================================

  /**
   * Register event handlers with the runtime
   */
  private registerEventHandlers(): void {
    if (!this.context) {
      return;
    }

    // Subscribe to runtime events
    const eventTypes = [
      EventType.USER_MESSAGE,
      EventType.ASSISTANT_RESPONSE,
      EventType.TOOL_CALL,
      EventType.TOOL_RESULT,
      EventType.SESSION_END,
    ];

    for (const eventType of eventTypes) {
      const _handler = (data: unknown) => {
        this.handleRuntimeEvent(eventType, data).catch((error) => {
          console.error(
            `[OpenClaw Evolution] Error handling ${eventType}:`,
            error
          );
        });
      };

      this.context.eventBus.on(eventType, _handler);
      this.eventHandlers.set(eventType, _handler);
    }

    console.log(
      `[OpenClaw Evolution] Registered ${eventTypes.length} event handlers`
    );
  }

  /**
   * Unregister event handlers
   */
  private unregisterEventHandlers(): void {
    if (!this.context) {
      return;
    }

    for (const [eventType] of this.eventHandlers.entries()) {
      // Note: In real implementation, you'd call eventBus.off()
      // For now, just clear our tracking
      this.eventHandlers.delete(eventType);
    }
  }

  /**
   * Handle a runtime event
   */
  private async handleRuntimeEvent(
    eventType: EventType,
    data: unknown
  ): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    const runtimeEvent: RuntimeEvent = {
      type: eventType,
      timestamp: Date.now(),
      data: data as Record<string, unknown>,
    };

    await this.ingestEvent(runtimeEvent);
  }
}

// =============================================================================
// Plugin Factory (for OpenClaw runtime)
// =============================================================================

let pluginInstance: OpenClawEvolutionPlugin | undefined;

/**
 * Create or get the plugin instance
 */
export function createPlugin(config?: PluginConfig): OpenClawEvolutionPlugin {
  if (!pluginInstance) {
    pluginInstance = new OpenClawEvolutionPlugin(config);
  }
  return pluginInstance;
}

/**
 * Initialize the plugin (called by OpenClaw runtime)
 */
export async function initialize(
  context: PluginContext,
  config?: PluginConfig
): Promise<void> {
  const plugin = createPlugin(config);
  await plugin.initialize(context);
}

/**
 * Shutdown the plugin (called by OpenClaw runtime)
 */
export async function shutdown(): Promise<void> {
  if (pluginInstance) {
    await pluginInstance.shutdown();
    pluginInstance = undefined;
  }
}

// Export for testing
// export { OpenClawEvolutionPlugin };
