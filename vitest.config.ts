import { defineConfig } from 'vitest/config';

// Scoped to the pure core only — no React Native / Expo / DOM needed.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});
