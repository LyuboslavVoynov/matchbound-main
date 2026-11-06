import { boolean, date, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type { DrawResultSnapshot } from "@/domain/result";

export const competitionGender = pgEnum("competition_gender", ["men", "women", "mixed"]);
export const competitionFormat = pgEnum("competition_format", ["club", "international"]);
export const fixtureStatus = pgEnum("fixture_status", ["confirmed", "tentative", "postponed", "cancelled"]);
export const beerBrandCandidateStatus = pgEnum("beer_brand_candidate_status", ["pending", "approved", "rejected"]);
/** Editorial approval is distinct from third-party provider corroboration. */
export const beerBrandApprovalStatus = pgEnum("beer_brand_approval_status", ["approved", "pending", "rejected"]);
/** Curated media is intentionally limited to background roles in the reveal. */
export const placeMediaSubject = pgEnum("place_media_subject", ["city", "stadium"]);

export const competitions = pgTable("competitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  provider: text("provider"),
  providerCompetitionId: text("provider_competition_id"),
  providerCompetitionCode: text("provider_competition_code"),
  providerAreaId: text("provider_area_id"),
  providerAreaCode: text("provider_area_code"),
  emblemUrl: text("emblem_url"),
  areaFlagUrl: text("area_flag_url"),
  country: text("country").notNull(),
  region: text("region").notNull().default("Europe"),
  gender: competitionGender("gender").notNull().default("men"),
  format: competitionFormat("format").notNull().default("club"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("competitions_name_country_unique").on(table.name, table.country)]);

export const venues = pgTable("venues", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").notNull(),
  providerTeamId: text("provider_team_id").notNull(),
  stadium: text("stadium").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  timezone: text("timezone").notNull(),
  address: text("address"),
  sourceUrl: text("source_url"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }).notNull().defaultNow(),
  /** True only for canonical venue records that passed Matchbound review. */
  reviewed: boolean("reviewed").notNull().default(false),
  active: boolean("active").notNull().default(true),
}, (table) => [uniqueIndex("venues_provider_team_unique").on(table.provider, table.providerTeamId)]);

/**
 * Editorially approved, licence-recorded reveal imagery. We store Commons
 * source metadata alongside the resolved image URL so a display never relies
 * on runtime search results or an undocumented attribution convention.
 */
export const placeMedia = pgTable("place_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectType: placeMediaSubject("subject_type").notNull(),
  subjectKey: text("subject_key").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  stadium: text("stadium"),
  imageUrl: text("image_url").notNull(),
  sourceName: text("source_name").notNull(),
  sourcePageUrl: text("source_page_url").notNull(),
  author: text("author").notNull(),
  licenceName: text("licence_name").notNull(),
  licenceUrl: text("licence_url").notNull(),
  attribution: text("attribution").notNull(),
  focalPoint: text("focal_point").notNull().default("center"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("place_media_subject_unique").on(table.subjectType, table.subjectKey),
  index("place_media_lookup_idx").on(table.subjectType, table.subjectKey, table.active),
]);

export const beerCityPrices = pgTable("beer_city_prices", {
  id: uuid("id").defaultRandom().primaryKey(), countryCode: text("country_code").notNull(), cityId: text("city_id").notNull(), cityName: text("city_name").notNull(),
  averagePriceMinor: integer("average_price_minor").notNull(), currency: text("currency").notNull(), servingMl: integer("serving_ml").notNull(), servingLabel: text("serving_label").notNull(), metricDefinition: text("metric_definition").notNull(), sourceName: text("source_name").notNull(), sourceUrl: text("source_url").notNull(), observedAt: timestamp("observed_at", { withTimezone: true }).notNull(), reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull(), validUntil: timestamp("valid_until", { withTimezone: true }).notNull(), active: boolean("active").notNull().default(true),
}, (table) => [uniqueIndex("beer_city_prices_country_city_unique").on(table.countryCode, table.cityId), index("beer_city_prices_valid_until_idx").on(table.validUntil)]);

export const countryBeerBrands = pgTable("country_beer_brands", {
  id: uuid("id").defaultRandom().primaryKey(), countryCode: text("country_code").notNull(), countryName: text("country_name").notNull(), brandName: text("brand_name").notNull(), originStatement: text("origin_statement").notNull(), sourceName: text("source_name").notNull(), sourceUrl: text("source_url").notNull(), reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull(), validUntil: timestamp("valid_until", { withTimezone: true }).notNull(), approvalStatus: beerBrandApprovalStatus("approval_status").notNull().default("pending"), active: boolean("active").notNull().default(true),
}, (table) => [uniqueIndex("country_beer_brands_country_brand_unique").on(table.countryCode, table.brandName), index("country_beer_brands_valid_until_idx").on(table.validUntil), index("country_beer_brands_draw_pool_idx").on(table.countryCode, table.approvalStatus, table.active, table.validUntil)]);

/**
 * Provider corroboration for existing reviewed brands only. It is not a general
 * discovery or approval path, and candidates never appear in a draw directly.
 */
export const beerBrandCandidates = pgTable("beer_brand_candidates", {
  id: uuid("id").defaultRandom().primaryKey(),
  countryBeerBrandId: uuid("country_beer_brand_id").notNull().references(() => countryBeerBrands.id),
  provider: text("provider").notNull(),
  providerBrewerId: text("provider_brewer_id").notNull(),
  providerBrewerName: text("provider_brewer_name").notNull(),
  providerCatalogVerified: boolean("provider_catalog_verified").notNull(),
  providerBrewerVerified: boolean("provider_brewer_verified").notNull(),
  providerLastModified: timestamp("provider_last_modified", { withTimezone: true }).notNull(),
  discoveredAt: timestamp("discovered_at", { withTimezone: true }).notNull().defaultNow(),
  status: beerBrandCandidateStatus("status").notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNote: text("review_note"),
}, (table) => [uniqueIndex("beer_brand_candidates_brand_provider_unique").on(table.countryBeerBrandId, table.provider), index("beer_brand_candidates_status_idx").on(table.status)]);

export const fixtures = pgTable("fixtures", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: text("source_id").notNull(),
  providerStatus: text("provider_status"),
  sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true }),
  competitionId: uuid("competition_id").notNull().references(() => competitions.id),
  venueId: uuid("venue_id").references(() => venues.id),
  kickoffAt: timestamp("kickoff_at", { withTimezone: true }).notNull(),
  kickoffDate: date("kickoff_date").notNull(), // local match calendar date, used for trip matching
  timezone: text("timezone").notNull().default("Europe/London"),
  homeTeamProviderId: text("home_team_provider_id"),
  awayTeamProviderId: text("away_team_provider_id"),
  homeTeamCrestUrl: text("home_team_crest_url"),
  awayTeamCrestUrl: text("away_team_crest_url"),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  city: text("city").notNull(),
  stadium: text("stadium").notNull(),
  officialTicketUrl: text("official_ticket_url"),
  status: fixtureStatus("status").notNull().default("tentative"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("fixtures_source_id_unique").on(table.sourceId),
  index("fixtures_date_status_competition_idx").on(table.kickoffDate, table.status, table.competitionId),
]);

export const draws = pgTable("draws", {
  id: uuid("id").defaultRandom().primaryKey(),
  shareToken: text("share_token").notNull().unique(),
  fixtureId: uuid("fixture_id").notNull().references(() => fixtures.id),
  resultSnapshot: jsonb("result_snapshot").$type<DrawResultSnapshot>().notNull(),
  tripStartDate: date("trip_start_date").notNull(),
  tripEndDate: date("trip_end_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [index("draws_share_token_idx").on(table.shareToken), index("draws_expires_at_idx").on(table.expiresAt)]);
