import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 20_000,
  use: { baseURL: "http://localhost:3002", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
  webServer: { command: "npm.cmd run dev -- -p 3002", url: "http://localhost:3002", reuseExistingServer: !process.env.CI, timeout: 30_000 },
});
