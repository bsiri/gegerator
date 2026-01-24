import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // load this file before running tests to provide Angular JIT compiler
    setupFiles: ['./src/test-setup.ts'],
    environment: 'jsdom',
    globals: true,
    // ignore legacy/obsolete test files and node_modules tests
    exclude: [
      'test-waiting-migration/**', 
      'node_modules/**'
    ]
  }
})
