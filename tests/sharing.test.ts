import { describe, expect, it } from "vitest";
import { canonicalTripUrl, whatsAppShareUrl } from "@/domain/sharing";

describe("stable trip sharing", () => {
  it("uses the saved result route on the current origin, independent of a tracking path", () => {
    expect(canonicalTripUrl("https://matchbound.example/old?source=tracking#fragment", "/m/stable-token")).toBe("https://matchbound.example/m/stable-token");
    expect(canonicalTripUrl("http://127.0.0.1:3000", "/m/stable-token")).toBe("http://127.0.0.1:3000/m/stable-token");
  });
  it("encodes fixture text and the stable trip link without starting a message", () => {
    const message = "Mönchengladbach v St. Pauli — a football weekend!";
    const trip = "https://matchbound.example/m/abc_def-123";
    const url = new URL(whatsAppShareUrl(trip, message));
    expect(url.origin).toBe("https://wa.me");
    expect(url.searchParams.get("text")).toBe(`${message}\n${trip}`);
    expect(url.searchParams.size).toBe(1);
  });
});
