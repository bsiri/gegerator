import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['junit', 'json'],
    outputFile: {
      junit: './test-results/junit-report.xml',
      json: './test-results/json-report.json'
    }
  }
})
