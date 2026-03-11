/**
 * OpenClaw Evolution Engine - A2UI Renderer
 *
 * A2UI-compliant renderer for Avatar visualization.
 * Implements declarative, component-based rendering with incremental updates.
 *
 * Based on Google A2UI specification v0.8
 */

import type {
  A2UIComponent,
  A2UIResponse,
  A2UIComponentRegistry,
  A2UIBatchUpdate,
  AvatarStage,
  MutationType,
} from '@openclaw-evolution/shared-types';

// =============================================================================
// A2UI Renderer State
// =============================================================================

export interface A2UIRenderState {
  /** Current avatar stage */
  stage: AvatarStage;

  /** Active mutations */
  mutations: MutationType[];

  /** Animation progress (0-1) */
  animationProgress: number;

  /** Is animation active */
  isAnimating: boolean;

  /** Current time in ms */
  time: number;

  /** A2UI layout (if available) */
  a2uiLayout?: A2UIResponse;
}

export interface A2UIRendererConfig {
  width: number;
  height: number;
  backgroundColor: string;
  registry: A2UIComponentRegistry;
  enableIncrementalUpdates: boolean;
}

// =============================================================================
// A2UI Renderer
// =============================================================================

export class A2UIRenderer {
  private config: A2UIRendererConfig;
  private currentState: A2UIRenderState;
  private animationId?: number;
  private startTime: number;
  private container: HTMLElement | null = null;

  // Cached component references for incremental updates
  private componentCache: Map<string, HTMLElement> = new Map();

  constructor(config: A2UIRendererConfig) {
    this.config = config;
    this.startTime = Date.now();
    this.currentState = {
      stage: 'base',
      mutations: [],
      animationProgress: 0,
      isAnimating: false,
      time: 0,
    };
  }

  /**
   * Initialize renderer with DOM container
   */
  initialize(container: HTMLElement): void {
    this.container = container;

    // Set container styles
    container.style.width = `${this.config.width}px`;
    container.style.height = `${this.config.height}px`;
    container.style.backgroundColor = this.config.backgroundColor;
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    // Initial render
    this.render(this.currentState);
  }

  /**
   * Main render method
   * Renders A2UI component tree to DOM
   */
  render(state: A2UIRenderState): void {
    if (!this.container) {
      console.warn('[A2UIRenderer] Container not initialized');
      return;
    }

    this.currentState = state;

    // If state has A2UI layout, render it
    if (state.a2uiLayout) {
      this.renderA2UI(state.a2uiLayout);
    } else {
      // Fallback to default Avatar visualization
      this.renderDefaultAvatar(state);
    }
  }

  /**
   * Render A2UI component tree
   */
  private renderA2UI(a2ui: A2UIResponse): void {
    if (!this.container) return;

    // Clear container
    this.container.innerHTML = '';

    // Render component tree
    const rootComponent = a2ui.components.find((c) => c.id === a2ui.rootId);
    if (!rootComponent) {
      console.warn(`[A2UIRenderer] Root component ${a2ui.rootId} not found`);
      return;
    }

    const rootElement = this.renderComponent(rootComponent, a2ui.components);
    if (rootElement) {
      this.container.appendChild(rootElement);
    }
  }

  /**
   * Render a single A2UI component
   */
  private renderComponent(
    component: A2UIComponent,
    allComponents: A2UIComponent[],
    parentElement?: HTMLElement
  ): HTMLElement | null {
    // Check cache for incremental updates
    const cachedElement = this.componentCache.get(component.id);

    if (cachedElement && this.config.enableIncrementalUpdates) {
      // Incremental update: merge new props into existing element
      this.updateComponentElement(cachedElement, component);
      return cachedElement;
    }

    // Create new element
    const element = this.createComponentElement(component);

    if (!element) {
      return null;
    }

    // Cache element for future updates
    this.componentCache.set(component.id, element);

    // Render children
    if (component.children && component.children.length > 0) {
      for (const childId of component.children) {
        const childComponent = allComponents.find((c) => c.id === childId);
        if (childComponent) {
          const childElement = this.renderComponent(childComponent, allComponents, element);
          if (childElement) {
            element.appendChild(childElement);
          }
        }
      }
    }

    return element;
  }

  /**
   * Create DOM element for A2UI component
   */
  private createComponentElement(component: A2UIComponent): HTMLElement | null {
    const { type, props, style, a11y } = component;

    // Get registered component from registry
    const registered = this.config.registry.get(type);

    if (!registered) {
      console.warn(`[A2UIRenderer] Component type "${type}" not registered in registry`);
      return this.createFallbackElement(type, props);
    }

    // Create element using registered component
    // Note: This is a simplified implementation
    // In production, you'd use React to render the component
    const element = document.createElement(type === 'text' ? 'span' : 'div');

    // Apply props
    this.applyPropsToElement(element, props);

    // Apply style
    if (style) {
      this.applyStyleToElement(element, style);
    }

    // Apply accessibility
    if (a11y) {
      this.applyAccessibilityToElement(element, a11y);
    }

    return element;
  }

  /**
   * Update existing component element (incremental update)
   */
  private updateComponentElement(element: HTMLElement, component: A2UIComponent): void {
    const { props, style, a11y } = component;

    // Update props
    this.applyPropsToElement(element, props);

    // Update style
    if (style) {
      this.applyStyleToElement(element, style);
    }

    // Update accessibility
    if (a11y) {
      this.applyAccessibilityToElement(element, a11y);
    }
  }

  /**
   * Apply props to DOM element
   */
  private applyPropsToElement(element: HTMLElement, props: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(props)) {
      if (key === 'children') continue; // Children handled separately
      if (key === 'className') {
        element.className = String(value);
      } else if (key === 'text') {
        element.textContent = String(value);
      } else if (key === 'html') {
        element.innerHTML = String(value);
      } else if (typeof value === 'string' || typeof value === 'number') {
        element.setAttribute(key, String(value));
      }
    }
  }

  /**
   * Apply style to DOM element
   */
  private applyStyleToElement(element: HTMLElement, style: A2UIComponent['style']): void {
    if (!style) return;

    if (style.className) {
      element.className = style.className;
    }

    if (style.style) {
      Object.assign(element.style, style.style);
    }
  }

  /**
   * Apply accessibility attributes
   */
  private applyAccessibilityToElement(element: HTMLElement, a11y: A2UIComponent['a11y']): void {
    if (!a11y) return;

    if (a11y.label) {
      element.setAttribute('aria-label', a11y.label);
    }

    if (a11y.role) {
      element.setAttribute('role', a11y.role);
    }

    if (a11y.description) {
      element.setAttribute('aria-describedby', a11y.description);
    }
  }

  /**
   * Create fallback element for unregistered components
   */
  private createFallbackElement(type: string, props: Record<string, unknown>): HTMLElement {
    const element = document.createElement('div');
    element.className = 'a2ui-fallback';
    element.textContent = `[Unregistered: ${type}]`;

    if (props.text) {
      element.textContent = String(props.text);
    }

    return element;
  }

  /**
   * Render default Avatar visualization (fallback)
   */
  private renderDefaultAvatar(state: A2UIRenderState): void {
    if (!this.container) return;

    // Clear container
    this.container.innerHTML = '';

    // Create simple Avatar visualization
    const avatarElement = document.createElement('div');
    avatarElement.className = 'avatar-default';
    avatarElement.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 1rem;
    `;

    // Stage badge
    const stageBadge = document.createElement('div');
    stageBadge.className = 'avatar-stage';
    stageBadge.textContent = state.stage;
    stageBadge.style.cssText = `
      padding: 0.5rem 1rem;
      background: ${this.getStageColor(state.stage)};
      color: white;
      border-radius: 0.5rem;
      font-weight: bold;
      text-transform: capitalize;
    `;

    // Mutations list
    if (state.mutations.length > 0) {
      const mutationsList = document.createElement('div');
      mutationsList.className = 'avatar-mutations';
      mutationsList.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
      `;

      for (const mutation of state.mutations) {
        const mutationTag = document.createElement('span');
        mutationTag.textContent = mutation;
        mutationTag.style.cssText = `
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
          font-size: 0.875rem;
        `;
        mutationsList.appendChild(mutationTag);
      }

      avatarElement.appendChild(mutationsList);
    }

    avatarElement.appendChild(stageBadge);
    this.container.appendChild(avatarElement);
  }

  /**
   * Get stage color
   */
  private getStageColor(stage: AvatarStage): string {
    const colors: Record<AvatarStage, string> = {
      base: '#3B82F6',
      awakened: '#8B5CF6',
      learned: '#A855F7',
      evolved: '#EC4899',
    };
    return colors[stage] || colors.base;
  }

  /**
   * Apply batch update (incremental update)
   */
  applyBatchUpdate(update: A2UIBatchUpdate): void {
    if (!this.config.enableIncrementalUpdates) {
      console.warn('[A2UIRenderer] Incremental updates disabled');
      return;
    }

    for (const item of update.updates) {
      const element = this.componentCache.get(item.id);
      if (!element) continue;

      switch (item.operation) {
        case 'delete':
          element.remove();
          this.componentCache.delete(item.id);
          break;

        case 'replace':
        case 'merge':
          if (item.props) {
            this.applyPropsToElement(element, item.props);
          }
          break;
      }
    }
  }

  /**
   * Start animation loop
   */
  startAnimation(onFrame: (progress: number, time: number) => Partial<A2UIRenderState>): void {
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - this.startTime;

      // Use ease-in-out for progress
      const progress = (Math.sin(elapsed / 1500) + 1) / 2;

      const stateUpdate = onFrame(progress, elapsed);
      this.currentState = { ...this.currentState, ...stateUpdate, time: elapsed };

      this.render(this.currentState);

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  /**
   * Clear component cache
   */
  clearCache(): void {
    this.componentCache.clear();
  }

  /**
   * Dispose renderer
   */
  dispose(): void {
    this.stopAnimation();
    this.clearCache();

    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}

// =============================================================================
// Factory Function
// =============================================================================

export function createA2UIRenderer(config: A2UIRendererConfig): A2UIRenderer {
  return new A2UIRenderer(config);
}
