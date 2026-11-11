import "dotenv/config";
import {defineConfig,devices} from "@playwright/test";
const value=process.env.ITALY_BEER_BASE_URL;
if(!value)throw Error("Set ITALY_BEER_BASE_URL explicitly");
const target=new URL(value);
if(!/^https?:$/.test(target.protocol)||target.username||target.password||target.pathname!=="/"||target.search||target.hash)throw Error("Use a credential-free HTTP(S) origin");
export default defineConfig({
 testDir:"./e2e",testMatch:"italy-beer-catalogue.spec.ts",workers:1,timeout:45000,
 use:{baseURL:target.origin,trace:"retain-on-failure"},
 projects:[{name:"desktop",use:{...devices["Desktop Chrome"]}},{name:"mobile",use:{...devices["iPhone 13"],viewport:{width:390,height:664}}}],
});
