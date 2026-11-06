INSERT INTO "venues" ("provider", "provider_team_id", "stadium", "city", "country", "timezone")
SELECT 'development', 'fixture:' || f."source_id", f."stadium", f."city", c."country", f."timezone"
FROM "fixtures" f JOIN "competitions" c ON c."id" = f."competition_id"
WHERE f."venue_id" IS NULL
ON CONFLICT ("provider", "provider_team_id") DO NOTHING;
UPDATE "fixtures" f SET "venue_id" = v."id"
FROM "venues" v
WHERE f."venue_id" IS NULL AND v."provider" = 'development' AND v."provider_team_id" = 'fixture:' || f."source_id";
