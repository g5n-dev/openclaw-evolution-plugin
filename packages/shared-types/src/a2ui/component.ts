/**
 * OpenClaw Evolution Plugin - A2UI Component Types
 *
 * A2UI (Agent-to-User Interface) is an open standard for safe, cross-platform UI generation.
 *
 * Based on Google A2UI specification v0.8
 * Reference: https://github.com/google/a2ui
 */

// =============================================================================
// A2UI Component
// =============================================================================

/**
 * Core A2UI component interface
 * Components are declarative and identified by unique IDs
 */
export interface A2UIComponent {
  /** Unique component identifier */
  id: string;

  /** Component type identifier (maps to registered React components) */
  type: string;

  /** Component properties (passed to React component) */
  props: Record<string, unknown>;

  /** Child component IDs (creates component tree) */
  children?: string[];

  /** Optional styling overrides */
  style?: A2UIStyleConfig;

  /** Accessibility attributes */
  a11y?: A2UIAccessibility;
}

// =============================================================================
// A2UI Style Configuration
// =============================================================================

export interface A2UIStyleConfig {
  /** CSS class names */
  className?: string;

  /** Inline styles */
  style?: Record<string, string>;

  /** Theme variant */
  variant?: 'light' | 'dark' | 'adaptive';

  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// =============================================================================
// A2UI Accessibility
// =============================================================================

export interface A2UIAccessibility {
  /** Accessible label */
  label?: string;

  /** ARIA role */
  role?: string;

  /** Accessibility description */
  description?: string;

  /** Keyboard navigation hint */
  keyHint?: string;
}

// =============================================================================
// A2UI Response
// =============================================================================

/**
 * A2UI response format
 * Represents a complete UI tree with component references
 */
export interface A2UIResponse {
  /** A2UI version (for compatibility) */
  version: string;

  /** All components in the UI tree */
  components: A2UIComponent[];

  /** Root component ID (entry point) */
  rootId: string;

  /** Optional metadata about the UI */
  metadata?: {
    /** UI generation timestamp */
    createdAt?: number;

    /** Theme information */
    theme?: A2UITheme;

    /** Layout information */
    layout?: A2UILayout;
  };
}

// =============================================================================
// A2UI Theme
// =============================================================================

export type A2UITheme = 'material' | 'adaptive' | 'dynamic' | 'custom';

export interface A2UIThemeConfig {
  type: A2UITheme;

  /** Color palette */
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    text?: string;
  };

  /** Typography */
  typography?: {
    fontFamily?: string;
    fontSize?: Record<string, string>;
  };

  /** Spacing scale */
  spacing?: Record<string, string>;
}

// =============================================================================
// A2UI Layout
// =============================================================================

export type A2UILayout = 'vertical' | 'horizontal' | 'grid' | 'absolute' | 'custom';

export interface A2UILayoutConfig {
  type: A2UILayout;

  /** Grid layout config */
  grid?: {
    columns: number;
    gap: string;
  };

  /** Flex layout config */
  flex?: {
    direction: 'row' | 'column';
    gap: string;
    justify?: 'start' | 'center' | 'end' | 'space-between';
    align?: 'start' | 'center' | 'end' | 'stretch';
  };
}

// =============================================================================
// A2UI Component Registry
// =============================================================================

/**
 * Component registry interface
 * Maps A2UI component types to React components
 */
export interface A2UIComponentRegistry {
  /**
   * Register a React component for an A2UI type
   */
  register(type: string, component: A2UIRegisteredComponent): void;

  /**
   * Get registered component by type
   */
  get(type: string): A2UIRegisteredComponent | undefined;

  /**
   * Get all registered component types
   */
  getAvailableTypes(): string[];

  /**
   * Check if a type is registered
   */
  has(type: string): boolean;

  /**
   * Unregister a component type
   */
  unregister(type: string): void;
}

/**
 * Registered component definition
 */
export interface A2UIRegisteredComponent {
  /** React component */
  component: ComponentType;

  /** Optional props validator */
  validateProps?: (props: Record<string, unknown>) => boolean;

  /** Default props */
  defaultProps?: Record<string, unknown>;

  /** Component description (for debugging) */
  description?: string;
}

/**
 * Generic component type (avoid React dependency in shared-types)
 */
export type ComponentType<T = unknown> = (props: T) => unknown;

// =============================================================================
// A2UI Update
// =============================================================================

/**
 * Incremental update for A2UI (key feature)
 * Allows updating individual components without re-rendering entire tree
 */
export interface A2UIUpdate {
  /** Component ID to update */
  id: string;

  /** New props (partial update) */
  props?: Record<string, unknown>;

  /** New children */
  children?: string[];

  /** Update operation */
  operation?: 'replace' | 'merge' | 'delete';
}

/**
 * Batch update for multiple components
 */
export interface A2UIBatchUpdate {
  /** Updates to apply */
  updates: A2UIUpdate[];

  /** Update timestamp */
  timestamp: number;

  /** Optional transition animation */
  transition?: {
    duration: number;
    easing: string;
  };
}

// =============================================================================
// A2UI Utilities
// =============================================================================

/**
 * Validate A2UI response structure
 */
export function validateA2UIResponse(response: unknown): response is A2UIResponse {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  const r = response as Record<string, unknown>;

  return (
    typeof r.version === 'string' &&
    Array.isArray(r.components) &&
    typeof r.rootId === 'string' &&
    r.components.every((c: unknown) => {
      if (typeof c !== 'object' || c === null) return false;
      const comp = c as Record<string, unknown>;
      return (
        typeof comp.id === 'string' &&
        typeof comp.type === 'string' &&
        typeof comp.props === 'object'
      );
    })
  );
}

/**
 * Find component by ID in A2UI response
 */
export function findComponentById(
  response: A2UIResponse,
  id: string
): A2UIComponent | undefined {
  return response.components.find((c) => c.id === id);
}

/**
 * Get component tree as flat list (in order)
 */
export function getComponentTree(
  response: A2UIResponse,
  rootId?: string
): A2UIComponent[] {
  const rootIdToUse = rootId ?? response.rootId;
  const root = findComponentById(response, rootIdToUse);

  if (!root) {
    return [];
  }

  const result: A2UIComponent[] = [root];
  const queue = [...(root.children ?? [])];

  while (queue.length > 0) {
    const childId = queue.shift();
    if (childId === undefined) continue;

    const child = findComponentById(response, childId);

    if (child) {
      result.push(child);
      queue.push(...(child.children ?? []));
    }
  }

  return result;
}
