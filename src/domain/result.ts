import type { HeadToHeadSnapshot } from "./head-to-head";

export type DrawResultSnapshot = Readonly<{
  competition: string; country: string; homeTeam: string; awayTeam: string;
  kickoffDate: string; kickoffAt: string; timezone: string; stadium: string; city: string;
  officialTicketUrl: string | null;
  visualIdentity?: Readonly<{
    competitionEmblemUrl?: string;
    countryFlagUrl?: string;
    homeTeamCrestUrl?: string;
    awayTeamCrestUrl?: string;
  }>;
  headToHead?: HeadToHeadSnapshot;
  beerSignals?: Readonly<{
    cityAverage?: Readonly<{
      servingLabel: string;
      averagePriceMinor: number;
      currency: string;
      metricDefinition: string;
      /** Source update/observation time, retained so a share never overstates freshness. */
      observedAt: string;
    }>;
    countryBrand?: Readonly<{ countryName: string; brandName: string; originStatement?: string }>;
  }>;
}>;
