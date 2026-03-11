/**
 * OpenClaw Evolution Engine - State Machine
 *
 * Manages Avatar state transitions and evolution flow.
 */

import { getNextStage } from '../avatar/stages';
import type { AvatarManager, AvatarStage } from '../avatar/avatar';
import type { AnimationType, AnimationIntensity } from '@openclaw-evolution/shared-types';

export interface StateTransition {
  fromStage: AvatarStage;
  toStage: AvatarStage;
  timestamp: number;
  trigger: string;
}

export interface StateMachineConfig {
  onStageChange?: (transition: StateTransition) => void;
  onMutation?: (mutation: string) => void;
}

export class AvatarStateMachine {
  private avatar: AvatarManager;
  private config: StateMachineConfig;
  private transitionHistory: StateTransition[] = [];

  constructor(avatar: AvatarManager, config: StateMachineConfig = {}) {
    this.avatar = avatar;
    this.config = config;
  }

  /**
   * Get current stage
   */
  getCurrentStage(): AvatarStage {
    return this.avatar.getStage();
  }

  /**
   * Check if can evolve to next stage
   */
  canEvolve(): boolean {
    const currentStage = this.getCurrentStage();
    const nextStage = getNextStage(currentStage);
    return nextStage !== null;
  }

  /**
   * Evolve to next stage
   */
  evolve(trigger: string = 'manual'): StateTransition | null {
    const currentStage = this.getCurrentStage();
    const nextStage = getNextStage(currentStage);

    if (!nextStage) {
      return null; // Already at max stage
    }

    const transition: StateTransition = {
      fromStage: currentStage,
      toStage: nextStage,
      timestamp: Date.now(),
      trigger,
    };

    // Apply evolution
    this.avatar.evolveToStage(nextStage);
    this.transitionHistory.push(transition);

    // Notify callback
    if (this.config.onStageChange) {
      this.config.onStageChange(transition);
    }

    return transition;
  }

  /**
   * Trigger animation based on event
   */
  triggerAnimation(type: AnimationType, intensity: AnimationIntensity = 'medium'): void {
    const duration = this.getAnimationDuration(type, intensity);

    // Animation would be triggered here
    // For now, just log
    console.log(`Animation triggered: ${type} (${intensity}, ${duration}ms)`);
  }

  /**
   * Get animation duration
   */
  private getAnimationDuration(type: AnimationType, intensity: AnimationIntensity): number {
    const baseDurations: Record<string, number> = {
      pulse: 1000,
      evaluating: 2000,
      activation: 1500,
      mutation: 1200,
      celebration: 3000,
      error: 500,
    };

    const intensityMultipliers: Record<string, number> = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
    };

    return (baseDurations[type as string] || 1000) * (intensityMultipliers[intensity as string] || 1);
  }

  /**
   * Get transition history
   */
  getTransitionHistory(): StateTransition[] {
    return [...this.transitionHistory];
  }

  /**
   * Get state for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      currentStage: this.getCurrentStage(),
      canEvolve: this.canEvolve(),
      transitionHistory: this.transitionHistory,
      avatarState: this.avatar.getState(),
    };
  }
}
