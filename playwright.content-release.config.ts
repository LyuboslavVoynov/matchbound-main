import "dotenv/config";
import {defineConfig,devices} from "@playwright/test";

const value=process.env.RELEASE_BASE_URL;
if(!value)throw Error("Set RELEASE_BASE_URL explicitly");
const target=new URL(value);
if(!/^https?:$/.test(target.protocol)||target.username||target.password||target.pathname!=="/"||target.search||target.hash)throw Error("Use a credential-free HTTP(S) origin");
process.env.CONTENT_BASE_URL=target.origin;
process.env.ARTWORK_BASE_URL=target.origin;

// Uses bounded, test-owned draws against the deployment's configured database.
// Never starts a local server or deploys an application.
export default defineConfig({
 testDir:"./e2e",
 testMatch:["content-batches.spec.ts","beer-product-artwork.spec.ts"],
 workers:1,
 timeout:45000,
 use:{baseURL:target.origin,trace:"retain-on-failure"},
 projects:[
  {name:"desktop",use:{...devices["Desktop Chrome"]}},
  {name:"mobile",use:{...devices["iPhone 13"],browserName:"chromium"}},
 ],
});
