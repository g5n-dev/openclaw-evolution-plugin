/**
 * OpenClaw Evolution Engine - Avatar Manager
 *
 * Manages the OpenClaw Avatar lifecycle and state.
 */

import { v4 as uuidv4 } from 'uuid';
import type { AvatarStage, AvatarConfig, MutationType } from '@openclaw-evolution/shared-types';

export interface AvatarState {
  avatarId: string;
  currentStage: AvatarStage;
  mutations: MutationType[];
  createdAt: number;
  lastMutationAt?: number;
  evolutionCount: number;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  baseColor: '#3b82f6',
  size: 200,
  position: [0, 0, 0],
  animationEnabled: true,
  quality: 'medium',
};

export class AvatarManager {
  private state: AvatarState;
  private config: AvatarConfig;
  private stageHistory: Array<{ stage: AvatarStage; timestamp: number }> = [];

  constructor(config?: Partial<AvatarConfig>) {
    this.config = { ...DEFAULT_AVATAR_CONFIG, ...config };
    this.state = this.initializeAvatar();
  }

  /**
   * Initialize avatar
   */
  private initializeAvatar(): AvatarState {
    return {
      avatarId: uuidv4(),
      currentStage: 'base',
      mutations: [],
      createdAt: Date.now(),
      evolutionCount: 0,
    };
  }

  /**
   * Get current avatar state
   */
  getState(): AvatarState {
    return { ...this.state };
  }

  /**
   * Get current stage
   */
  getStage(): AvatarStage {
    return this.state.currentStage;
  }

  /**
   * Get all mutations
   */
  getMutations(): MutationType[] {
    return [...this.state.mutations];
  }

  /**
   * Get stage history
   */
  getStageHistory(): Array<{ stage: AvatarStage; timestamp: number }> {
    return [...this.stageHistory];
  }

  /**
   * Evolve to next stage
   */
  evolveToStage(stage: AvatarStage): void {
    if (!this.isValidStageTransition(this.state.currentStage, stage)) {
      throw new Error(`Invalid stage transition: ${this.state.currentStage} -> ${stage}`);
    }

    this.state.currentStage = stage;
    this.state.lastMutationAt = Date.now();
    this.state.evolutionCount++;

    this.stageHistory.push({
      stage,
      timestamp: Date.now(),
    });

    // Add automatic mutations for stage upgrades
    this.addMutationsForStage(stage);
  }

  /**
   * Add mutations
   */
  addMutations(mutations: MutationType[]): void {
    for (const mutation of mutations) {
      if (!this.state.mutations.includes(mutation)) {
        this.state.mutations.push(mutation);
      }
    }
    this.state.lastMutationAt = Date.now();
  }

  /**
   * Check if stage transition is valid
   */
  private isValidStageTransition(from: AvatarStage, to: AvatarStage): boolean {
    const stageOrder: AvatarStage[] = ['base', 'awakened', 'learned', 'evolved'];
    const fromIndex = stageOrder.indexOf(from);
    const toIndex = stageOrder.indexOf(to);

    // Can only evolve forward, and at most one stage at a time
    return toIndex === fromIndex + 1;
  }

  /**
   * Add mutations for stage upgrade
   */
  private addMutationsForStage(stage: AvatarStage): void {
    const stageMutations: Record<AvatarStage, MutationType[]> = {
      base: [],
      awakened: ['shell_glow'],
      learned: ['shell_glow', 'node_expand'],
      evolved: ['shell_glow', 'node_expand', 'badge_attach', 'color_shift'],
    };

    this.addMutations(stageMutations[stage]);
  }

  /**
   * Reset avatar to base stage
   */
  reset(): void {
    this.state = this.initializeAvatar();
    this.stageHistory = [];
  }

  /**
   * Get avatar info for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      avatarId: this.state.avatarId,
      currentStage: this.state.currentStage,
      mutations: this.state.mutations,
      createdAt: this.state.createdAt,
      lastMutationAt: this.state.lastMutationAt,
      evolutionCount: this.state.evolutionCount,
      stageHistory: this.stageHistory,
      config: this.config,
    };
  }
}

export function createAvatarManager(config?: Partial<AvatarConfig>): AvatarManager {
  return new AvatarManager(config);
}
