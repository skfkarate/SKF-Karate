import path from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
    env: {
      JWT_SECRET: 'test-jwt-secret-minimum-32-characters',
      NEXTAUTH_SECRET: 'test-nextauth-secret-minimum-32-chars',
    },
  },
})
