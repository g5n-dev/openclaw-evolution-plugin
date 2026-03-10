/**
 * Simple verification script for testing core functionality
 */

// Test 1: Shared Types
console.log('Testing shared-types...');
try {
  const { EventType, createEventId, AvatarStage } = require('@openclaw-evolution/shared-types/dist/index.js');

  console.assert(EventType.USER_MESSAGE === 'user_message', 'EventType test failed');
  console.assert(createEventId().startsWith('evt_'), 'createEventId test failed');
  console.assert(AvatarStage.BASE === 'base', 'AvatarStage test failed');
  console.log('✓ shared-types OK');
} catch (error) {
  console.error('✗ shared-types FAILED:', error);
}

// Test 2: Plugin Runtime
console.log('\nTesting plugin-runtime...');
try {
  const { createHandshakeManager, PLUGIN_INFO } = require('@openclaw-evolution/plugin-runtime/dist/index.js');

  const manager = createHandshakeManager({ serviceUrl: 'http://localhost:3001' });
  console.assert(manager !== undefined, 'HandshakeManager creation failed');
  console.assert(PLUGIN_INFO.name === '@openclaw-evolution/plugin-runtime', 'PLUGIN_INFO test failed');
  console.log('✓ plugin-runtime OK');
} catch (error) {
  console.error('✗ plugin-runtime FAILED:', error);
}

// Test 3: Evolution Engine
console.log('\nTesting evolution-engine...');
try {
  const { createAvatarManager } = require('@openclaw-evolution/evolution-engine/dist/index.js');

  const avatar = createAvatarManager();
  const state = avatar.getState();
  console.assert(state.currentStage === 'base', 'Avatar initial stage failed');
  console.log('✓ evolution-engine OK');
} catch (error) {
  console.error('✗ evolution-engine FAILED:', error);
}

console.log('\n=== Verification Complete ===');
