import { describe, expect, it } from "vitest";
import { findExactCatalogBeerBrewer, type CatalogBeerBrewer } from "@/providers/catalog-beer";

describe("Catalog.beer provider contract", () => {
  it("captures provider identity and independent verification flags", () => {
    const brewer: CatalogBeerBrewer = { id: "brewer-id", name: "Example Brewery", cb_verified: true, brewer_verified: false, last_modified: 1_790_000_000 };
    expect(brewer).toMatchObject({ id: "brewer-id", cb_verified: true, brewer_verified: false });
  });
  it("does not queue approximate provider matches for review", () => {
    const matches: CatalogBeerBrewer[] = [{ id: "one", name: "Mahou S.A.", cb_verified: false, brewer_verified: false, last_modified: 1 }];
    expect(findExactCatalogBeerBrewer(matches, "Mahou S.A.")?.id).toBe("one");
    expect(findExactCatalogBeerBrewer(matches, "Mahou Brewery")).toBeUndefined();
  });
});
