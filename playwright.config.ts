import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright end-to-end configuration for the Angular 19 client.
 *
 * By default the suite is run against a locally started Angular dev server
 * (`ng serve`, port 4200), which serves the built client without requiring
 * MongoDB. Point the suite at another origin (e.g. the Express server that
 * serves `dist/client/browser`) by setting `E2E_BASE_URL`, in which case no
 * local server is started.
 */
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:4200';
const useExternalServer = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: useExternalServer
    ? undefined
    : {
        command: 'npm run serve:dev -- --port 4200',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
