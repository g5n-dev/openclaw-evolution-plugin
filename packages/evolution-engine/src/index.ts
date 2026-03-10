/**
 * OpenClaw Evolution Engine - Main Entry Point
 *
 * Export main components and factory functions.
 */

export * from './avatar/avatar';
export * from './avatar/stages';
export * from './avatar/mutations';
export * from './state-machine/machine';
export * from './animations/protocol';
export * from './replay/logger';
export * from './replay/player';
export * from './renderer/simple';

// Re-export types from shared-types
export type {
  AvatarStage,
  AnimationType,
  AnimationIntensity,
  MutationType,
  Event,
  EventType,
} from '@openclaw-evolution/shared-types';
