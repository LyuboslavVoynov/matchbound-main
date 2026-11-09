# Curated creative library

This branch builds on Weekend Journal checkpoint `f27bf36`. It adds an independent versioned library; the retired `place_media` table is not reused and no fixture/draw/beer data is changed.

## Current collection and honest coverage

- **38 reviewed local photographs, 41 exact mappings, 7,173,516 bytes** of optimized WebP.
- Portugal-first batch: all **16/16 Primeira Liga destination cities** and **15/18 grounds**. Reviewed Rio Ave, Rio Maior and Alverca stadium image coverage is still missing. Candidate hits showed wrong grounds, performers or no suitable licensed image; they were rejected rather than substituted.
- Existing Milan and Bilbao samples remain: Serie A 1 city / 1 ground, La Liga 1 city / 1 ground. Other five league collections are inventoried but not sourced yet.
- Eight-league snapshot: 156 club records, **133 unique cities / 154 unique grounds**. This includes the separate league-expansion branch's reviewed 2026 registry, not an assertion that this branch enables extra leagues.
- **Published on 9 November 2026: 38 photos / 41 active mappings / 7,173,516 bytes.** Migration `0016_curated_creatives` was applied to the configured Supabase database. The public `matchbound-creatives` bucket and preferred secret key were verified; the project URL and bucket configuration were saved in the ignored local environment. No secret values are recorded here.
- Each uploaded public object was downloaded and SHA-256 verified before metadata publication. Final database counts match the manifest, both new tables have RLS enabled, and the server-side Porto/Funchal lookups return public Storage country/city/stadium assets. Application deployment remains separate.

`data/creatives/coverage.json` contains the per-league counts and every missing exact destination. `venue-inventory.json` is the reviewed registry snapshot used for coverage, not a live provider scrape. `ppl-sourcing/candidates.json` retains source metadata, selected alternatives, review notes and rejection reasons. Automatic search results are never publication approval.

## Where content lives

- Files: a public Supabase Storage bucket, default `matchbound-creatives`. New files use immutable `journal/{asset-id}/{full-SHA256}.webp` keys and are never upserted over existing objects.
- `creative_assets`: creator, title, source/original URL, licence name/link, attribution, transformation note, hash, dimensions, bytes, focal point, review status/date/note, verified-publication date and URL.
- `creative_placements`: exact normalized country/city/stadium keys and alt text. One reviewed asset can have multiple explicit aliases; broad fuzzy matching is not used.
- New tables enable RLS and have no anonymous read/write policy. The application reads through its existing server-side database connection; pending rows are not public application content.

Approval and publication are separate: an approved local file is not renderable from the remote library until the public object bytes have been downloaded and hash-verified and `published_at` is set. The reveal selects only active approved published assets with recorded review and safe HTTPS source/licence metadata on the configured public bucket origin.

## Provisioning and publication

1. Apply the normal additive migration using `npm run db:migrate`, after reviewing `drizzle/0016_curated_creatives.sql`. The importer checks that the schema exists before uploading.
2. In Supabase Storage create a **public** `matchbound-creatives` bucket. Limit allowed MIME types to `image/webp`; a 6MB object-size limit matches this importer. Do not add an anonymous upload policy.
3. Set server-only environment variables:

   ```dotenv
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SECRET_KEY=YOUR_SERVER_SECRET
   SUPABASE_CREATIVE_BUCKET=matchbound-creatives
   DATABASE_URL=YOUR_EXISTING_DATABASE_URL
   ```

   Preferred keys use the `sb_secret_` format and are sent only in the `apikey` header. Legacy `SUPABASE_SERVICE_ROLE_KEY` JWTs remain accepted with `apikey` and Bearer headers. Publishable/anon keys are rejected. No secret is placed in the client bundle, manifest, logs or image URLs.

4. Run `npm run creatives:sync` for a dry run. It validates exact placements, dated review, reusable licence/name-link agreement, provenance, focal points and byte/hash consistency. New files must be WebP and no larger than 6MB.
5. Run `npm run creatives:sync -- --apply`. The importer verifies the existing bucket is public, uploads only approved files with no upsert, downloads the public bytes to check the hash, then commits asset metadata and exact placements in a transaction. It does not change existing bucket visibility or create permissive upload policies. Re-runs verify existing immutable objects rather than overwrite them.
6. Set `SUPABASE_URL` and the bucket name on the application server and deploy the branch. Runtime rendering requires no server secret, only the existing database connection and public file URLs.

If a step fails, the importer does not mark that asset published. A successfully uploaded but unpublished object may remain after a later database failure; re-running can verify and finish it. Unrelated fixtures, original local photographs and the retired library are untouched.

## Review and reuse rules

All photographs come from individually reviewed Wikimedia Commons file pages. Allowed licence families are CC BY, CC BY-SA and CC0. NC/ND and ambiguous licences are excluded. Several Commons search hits were false matches; no bulk approval is inferred from a file's search ranking or category alone.

Review checks the named subject against the source description and reviewed venue registry, licence, creator and representative desktop/mobile crop. Two older images had no machine-readable author: their original Commons description text explicitly names **Nuno Tavares** (Guimarães castle) and **Rui Gouveia** (Bom Jesus). These manual attribution recoveries are recorded.

Images are resized/WebP-compressed with responsive crops, without retouching. Retain the original image licence, source, creator and transformation notice; share-alike requirements remain attached to derivative image use. Architecture photographs are archival views, not proof of a stadium's current condition. The São Miguel image intentionally shows the named entrance, not an invented stadium panorama. Country scenes represent national atmosphere, not the exact city.

The reveal keeps the original nine local reviewed files if Storage is not configured or its additive table is not migrated. Unsupported exact city/ground keys keep the existing editorial fallback. Image load errors and the bounded preload retain the current runtime fallback. Downloaded candidate files are not served as approved artwork; only the reviewed optimized selections are kept under `public/creatives/ppl`.

Sources: [Commons reuse guidance](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia), [Creative Commons attribution guidance](https://creativecommons.org/reusing-cc-licensed-content/), [Supabase standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads), [Supabase API key guidance](https://supabase.com/docs/guides/getting-started/api-keys).

## Verification

- 17 focused tests cover approval/placement/host/licence/crop gates, old local fallbacks and modern/legacy key headers.
- TypeScript and focused lint pass.
- Production build passes with no configured Storage URL, preserving the existing reveal route and local library.
- Dry run: 38 files / 41 placements / 7,173,516 bytes. Live publication was verified on 9 November 2026: 38 published assets, 41 active placements, RLS enabled, Porto/Funchal server lookups resolved to Storage.
