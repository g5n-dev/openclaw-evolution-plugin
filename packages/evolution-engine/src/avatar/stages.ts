/**
 * OpenClaw Evolution Engine - Avatar Stages
 *
 * Defines the four avatar stages and their properties.
 */

import type { AvatarStage } from '@openclaw-evolution/shared-types';

export interface StageDefinition {
  stage: AvatarStage;
  name: string;
  description: string;
  color: number; // Hue value (0-360)
  nodeCount: number;
  particleCount: number;
  glowIntensity: number;
  requiredMutations: number;
}

export const AVATAR_STAGES: Record<string, StageDefinition> = {
  base: {
    stage: 'base' as any,
    name: 'Base Stage',
    description: 'Initial OpenClaw state - clean slate',
    color: 210, // Blue
    nodeCount: 0,
    particleCount: 10,
    glowIntensity: 0.3,
    requiredMutations: 0,
  },
  awakened: {
    stage: 'awakened' as any,
    name: 'Awakened',
    description: 'First evolution activated - system aware',
    color: 220, // Blue-purple
    nodeCount: 2,
    particleCount: 20,
    glowIntensity: 0.5,
    requiredMutations: 1,
  },
  learned: {
    stage: 'learned' as any,
    name: 'Learned',
    description: 'Multiple skills acquired - growing knowledge',
    color: 270, // Purple
    nodeCount: 4,
    particleCount: 30,
    glowIntensity: 0.7,
    requiredMutations: 2,
  },
  evolved: {
    stage: 'evolved' as any,
    name: 'Evolved',
    description: 'Fully evolved system - peak performance',
    color: 300, // Pink-purple
    nodeCount: 8,
    particleCount: 50,
    glowIntensity: 1.0,
    requiredMutations: 4,
  },
};

export function getStageDefinition(stage: any): StageDefinition {
  return AVATAR_STAGES[stage];
}

export function getNextStage(currentStage: any): any {
  const stages = ['base', 'awakened', 'learned', 'evolved'];
  const currentIndex = stages.indexOf(currentStage);

  if (currentIndex < stages.length - 1) {
    return stages[currentIndex + 1];
  }

  return null;
}

export function getPreviousStage(currentStage: any): any {
  const stages = ['base', 'awakened', 'learned', 'evolved'];
  const currentIndex = stages.indexOf(currentStage);

  if (currentIndex > 0) {
    return stages[currentIndex - 1];
  }

  return null;
}
