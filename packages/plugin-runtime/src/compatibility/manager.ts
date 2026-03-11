/**
 * OpenClaw Evolution Plugin - Compatibility Manager
 *
 * Manages version compatibility with OpenClaw runtime.
 * Handles capability detection, adapter selection, and degraded modes.
 */

import type {
  CompatibilityProfile,
  DegradedMode,
  CardRenderOptions,
} from '@openclaw-evolution/shared-types';

// =============================================================================
// Version Utilities
// =============================================================================

export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
}

export function parseVersion(version: string): SemanticVersion | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);

  if (!match) {
    return null;
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
  };
}

export function compareVersions(
  v1: string,
  v2: string
): 'greater' | 'equal' | 'less' {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);

  if (!parsed1 || !parsed2) {
    throw new Error(`Invalid version format: ${v1} or ${v2}`);
  }

  if (parsed1.major !== parsed2.major) {
    return parsed1.major > parsed2.major ? 'greater' : 'less';
  }

  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor > parsed2.minor ? 'greater' : 'less';
  }

  if (parsed1.patch !== parsed2.patch) {
    return parsed1.patch > parsed2.patch ? 'greater' : 'less';
  }

  return 'equal';
}

export function satisfiesVersion(
  version: string,
  constraint: string
): boolean {
  const parsedVersion = parseVersion(version);
  const parsedConstraint = parseVersion(constraint);

  if (!parsedVersion || !parsedConstraint) {
    return false;
  }

  // Simple >= constraint check
  return (
    parsedVersion.major > parsedConstraint.major ||
    (parsedVersion.major === parsedConstraint.major &&
      parsedVersion.minor > parsedConstraint.minor) ||
    (parsedVersion.major === parsedConstraint.major &&
      parsedVersion.minor === parsedConstraint.minor &&
      parsedVersion.patch >= parsedConstraint.patch)
  );
}

// =============================================================================
// Compatibility Profiles
// =============================================================================

export const COMPATIBILITY_PROFILES: Record<
  string,
  Partial<CompatibilityProfile>
> = {
  '2026.3.0': {
    hostVersion: '2026.3.0',
    compatibilityLevel: 'full',
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
  },
  '2026.3.8': {
    hostVersion: '2026.3.8',
    compatibilityLevel: 'full',
    supportedFeatures: [
      'event_capture',
      'card_rendering',
      'sidebar_integration',
      'inline_cards',
      'external_cards',
      'avatar_animation',
      'advanced_animations',
    ],
    unsupportedFeatures: [],
    degradedModes: [],
  },
};

export const DEFAULT_PROFILE: CompatibilityProfile = {
  hostVersion: 'unknown',
  pluginVersion: '0.1.0',
  compatibilityLevel: 'degraded',
  supportedFeatures: ['event_capture', 'external_cards'],
  unsupportedFeatures: [
    'inline_cards',
    'sidebar_integration',
    'avatar_animation',
  ],
  degradedModes: [
    {
      feature: 'card_rendering',
      fallback: 'external_h5_link',
      reason: 'Unknown host version',
    },
    {
      feature: 'inline_cards',
      fallback: 'console_review',
      reason: 'Inline rendering not supported',
    },
  ],
};

// =============================================================================
// Event Field Mappings
// =============================================================================

export type EventFieldMapping = Record<
  string,
  {
    from?: string;
    transform?: (value: unknown) => unknown;
    default?: unknown;
  }
>;

export const EVENT_MAPPINGS: Record<string, EventFieldMapping> = {
  // For older versions, event field names might differ
  '2026.3.0': {
    'data.messageId': {
      from: 'data.msg_id',
    },
    'data.toolName': {
      from: 'data.tool_name',
    },
  },
};

// =============================================================================
// Compatibility Manager
// =============================================================================

export interface CompatibilityManagerConfig {
  hostVersion: string;
  pluginVersion?: string;
  customProfiles?: Record<string, Partial<CompatibilityProfile>>;
}

export class CompatibilityManager {
  private profile: CompatibilityProfile;
  private hostVersion: string;
  private pluginVersion: string;

  constructor(config: CompatibilityManagerConfig) {
    this.hostVersion = config.hostVersion;
    this.pluginVersion = config.pluginVersion ?? '0.1.0';
    this.profile = this.loadProfile(config.hostVersion, config.customProfiles);
  }

  /**
   * Get the current compatibility profile
   */
  getProfile(): CompatibilityProfile {
    return this.profile;
  }

  /**
   * Get compatibility level
   */
  getCompatibilityLevel(): CompatibilityProfile['compatibilityLevel'] {
    return this.profile.compatibilityLevel;
  }

  /**
   * Check if running in degraded mode
   */
  isDegraded(): boolean {
    return this.profile.compatibilityLevel === 'degraded';
  }

  /**
   * Check if a feature is supported
   */
  isFeatureSupported(feature: string): boolean {
    return this.profile.supportedFeatures.includes(feature);
  }

  /**
   * Get degraded mode for a feature
   */
  getDegradedMode(feature: string): DegradedMode | undefined {
    return this.profile.degradedModes.find((mode) => mode.feature === feature);
  }

  /**
   * Map event fields based on version compatibility
   */
  mapEvent(event: any): any {
    const mappings = EVENT_MAPPINGS[this.hostVersion];

    if (!mappings) {
      return event;
    }

    const mappedEvent = { ...event };

    for (const [targetPath, mapping] of Object.entries(mappings)) {
      const sourcePath = mapping.from ?? targetPath;

      // Get source value
      const sourceValue = this.getNestedValue(event, sourcePath);

      // Transform if needed
      let targetValue = sourceValue;
      if (mapping.transform && sourceValue !== undefined) {
        targetValue = mapping.transform(sourceValue);
      }

      // Use default if undefined
      if (targetValue === undefined && mapping.default !== undefined) {
        targetValue = mapping.default;
      }

      // Set target value
      if (targetValue !== undefined) {
        this.setNestedValue(mappedEvent, targetPath, targetValue);
      }
    }

    return mappedEvent;
  }

  /**
   * Determine card render options based on compatibility
   */
  getCardRenderOptions(): CardRenderOptions {
    const canRenderInline = this.isFeatureSupported('inline_cards');
    const canRenderSidebar = this.isFeatureSupported('sidebar_integration');
    const canRenderExternal = this.isFeatureSupported('external_cards');

    let format: CardRenderOptions['format'];

    if (canRenderInline) {
      format = 'inline';
    } else if (canRenderSidebar) {
      format = 'sidebar';
    } else if (canRenderExternal) {
      format = 'external';
    } else {
      // Last resort
      format = 'external';
    }

    return {
      format,
      interactive: this.isFeatureSupported('card_rendering'),
      showMetadata: true,
      showConfidence: true,
      allowDefer: this.isFeatureSupported('defer_cards'),
    };
  }

  /**
   * Get capability report for Insight Console
   */
  getCapabilityReport(): {
    hostVersion: string;
    pluginVersion: string;
    compatibilityLevel: string;
    supportedFeatures: string[];
    unsupportedFeatures: string[];
    degradedModes: DegradedMode[];
  } {
    return {
      hostVersion: this.hostVersion,
      pluginVersion: this.pluginVersion,
      compatibilityLevel: this.profile.compatibilityLevel,
      supportedFeatures: this.profile.supportedFeatures,
      unsupportedFeatures: this.profile.unsupportedFeatures,
      degradedModes: this.profile.degradedModes,
    };
  }

  // =============================================================================
  // Private Methods
  // =============================================================================

  /**
   * Load compatibility profile for host version
   */
  private loadProfile(
    hostVersion: string,
    customProfiles?: Record<string, Partial<CompatibilityProfile>>
  ): CompatibilityProfile {
    // Check custom profiles first
    if (customProfiles && customProfiles[hostVersion]) {
      return {
        ...DEFAULT_PROFILE,
        ...customProfiles[hostVersion],
        hostVersion,
      };
    }

    // Check built-in profiles
    for (const [version, profile] of Object.entries(COMPATIBILITY_PROFILES)) {
      if (satisfiesVersion(hostVersion, version)) {
        return {
          ...DEFAULT_PROFILE,
          ...profile,
          hostVersion,
        };
      }
    }

    // Fall back to default profile
    return {
      ...DEFAULT_PROFILE,
      hostVersion,
    };
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Set nested value on object using dot notation
   */
  private setNestedValue(obj: unknown, path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    if (!lastKey) {
      throw new Error(`Invalid path: ${path}`);
    }
    let current: Record<string, unknown> = obj as Record<string, unknown>;

    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[lastKey] = value;
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createCompatibilityManager(
  config: CompatibilityManagerConfig
): CompatibilityManager {
  return new CompatibilityManager(config);
}
