import { expandedLeagueVenues } from "./expanded-league-venues";

/**
 * Provider roster snapshot reviewed alongside the venue registry on 2026-10-05.
 * A renamed/replaced provider team is deliberately a sync blocker until reviewed.
 */
export const REVIEWED_TEAM_NAMES: Readonly<Record<number, string>> = {
  ...Object.fromEntries(expandedLeagueVenues.map(venue => [venue.providerTeamId, venue.teamName])),
  1: "1. FC Köln", 2: "TSG 1899 Hoffenheim", 3: "Bayer 04 Leverkusen", 4: "Borussia Dortmund", 5: "FC Bayern München", 6: "FC Schalke 04", 7: "Hamburger SV", 10: "VfB Stuttgart", 12: "SV Werder Bremen", 15: "1. FSV Mainz 05", 16: "FC Augsburg", 17: "SC Freiburg", 18: "Borussia Mönchengladbach", 19: "Eintracht Frankfurt", 28: "1. FC Union Berlin", 29: "SC Paderborn 07", 57: "Arsenal FC", 58: "Aston Villa FC", 61: "Chelsea FC", 62: "Everton FC", 63: "Fulham FC", 64: "Liverpool FC", 65: "Manchester City FC", 66: "Manchester United FC", 67: "Newcastle United FC", 71: "Sunderland AFC", 73: "Tottenham Hotspur FC", 77: "Athletic Club", 78: "Club Atlético de Madrid", 79: "CA Osasuna", 80: "RCD Espanyol de Barcelona", 81: "FC Barcelona", 82: "Getafe CF", 84: "Málaga CF", 86: "Real Madrid CF", 87: "Rayo Vallecano de Madrid", 88: "Levante UD", 90: "Real Betis Balompié", 92: "Real Sociedad de Fútbol", 94: "Villarreal CF", 95: "Valencia CF", 98: "AC Milan", 99: "ACF Fiorentina", 100: "AS Roma", 102: "Atalanta BC", 103: "Bologna FC 1909", 104: "Cagliari Calcio", 107: "Genoa CFC", 108: "FC Internazionale Milano", 109: "Juventus FC", 110: "SS Lazio", 112: "Parma Calcio 1913", 113: "SSC Napoli", 115: "Udinese Calcio", 263: "Deportivo Alavés", 285: "Elche CF", 322: "Hull City AFC", 341: "Leeds United FC", 349: "Ipswich Town FC", 351: "Nottingham Forest FC", 354: "Crystal Palace FC", 397: "Brighton & Hove Albion FC", 402: "Brentford FC", 454: "Venezia FC", 470: "Frosinone Calcio", 471: "US Sassuolo Calcio", 511: "Toulouse FC", 512: "Stade Brestois 29", 516: "Olympique de Marseille", 519: "AJ Auxerre", 521: "Lille OSC", 522: "OGC Nice", 523: "Olympique Lyonnais", 524: "Paris Saint-Germain FC", 525: "FC Lorient", 529: "Stade Rennais FC 1901", 531: "ES Troyes AC", 532: "Angers SCO", 533: "Le Havre AC", 535: "Le Mans FC", 546: "Racing Club de Lens", 548: "AS Monaco FC", 558: "RC Celta de Vigo", 559: "Sevilla FC", 560: "RC Deportivo La Coruña", 576: "RC Strasbourg Alsace", 586: "Torino FC", 719: "SV 07 Elversberg", 721: "RB Leipzig", 1044: "AFC Bournemouth", 1045: "Paris FC", 1076: "Coventry City FC", 5335: "Real Racing Club de Santander", 5890: "US Lecce", 5911: "AC Monza", 7397: "Como 1907",
};

/** Exact competition membership reviewed for this season; partial or mixed rosters fail closed. */
export const REVIEWED_ROSTER_SEASON = 2026;
export const REVIEWED_COMPETITION_TEAM_IDS: Readonly<Record<string, readonly number[]>> = {
  PL: [57, 58, 61, 62, 63, 64, 65, 66, 67, 71, 73, 322, 341, 349, 351, 354, 397, 402, 1044, 1076],
  PD: [77, 78, 79, 80, 81, 82, 84, 86, 87, 88, 90, 92, 94, 95, 263, 285, 558, 559, 560, 5335],
  BL1: [1, 2, 3, 4, 5, 6, 7, 10, 12, 15, 16, 17, 18, 19, 28, 29, 719, 721],
  SA: [98, 99, 100, 102, 103, 104, 107, 108, 109, 110, 112, 113, 115, 454, 470, 471, 586, 5890, 5911, 7397],
  FL1: [511, 512, 516, 519, 521, 522, 523, 524, 525, 529, 531, 532, 533, 535, 546, 548, 576, 1045],
  ELC: expandedLeagueVenues.filter(venue => venue.competitionCode === "ELC").map(venue => venue.providerTeamId),
  DED: expandedLeagueVenues.filter(venue => venue.competitionCode === "DED").map(venue => venue.providerTeamId),
  PPL: expandedLeagueVenues.filter(venue => venue.competitionCode === "PPL").map(venue => venue.providerTeamId),
};
