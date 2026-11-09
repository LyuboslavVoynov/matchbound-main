import { describe, expect, it } from "vitest";
import { journalVisuals } from "@/domain/journal-visuals";
import assets from "@/data/journal-assets.json";
import { existsSync } from "node:fs";
import path from "node:path";
describe("reviewed journal imagery",()=>{
  it("requires country and city agreement before returning landmark artwork",()=>{
    expect(journalVisuals({country:"Portugal",city:"Porto",stadium:"Estádio do Dragão"}).city?.alt).toContain("Bridge");
    expect(journalVisuals({country:"Spain",city:"Porto",stadium:"Estádio do Dragão"}).city).toBeUndefined();
  });
  it("never borrows a city’s stadium photograph for another ground",()=>{
    const result=journalVisuals({country:"Italy",city:"Milan",stadium:"Arena Civica"});
    expect(result.city).toBeDefined(); expect(result.stadium).toBeUndefined();
  });
  it("matches reviewed aliases and accents without broad fuzzy matches",()=>{
    expect(journalVisuals({country:"Spain",city:"Bilbao",stadium:"San Mames"}).stadium).toBeDefined();
    expect(journalVisuals({country:"Italy",city:"Milan",stadium:"Stadio Giuseppe Meazza"}).stadium).toBeDefined();
    expect(journalVisuals({country:"Spain",city:"Bilbao",stadium:"San Mamés training pitch"}).stadium).toBeUndefined();
  });
  it("unknown places receive no borrowed photography",()=>{
    expect(journalVisuals({country:"Netherlands",city:"Amsterdam",stadium:"Johan Cruijff ArenA"})).toEqual({country:undefined,city:undefined,stadium:undefined});
  });
  it("all curated photos exist locally and retain usable attribution",()=>{
    for(const asset of Object.values(assets)){
      expect(existsSync(path.join(process.cwd(),"public",asset.src))).toBe(true);
      expect(asset.author.length).toBeGreaterThan(0);expect(asset.licenseUrl).toMatch(/^https:\/\//);expect(asset.source).toMatch(/^https:\/\/commons.wikimedia.org\//);
    }
  });
});
