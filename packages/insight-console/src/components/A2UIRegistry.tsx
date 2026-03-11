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
    component: ComponentType<Record<string, unknown>>,
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
  // Note: We're registering HTML element names as strings
  // In a real implementation, you'd register actual React components
  // For now, these are placeholders that demonstrate the registry pattern

  // Register basic UI components
  globalA2UIRegistry.register('div', {
    component: 'div' as unknown as React.ComponentType<Record<string, unknown>>,
    description: 'Generic container element',
  });

  globalA2UIRegistry.register('span', {
    component: 'span' as unknown as React.ComponentType<Record<string, unknown>>,
    description: 'Inline text element',
  });

  globalA2UIRegistry.register('button', {
    component: 'button' as unknown as React.ComponentType<Record<string, unknown>>,
    description: 'Clickable button',
  });

  globalA2UIRegistry.register('text', {
    component: 'span' as unknown as React.ComponentType<Record<string, unknown>>,
    description: 'Text component',
  });
}
