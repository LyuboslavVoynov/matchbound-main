import { describe, expect, it } from "vitest";
import { normalizeFootballDataStatus } from "@/providers/football-data-normalize";
import { supportedCompetition } from "@/providers/football-data-registry";

describe("football-data normalization", () => {
  it("only permits scheduled/timed fixtures into the confirmed draw pool", () => {
    expect(normalizeFootballDataStatus("SCHEDULED")).toBe("confirmed");
    expect(normalizeFootballDataStatus("TIMED")).toBe("confirmed");
    expect(normalizeFootballDataStatus("FINISHED")).toBe("tentative");
    expect(normalizeFootballDataStatus("POSTPONED")).toBe("postponed");
    expect(normalizeFootballDataStatus("CANCELLED")).toBe("cancelled");
  });
  it("only approves reviewed competition codes", () => {
    expect(supportedCompetition("PL")?.country).toBe("England");
    expect(supportedCompetition("CL")).toBeUndefined();
    expect(supportedCompetition(null)).toBeUndefined();
  });
});
