import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    reporters: 'basic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Disable CSS processing entirely for tests
  css: {
    postcss: {
      plugins: [],
    },
  },
  // Use esbuild for faster transforms
  esbuild: {
    target: 'node18',
  },
});

