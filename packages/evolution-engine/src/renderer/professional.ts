/**
 * OpenClaw Evolution Engine - Professional Renderer
 *
 * 基于专业 UI/UX 设计的 Canvas 2D 渲染器
 * 参考 Google A2UI 的设计理念
 * 实现：有机进化感 + 科技美学 + 龙虾元素隐喻
 */

export interface ProfessionalRendererConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface ProfessionalRenderState {
  stage: string;
  mutations: string[];
  animationProgress: number;
  isAnimating: boolean;
  time: number;
}

interface StageConfig {
  primary: string;
  secondary: string;
  glow: {
    enabled: boolean;
    radius?: number;
    opacity?: number;
    blur?: number;
    pulse?: boolean;
    layers?: number;
    bioluminescent?: boolean;
  };
  particles: {
    count: number;
  };
  nodes: number;
  coreSize: number;
  innerCore?: number;
}

export class ProfessionalRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private config: ProfessionalRendererConfig;
  private animationId?: number;
  private startTime: number = 0;

  constructor(config: ProfessionalRendererConfig) {
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

    this.startTime = Date.now();
  }

  /**
   * Main render method
   */
  render(state: ProfessionalRenderState): void {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = this.config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Get stage colors
    const stageConfig = this.getStageConfig(state.stage);

    // Draw effects (bottom to top)
    this.drawGlow(ctx, centerX, centerY, state, stageConfig);
    this.drawParticles(ctx, centerX, centerY, state, stageConfig);
    this.drawNodes(ctx, centerX, centerY, state, stageConfig);
    this.drawCore(ctx, centerX, centerY, state, stageConfig);
    this.drawBadge(ctx, centerX, centerY, state);
  }

  /**
   * Get stage configuration
   */
  private getStageConfig(stage: string): StageConfig {
    const configs: Record<string, StageConfig> = {
      base: {
        primary: '#3B82F6',
        secondary: '#60A5FA',
        glow: { enabled: false },
        particles: { count: 10 },
        nodes: 0,
        coreSize: 50,
      },
      awakened: {
        primary: '#8B5CF6',
        secondary: '#A78BFA',
        glow: { enabled: true, radius: 100, opacity: 0.3, blur: 20, pulse: true },
        particles: { count: 20 },
        nodes: 2,
        coreSize: 52,
      },
      learned: {
        primary: '#A855F7',
        secondary: '#C084FC',
        glow: { enabled: true, radius: 120, opacity: 0.5, blur: 30, layers: 2 },
        particles: { count: 30 },
        nodes: 4,
        coreSize: 54,
        innerCore: 30,
      },
      evolved: {
        primary: '#EC4899',
        secondary: '#F472B6',
        glow: { enabled: true, radius: 150, opacity: 0.6, blur: 40, layers: 3, bioluminescent: true },
        particles: { count: 50 },
        nodes: 8,
        coreSize: 56,
        innerCore: 35,
      },
    };

    return configs[stage] || configs.base;
  }

  /**
   * Draw glow effect (Exoskeleton metaphor)
   */
  private drawGlow(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    state: ProfessionalRenderState,
    config: StageConfig
  ): void {
    if (!config.glow?.enabled) return;

    const pulseFactor = state.isAnimating
      ? (Math.sin(state.time / 500) + 1) / 2
      : 0.5;

    const baseRadius = config.glow.radius;
    const radius = baseRadius + pulseFactor * 20;

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      config.coreSize * 0.5,
      centerX,
      centerY,
      radius
    );

    const opacity = Math.floor(config.glow.opacity * 255 * (0.8 + pulseFactor * 0.2));
    gradient.addColorStop(0, config.primary + opacity.toString(16).padStart(2, '0'));
    gradient.addColorStop(0.5, config.primary + Math.floor(config.glow.opacity * 255 * 0.5).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.config.width, this.config.height);
  }

  /**
   * Draw core sphere (Lobster head metaphor)
   */
  private drawCore(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    state: ProfessionalRenderState,
    config: StageConfig
  ): void {
    const pulseFactor = state.isAnimating
      ? (Math.sin(state.time / 1000) + 1) / 2 * 0.1
      : 0;

    const coreSize = config.coreSize * (1 + pulseFactor);

    // Outer gradient
    const outerGradient = ctx.createRadialGradient(
      centerX,
      centerY - coreSize * 0.3,
      0,
      centerX,
      centerY,
      coreSize
    );

    outerGradient.addColorStop(0, config.secondary);
    outerGradient.addColorStop(0.7, config.primary);
    outerGradient.addColorStop(1, config.primary + 'CC');

    ctx.beginPath();
    ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
    ctx.fillStyle = outerGradient;
    ctx.fill();

    // Inner core (learned+)
    if (config.innerCore) {
      const innerGradient = ctx.createRadialGradient(
        centerX,
        centerY - config.innerCore * 0.3,
        0,
        centerX,
        centerY,
        config.innerCore
      );

      innerGradient.addColorStop(0, config.secondary);
      innerGradient.addColorStop(1, config.primary + 'CC');

      ctx.beginPath();
      ctx.arc(centerX, centerY, config.innerCore, 0, Math.PI * 2);
      ctx.fillStyle = innerGradient;
      ctx.fill();
    }

    // Bioluminescent effect (evolved)
    if (config.glow?.bioluminescent) {
      const bioGlow = Math.sin(state.time / 300) * 0.5 + 0.5;

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreSize + 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251, 191, 36, ${bioGlow * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  /**
   * Draw nodes (Claw metaphor - skill acquisition)
   */
  private drawNodes(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    state: ProfessionalRenderState,
    config: StageConfig
  ): void {
    if (config.nodes === 0) return;

    const orbitRadius = 80 + state.animationProgress * 10;
    const nodeSize = 10;

    for (let i = 0; i < config.nodes; i++) {
      const angle = (i / config.nodes) * Math.PI * 2 + state.time / 2000;
      const x = centerX + Math.cos(angle) * orbitRadius;
      const y = centerY + Math.sin(angle) * orbitRadius;

      // Node glow
      const nodeGradient = ctx.createRadialGradient(x, y, 0, x, y, nodeSize);
      nodeGradient.addColorStop(0, config.secondary);
      nodeGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = nodeGradient;
      ctx.fill();

      // Node connection to center
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(centerX, centerY);
      ctx.strokeStyle = config.primary + '40';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /**
   * Draw particles (Tentacle metaphor - sensory connection)
   */
  private drawParticles(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    state: ProfessionalRenderState,
    config: StageConfig
  ): void {
    const particleCount = config.particles.count;

    for (let i = 0; i < particleCount; i++) {
      // Lissajous curve for organic motion
      const a = 3;
      const b = 2;
      const delta = state.time / 1000 + (i / particleCount) * Math.PI * 2;

      const angleX = a * delta + (i * 0.1);
      const angleY = b * delta;

      const orbitRadius = 60 + Math.sin(delta + i) * 20;
      const x = centerX + Math.cos(angleX) * orbitRadius;
      const y = centerY + Math.sin(angleY) * orbitRadius;

      // Particle type based on index
      const type = i % 10;

      if (type === 0) {
        // Dust particles
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = config.primary + '80';
        ctx.fill();
      } else if (type === 1) {
        // Spark particles with glow
        const sparkGlow = Math.sin(state.time / 200 + i) * 0.5 + 0.5;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 4);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = sparkGlow;
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        // Regular particles
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = config.primary + '60';
        ctx.fill();
      }
    }
  }

  /**
   * Draw badge (Evolution achievement)
   */
  private drawBadge(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    state: ProfessionalRenderState
  ): void {
    if (state.stage !== 'evolved' || !state.mutations.includes('badge_attach')) return;

    const badgeY = centerY - 80;
    const badgeSize = 30;

    ctx.save();
    ctx.translate(centerX, badgeY);

    // Rotate animation
    const rotation = state.time / 3000;
    ctx.rotate(rotation);

    // Hexagon badge
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * badgeSize;
      const y = Math.sin(angle) * badgeSize;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Badge gradient
    const badgeGradient = ctx.createLinearGradient(-badgeSize, -badgeSize, badgeSize, badgeSize);
    badgeGradient.addColorStop(0, '#FBBF24');
    badgeGradient.addColorStop(0.5, '#FCD34D');
    badgeGradient.addColorStop(1, '#FBBF24');

    ctx.fillStyle = badgeGradient;
    ctx.fill();

    // Badge glow
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.restore();
  }

  /**
   * Start animation loop with professional timing
   */
  startAnimation(onFrame: (progress: number, time: number) => ProfessionalRenderState): void {
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - this.startTime;

      // Use ease-in-out for progress (breathing animation)
      const progress = (Math.sin(elapsed / 1500) + 1) / 2;

      const state = onFrame(progress, elapsed);
      state.time = elapsed;

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
   * Dispose
   */
  dispose(): void {
    this.stopAnimation();
    this.canvas = null;
    this.ctx = null;
  }
}

export function createProfessionalRenderer(config: ProfessionalRendererConfig): ProfessionalRenderer {
  return new ProfessionalRenderer(config);
}
