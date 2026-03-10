/**
 * OpenClaw Evolution Engine - Mutations
 *
 * Visual mutations applied to the avatar during evolution.
 */

import type { MutationType } from '@openclaw-evolution/shared-types';

export interface MutationEffect {
  type: MutationType;
  duration: number;
  intensity: number;
  properties: Record<string, unknown>;
}

export const MUTATION_DEFINITIONS: Record<MutationType, MutationEffect> = {
  shell_glow: {
    type: 'shell_glow',
    duration: 1000,
    intensity: 0.5,
    properties: {
      color: '#3b82f6',
      emissive: 0.3,
    },
  },
  node_expand: {
    type: 'node_expand',
    duration: 800,
    intensity: 0.7,
    properties: {
      scale: 1.5,
      ease: 'elastic',
    },
  },
  badge_attach: {
    type: 'badge_attach',
    duration: 600,
    intensity: 0.8,
    properties: {
      badgeType: 'star',
      color: '#fbbf24',
    },
  },
  color_shift: {
    type: 'color_shift',
    duration: 1200,
    intensity: 0.6,
    properties: {
      fromHue: 210,
      toHue: 270,
    },
  },
  particle_emit: {
    type: 'particle_emit',
    duration: 1000,
    intensity: 0.9,
    properties: {
      particleCount: 20,
      spread: 360,
      speed: 2,
    },
  },
  geometry_transform: {
    type: 'geometry_transform',
    duration: 1500,
    intensity: 1.0,
    properties: {
      morphTarget: 'evolved',
      duration: 1000,
    },
  },
};

export function getMutationEffect(type: MutationType): MutationEffect {
  return MUTATION_DEFINITIONS[type];
}

export function createMutationAnimation(type: MutationType): {
  type: MutationType;
  duration: number;
  update: (progress: number) => Record<string, unknown>;
} {
  const effect = getMutationEffect(type);

  return {
    type,
    duration: effect.duration,
    update: (progress: number) => {
      // Easing function
      const eased = easeOutCubic(progress);

      switch (type) {
        case 'shell_glow':
          return {
            glowIntensity: effect.intensity * eased,
            opacity: eased,
          };
        case 'node_expand':
          return {
            scale: 1 + effect.intensity * eased,
          };
        case 'badge_attach':
          return {
            badgeOpacity: eased,
            badgeScale: Math.min(1, eased * 1.5),
          };
        case 'color_shift':
          return {
            hue: (effect.properties.fromHue as number) +
              ((effect.properties.toHue as number) - (effect.properties.fromHue as number)) * eased,
          };
        case 'particle_emit':
          return {
            particleProgress: eased,
            particleOpacity: 1 - eased,
          };
        case 'geometry_transform':
          return {
            morphWeight: eased,
          };
        default:
          return {};
      }
    },
  };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function getActiveMutations(
  stage: 'base' | 'awakened' | 'learned' | 'evolved'
): string[] {
  const mutations: Record<typeof stage, MutationType[]> = {
    base: [],
    awakened: ['shell_glow'],
    learned: ['shell_glow', 'node_expand'],
    evolved: ['shell_glow', 'node_expand', 'badge_attach', 'color_shift', 'particle_emit'],
  };

  return mutations[stage];
}
