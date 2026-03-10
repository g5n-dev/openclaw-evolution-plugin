/**
 * OpenClaw Evolution Engine - Simple Renderer
 *
 * Simplified renderer for MVP (without full Three.js dependency).
 */

export interface RendererConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface RenderState {
  stage: string;
  mutations: string[];
  animationProgress: number;
  isAnimating: boolean;
}

export class SimpleRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private config: RendererConfig;
  private animationId?: number;

  constructor(config: RendererConfig) {
    this.config = config;
  }

  /**
   * Initialize canvas
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    if (!this.ctx) {
      throw new Error('Could not get 2D context');
    }
  }

  /**
   * Render avatar
   */
  render(state: RenderState): void {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = this.config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Get stage color
    const stageColors: Record<string, string> = {
      base: '#3b82f6',
      awakened: '#8b5cf6',
      learned: '#a855f7',
      evolved: '#ec4899',
    };

    const baseColor = stageColors[state.stage] || stageColors.base;

    // Draw glow effect
    if (state.mutations.includes('shell_glow')) {
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
      gradient.addColorStop(0, baseColor + '40');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // Draw core sphere
    const coreRadius = 50 + (state.animationProgress || 0) * 10;

    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = baseColor;
    ctx.fill();

    // Draw inner core
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = baseColor + 'cc';
    ctx.fill();

    // Draw nodes based on mutations
    if (state.mutations.includes('node_expand')) {
      const nodeCount = state.stage === 'evolved' ? 8 : state.stage === 'learned' ? 4 : 2;
      const nodeRadius = 80;

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * nodeRadius;
        const y = centerY + Math.sin(angle) * nodeRadius;

        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      }
    }

    // Draw particles
    this.drawParticles(ctx, centerX, centerY, baseColor, state);

    // Draw badge if evolved
    if (state.mutations.includes('badge_attach')) {
      ctx.save();
      ctx.translate(centerX, centerY - 80);
      ctx.rotate(Math.PI / 4);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-15, -15, 30, 30);

      ctx.restore();
    }
  }

  /**
   * Draw particles
   */
  private drawParticles(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    color: string,
    state: RenderState
  ): void {
    const particleCount = state.isAnimating ? 30 : 10;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (state.animationProgress || 0) * Math.PI * 2;
      const radius = 60 + Math.sin((i / particleCount) * Math.PI * 2) * 20;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color + '80';
      ctx.fill();
    }
  }

  /**
   * Start animation loop
   */
  startAnimation(onFrame: (progress: number) => RenderState): void {
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (Math.sin(elapsed / 1000) + 1) / 2; // Oscillate 0-1

      const state = onFrame(progress);
      this.render(state);

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
   * Cleanup
   */
  dispose(): void {
    this.stopAnimation();
    this.canvas = null;
    this.ctx = null;
  }
}

export function createSimpleRenderer(config: RendererConfig): SimpleRenderer {
  return new SimpleRenderer(config);
}
