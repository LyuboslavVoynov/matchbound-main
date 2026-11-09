import {describe,it,expect} from "vitest";
import {existsSync} from "node:fs";
import path from "node:path";
import {beerArtworkFor} from "@/domain/beer-artwork";
import manifest from "@/data/beer-artwork.json";
describe("reviewed beer artwork",()=>{
 it("maps an exact brand and country only",()=>{expect(beerArtworkFor("Germany","Berliner Pilsner")?.src).toContain("berliner-pilsner");expect(beerArtworkFor("France","Berliner Pilsner")).toBeUndefined();});
 it("never borrows a parent or neighbouring brand logo",()=>{expect(beerArtworkFor("Germany","Berliner Kindl Weisse")).toBeUndefined();expect(beerArtworkFor("France","1664 Blanc")).toBeUndefined();});
 it("keeps local files and source/licence metadata",()=>{for(const a of Object.values(manifest)){expect(a.src).toMatch(/^\/beer\//);expect(existsSync(path.join(process.cwd(),"public",a.src))).toBe(true);expect(a.source).toMatch(/^https:\/\/commons.wikimedia.org/);expect(a.author).toBeTruthy();expect(a.license).toBeTruthy();}});
});
