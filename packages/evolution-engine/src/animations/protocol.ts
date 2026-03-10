/**
 * OpenClaw Evolution Engine - Animation Protocol
 *
 * Defines the protocol for avatar animations and visual effects.
 */

import type { AnimationType, AnimationIntensity } from '@openclaw-evolution/shared-types';

export interface AnimationEvent {
  type: 'animation_start' | 'animation_end' | 'animation_frame';
  animationType: AnimationType;
  intensity: AnimationIntensity;
  timestamp: number;
  duration: number;
  progress?: number;
}

export interface AnimationProtocol {
  type: AnimationType;
  intensity: AnimationIntensity;
  duration: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'elastic';
  loop: boolean;
  interruptible: boolean;
}

export const ANIMATION_PROTOCOLS: Record<string, Omit<AnimationProtocol, 'intensity' | 'duration'>> = {
  pulse: {
    type: 'pulse' as any,
    easing: 'easeInOut',
    loop: true,
    interruptible: true,
  },
  evaluating: {
    type: 'evaluating' as any,
    easing: 'linear',
    loop: true,
    interruptible: true,
  },
  activation: {
    type: 'activation' as any,
    easing: 'easeOut',
    loop: false,
    interruptible: false,
  },
  mutation: {
    type: 'mutation' as any,
    easing: 'easeInOut',
    loop: false,
    interruptible: false,
  },
  celebration: {
    type: 'celebration' as any,
    easing: 'easeOut',
    loop: false,
    interruptible: true,
  },
  error: {
    type: 'error' as any,
    easing: 'easeInOut',
    loop: true,
    interruptible: true,
  },
};

export function createAnimationProtocol(
  type: AnimationType,
  intensity: AnimationIntensity = 'medium' as any,
  duration?: number
): AnimationProtocol {
  const baseProtocol = ANIMATION_PROTOCOLS[type as string] as any;

  const defaultDurations: Record<string, Record<string, number>> = {
    pulse: { low: 700, medium: 1000, high: 1500 },
    evaluating: { low: 1500, medium: 2000, high: 3000 },
    activation: { low: 1000, medium: 1500, high: 2000 },
    mutation: { low: 800, medium: 1200, high: 1800 },
    celebration: { low: 2000, medium: 3000, high: 4000 },
    error: { low: 300, medium: 500, high: 700 },
  };

  return {
    ...baseProtocol,
    intensity,
    duration: duration ?? defaultDurations[type as string][intensity as string],
  };
}

export function easingFunction(
  easing: AnimationProtocol['easing'],
  t: number
): number {
  switch (easing) {
    case 'linear':
      return t;
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return 1 - (1 - t) * (1 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case 'elastic':
      return t === 0
        ? 0
        : t === 1
        ? 1
        : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
  }
}

export function generateAnimationFrames(
  protocol: AnimationProtocol,
  fps: number = 60
): AnimationEvent[] {
  const frames: AnimationEvent[] = [];
  const totalFrames = Math.floor((protocol.duration / 1000) * fps);

  for (let i = 0; i <= totalFrames; i++) {
    const progress = i / totalFrames;
    const easedProgress = easingFunction(protocol.easing, progress);

    frames.push({
      type: 'animation_frame',
      animationType: protocol.type,
      intensity: protocol.intensity,
      timestamp: Date.now() + (i / fps) * 1000,
      duration: protocol.duration,
      progress: easedProgress,
    });
  }

  return frames;
}
