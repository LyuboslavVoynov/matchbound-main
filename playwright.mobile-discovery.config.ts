import {defineConfig,devices} from "@playwright/test";
export default defineConfig({
 testDir:"./e2e",testMatch:["mobile-discovery.spec.ts","journal-reveal.spec.ts","inline-calendar.spec.ts"],workers:1,timeout:45000,
 use:{baseURL:"http://127.0.0.1:3020",trace:"retain-on-failure"},
 projects:[
  {name:"iphone-safari",use:{...devices["iPhone 13"],viewport:{width:390,height:664}}},
  {name:"small-iphone-safari",use:{...devices["iPhone SE"],viewport:{width:320,height:568}}},
  {name:"desktop",use:{...devices["Desktop Chrome"],viewport:{width:1280,height:900}}},
 ],
 webServer:{command:"npm run dev -- --hostname 127.0.0.1 --port 3020",url:"http://127.0.0.1:3020",reuseExistingServer:true,timeout:60000},
});
