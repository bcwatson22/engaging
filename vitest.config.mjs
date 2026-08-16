import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // Vite 8 resolves tsconfig paths natively, replacing vite-tsconfig-paths
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'istanbul',
      reportsDirectory: './src/tests/coverage',
      exclude: [
        '.next/**',
        'src/data/types/**',
        // generated CMS fallback — data, not code
        'src/data/snapshot/**',
        'src/queries/**',
        // build entry points — a single call each, with nothing to assert
        'src/scripts/**',
      ],
      // the repo has sat at 100% by hand; make CI hold the line
      thresholds: { 100: true },
    },
  },
});
