/**
 * OpenClaw Evolution Service - Main Entry Point
 *
 * Export main components and factory functions.
 */

export { EvolutionServer, createServer } from './api/server';
export { EvolutionDatabase, getDatabase, closeDatabase } from './storage/database';
export { EventStore, getEventStore } from './storage/event-store';
export { CandidateStore, getCandidateStore } from './storage/candidate-store';
export { TriggerEngine, getTriggerEngine } from './engines/trigger';
export { CandidateExtractor, getCandidateExtractor } from './engines/extractor';
export { Evaluator, getEvaluator } from './engines/evaluator';
