import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/draw/route";

describe("POST /api/draw", () => {
  it("returns a controlled client error for malformed JSON before touching the database", async () => {
    const response = await POST(new Request("http://matchbound.test/api/draw", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.any(String) });
  });
});
