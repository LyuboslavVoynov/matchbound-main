import {describe,it,expect} from "vitest";
import {existsSync} from "node:fs";
import path from "node:path";
import {fixtureBackdropFor} from "@/domain/fixture-backdrop";
describe("exact stadium backgrounds",()=>{
 it("uses a local verified Allianz photo with source credit",()=>{const photo=fixtureBackdropFor({country:"Germany",city:"Munich",stadium:"Allianz Arena"});expect(photo?.src).toBe("/journal/allianz-arena.webp");expect(photo?.author).toBeTruthy();expect(existsSync(path.join(process.cwd(),"public",photo!.src))).toBe(true);});
 it("does not borrow a stadium image when the city or country differs",()=>{expect(fixtureBackdropFor({country:"Germany",city:"Berlin",stadium:"Allianz Arena"})).toBeUndefined();expect(fixtureBackdropFor({country:"France",city:"Munich",stadium:"Allianz Arena"})).toBeUndefined();});
 it("reuses reviewed stadium mappings and leaves unknown grounds plain",()=>{expect(fixtureBackdropFor({country:"Portugal",city:"Porto",stadium:"Estádio do Dragão"})?.src).toContain("porto-stadium");expect(fixtureBackdropFor({country:"Germany",city:"Munich",stadium:"Training ground"})).toBeUndefined();});
});
