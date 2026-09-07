const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['line'],['html',{ outputFolder:'playwright-report', open:'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name:'desktop-chromium', use:{ ...devices['Desktop Chrome'] } },
    { name:'mobile-chromium', use:{ ...devices['Pixel 7'] } }
  ],
  webServer: {
    command: 'node scripts/serve.mjs',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  }
});
