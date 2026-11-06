-- Do not infer reviewed provenance from a provider name. The validated registry seeder
-- is the sole authority that promotes individual venue records to reviewed status.
UPDATE "venues" SET "reviewed" = false WHERE "provider" = 'football-data';
