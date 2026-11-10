import "dotenv/config";
import {defineConfig,devices} from "@playwright/test";
process.env.ARTWORK_BASE_URL="http://127.0.0.1:3019";
export default defineConfig({testDir:"./e2e",testMatch:["beer-product-artwork.spec.ts","results-ticket.spec.ts"],workers:1,timeout:45000,use:{baseURL:process.env.ARTWORK_BASE_URL,trace:"retain-on-failure"},projects:[{name:"desktop",use:{...devices["Desktop Chrome"]}},{name:"mobile",use:{...devices["iPhone 13"],browserName:"chromium"}}],webServer:{command:"npm run start -- --hostname 127.0.0.1 --port 3019",url:"http://127.0.0.1:3019",reuseExistingServer:false,timeout:30000}});
