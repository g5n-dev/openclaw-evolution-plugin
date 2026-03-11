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
export { createProfessionalRenderer, ProfessionalRenderer } from './renderer/professional';
export { createA2UIRenderer, A2UIRenderer } from './renderer/a2ui-renderer';
export type { A2UIRenderState, A2UIRendererConfig } from './renderer/a2ui-renderer';

// Re-export types from shared-types
export type {
  AvatarStage,
  AnimationType,
  AnimationIntensity,
  MutationType,
  Event,
  EventType,
} from '@openclaw-evolution/shared-types';
