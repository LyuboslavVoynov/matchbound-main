# Sprint 7 — product artwork

Branch: feat/beer-artwork-library. The existing three legacy brand marks remain available for older snapshots. Product snapshots now require an approved exact product-ID/country mapping; they cannot inherit an unrelated legacy mark by display-name coincidence.

Implementation starts with an empty approved manifest, strict source/licence/path/review/hash validation and a read-only file validator. The validator checks product-country identity against all checked-in country catalogues and verifies bytes against the reviewed SHA256. Current artwork coverage is zero for the twenty product-level Germany records. Matchbound seals remain the honest fallback. No source discovery constitutes artwork approval; no new mark is downloaded or published in this checkpoint.

Run: npx tsx scripts/validate-beer-artwork.ts . The report lists product IDs still needing artwork. For each, verify the exact product depicted, source/creator, reusable rights and credits, then keep the file under public/beer/products and record its hash. A brewery product page is a factual source, not automatic permission to reuse its graphics. CC BY/CC BY-SA/CC0 metadata uses the existing shared licence gate. Public-domain or permission-specific artwork needs an explicit evidence model before this stricter new manifest accepts it.

Acceptance: source and subject review, verified bytes, correct source/credit links, per-product matching, responsive ticket inspection and image-failure fallback. Reuse the ticket reveal; no wheel or new interaction. There are no artwork database migrations or imports in this initial checkpoint. A subsequent approved content batch can extend publication using the existing shared storage conventions without exposing server credentials to the client.
