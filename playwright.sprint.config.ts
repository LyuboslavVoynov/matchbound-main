import "dotenv/config";
import {defineConfig,devices} from "@playwright/test";
export default defineConfig({testDir:"./e2e",testMatch:["release-integration.spec.ts","uk-toggle.spec.ts","results-ticket.spec.ts","journal-reveal.spec.ts","inline-calendar.spec.ts"],workers:1,timeout:45000,use:{baseURL:"http://127.0.0.1:3016",trace:"retain-on-failure"},projects:[{name:"desktop",use:{...devices["Desktop Chrome"]}},{name:"mobile",use:{...devices["iPhone 13"],browserName:"chromium"}}]});
