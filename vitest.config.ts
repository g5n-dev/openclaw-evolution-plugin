import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@openclaw-evolution/shared-types': path.resolve(__dirname, 'packages/shared-types/src'),
      '@openclaw-evolution/plugin-runtime': path.resolve(__dirname, 'packages/plugin-runtime/src'),
      '@openclaw-evolution/evolution-service': path.resolve(__dirname, 'packages/evolution-service/src'),
      '@openclaw-evolution/evolution-engine': path.resolve(__dirname, 'packages/evolution-engine/src'),
      '@openclaw-evolution/insight-console': path.resolve(__dirname, 'packages/insight-console/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist',
        'tests/',
      ],
    },
  },
});
