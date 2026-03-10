/**
 * Simple verification script for testing core functionality
 */
// Test 1: Shared Types
console.log('Testing shared-types...');
try {
    var _a = require('@openclaw-evolution/shared-types/dist/index.js'), EventType = _a.EventType, createEventId = _a.createEventId, AvatarStage = _a.AvatarStage;
    console.assert(EventType.USER_MESSAGE === 'user_message', 'EventType test failed');
    console.assert(createEventId().startsWith('evt_'), 'createEventId test failed');
    console.assert(AvatarStage.BASE === 'base', 'AvatarStage test failed');
    console.log('✓ shared-types OK');
}
catch (error) {
    console.error('✗ shared-types FAILED:', error);
}
// Test 2: Plugin Runtime
console.log('\nTesting plugin-runtime...');
try {
    var _b = require('@openclaw-evolution/plugin-runtime/dist/index.js'), createHandshakeManager = _b.createHandshakeManager, PLUGIN_INFO = _b.PLUGIN_INFO;
    var manager = createHandshakeManager({ serviceUrl: 'http://localhost:3001' });
    console.assert(manager !== undefined, 'HandshakeManager creation failed');
    console.assert(PLUGIN_INFO.name === '@openclaw-evolution/plugin-runtime', 'PLUGIN_INFO test failed');
    console.log('✓ plugin-runtime OK');
}
catch (error) {
    console.error('✗ plugin-runtime FAILED:', error);
}
// Test 3: Evolution Engine
console.log('\nTesting evolution-engine...');
try {
    var createAvatarManager = require('@openclaw-evolution/evolution-engine/dist/index.js').createAvatarManager;
    var avatar = createAvatarManager();
    var state = avatar.getState();
    console.assert(state.currentStage === 'base', 'Avatar initial stage failed');
    console.log('✓ evolution-engine OK');
}
catch (error) {
    console.error('✗ evolution-engine FAILED:', error);
}
console.log('\n=== Verification Complete ===');
