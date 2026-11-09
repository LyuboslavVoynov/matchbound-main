import { beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import type { Database } from "@/db/client";
const routeMocks=vi.hoisted(()=>({eligible:vi.fn(),persist:vi.fn(),db:vi.fn()}));
vi.mock("@/db/client",()=>({createDb:routeMocks.db}));
vi.mock("@/db/draw-repository",async importOriginal=>({...await importOriginal<typeof import("@/db/draw-repository")>(),findEligibleFixtures:routeMocks.eligible,persistDraw:routeMocks.persist}));
import { POST } from "@/app/api/draw/route";
const request=(extra:Record<string,unknown>)=>new Request("http://matchbound.test/api/draw",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({startDate:"2026-11-27",endDate:"2026-11-29",...extra})});
describe("UK preference API",()=>{
 beforeEach(()=>{vi.clearAllMocks();routeMocks.eligible.mockResolvedValue([]);routeMocks.db.mockReturnValue({});});
 it("defaults old requests to including UK matches",async()=>{expect((await POST(request({}))).status).toBe(404);expect(routeMocks.eligible).toHaveBeenCalledWith({},"2026-11-27","2026-11-29",{includeUK:true});});
 it("honours exclusion and never silently retries with UK matches",async()=>{const response=await POST(request({includeUK:false}));expect(response.status).toBe(404);expect((await response.json()).error).toContain("outside the UK");expect(routeMocks.eligible).toHaveBeenCalledTimes(1);expect(routeMocks.eligible).toHaveBeenCalledWith({},"2026-11-27","2026-11-29",{includeUK:false});expect(routeMocks.persist).not.toHaveBeenCalled();});
 it.each(["false",0,null])("rejects non-boolean preference %s before accessing storage",async includeUK=>{expect((await POST(request({includeUK}))).status).toBe(400);expect(routeMocks.db).not.toHaveBeenCalled();});
});
describe("UK venue-country SQL filter",()=>{
 it.each([true,false])("filters on venue location only when includeUK=%s",async includeUK=>{
  // Inspect the actual SQL condition without opening a database connection.
  const {findEligibleFixtures:repository}=await vi.importActual<typeof import("@/db/draw-repository")>("@/db/draw-repository");
  let condition:SQL|undefined;const builder={from:vi.fn(),innerJoin:vi.fn(),where:vi.fn((query:SQL)=>{condition=query;return Promise.resolve([]);})};builder.from.mockReturnValue(builder);builder.innerJoin.mockReturnValue(builder);
  await repository({select:()=>builder} as unknown as Database,"2026-11-27","2026-11-29",{includeUK});
  const compiled=new PgDialect().sqlToQuery(condition!);
  expect(compiled.sql).toContain('"competitions"."active" =');
  expect(compiled.sql).toContain('"competitions"."provider_competition_code" in');
  for(const code of ["PL","PD","BL1","SA","FL1","ELC","DED","PPL"])expect(compiled.params).toContain(code);
  if(includeUK){expect(compiled.sql).not.toContain("not in");}else{expect(compiled.sql).toContain('lower(trim("venues"."country")) not in');for(const country of ["england","scotland","wales","northern ireland","united kingdom"])expect(compiled.params).toContain(country);expect(compiled.params).not.toContain("ireland");}
 });
});
