import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PRODUCTION_BASE_URL;
if (!baseURL) throw new Error("Set PRODUCTION_BASE_URL explicitly to the deployment being validated.");
const target = new URL(baseURL);
if (!/^https?:$/.test(target.protocol) || target.username || target.password || target.pathname !== "/" || target.search || target.hash) throw new Error("PRODUCTION_BASE_URL must be a credential-free HTTP(S) origin.");

export default defineConfig({
  testDir: "./e2e", testMatch: "production-smoke.spec.ts", workers: 1, timeout: 90000,
  use: { baseURL: target.origin, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
});
