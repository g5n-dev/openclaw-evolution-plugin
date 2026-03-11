/**
 * OpenClaw Evolution Plugin - A2UI Component Registry
 *
 * In-memory A2UI component registry implementation.
 * Maps A2UI component types to React components.
 */

import type {
  A2UIComponentRegistry,
  A2UIRegisteredComponent,
} from '@openclaw-evolution/shared-types';
import type { ComponentType } from 'react';

/**
 * In-memory A2UI component registry
 */
export class InMemoryA2UIRegistry implements A2UIComponentRegistry {
  private components: Map<string, A2UIRegisteredComponent> = new Map();

  register(type: string, component: A2UIRegisteredComponent): void {
    this.components.set(type, component);
  }

  get(type: string): A2UIRegisteredComponent | undefined {
    return this.components.get(type);
  }

  getAvailableTypes(): string[] {
    return Array.from(this.components.keys());
  }

  has(type: string): boolean {
    return this.components.has(type);
  }

  unregister(type: string): void {
    this.components.delete(type);
  }

  /**
   * Register a React component directly
   */
  registerComponent(
    type: string,
    component: ComponentType<any>,
    options?: {
      defaultProps?: Record<string, unknown>;
      description?: string;
    }
  ): void {
    this.register(type, {
      component,
      defaultProps: options?.defaultProps,
      description: options?.description,
    });
  }

  /**
   * Get all registered components
   */
  getAll(): Map<string, A2UIRegisteredComponent> {
    return new Map(this.components);
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear();
  }

  /**
   * Get registry size
   */
  get size(): number {
    return this.components.size;
  }
}

/**
 * Global A2UI registry instance
 */
export const globalA2UIRegistry = new InMemoryA2UIRegistry();

/**
 * Initialize default A2UI components
 */
export function initializeDefaultA2UIComponents(): void {
  // Register basic UI components
  globalA2UIRegistry.registerComponent('div', 'div' as any, {
    description: 'Generic container element',
  });

  globalA2UIRegistry.registerComponent('span', 'span' as any, {
    description: 'Inline text element',
  });

  globalA2UIRegistry.registerComponent('button', 'button' as any, {
    description: 'Clickable button',
  });

  globalA2UIRegistry.registerComponent('text', 'span' as any, {
    description: 'Text component',
  });
}
