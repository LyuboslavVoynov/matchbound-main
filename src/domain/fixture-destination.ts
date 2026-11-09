/** Competition geography is not necessarily the stadium's destination (e.g. Welsh EFL clubs). */
export function fixtureDestination(country: string, competition: Readonly<{ country: string; areaFlagUrl: string | null }>) {
  return { country, countryFlagUrl: country === competition.country ? competition.areaFlagUrl : null };
}
