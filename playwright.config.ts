import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end and visual test configuration.
 * Tests run against the production build (`vite preview`) so that the
 * measured behaviour matches the deployed application.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // Visual baselines need the Linux Docker image; `npm run test:e2e` runs anywhere.
      testIgnore: '**/visual/**',
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'visual/**/*.spec.ts',
      // Baselines exist for Linux only, so the file name carries no platform suffix.
      snapshotPathTemplate: '{testDir}/visual/baselines/{arg}{ext}',
      // The default per-pixel threshold (0.2) lets a translucent overlay such as a
      // 30% ground shadow pass unnoticed. The image renders identically on every
      // run, so a much stricter value stays stable.
      expect: { toHaveScreenshot: { threshold: 0.05 } },
    },
  ],
  webServer: {
    command: 'npm run build-only && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
})
