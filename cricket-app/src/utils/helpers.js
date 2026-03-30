export const FALLBACK_IMAGE = '/placeholder-player.svg';
export const STADIUM_HERO = '/stadium-hero.svg';

/**
 * Converts an ISO 3166-1 alpha-2 country code pair into a flag emoji.
 * Uses the regional indicator symbol technique which is Unicode-safe
 * and avoids storing special/bidirectional characters in source.
 *
 * @param {string} countryName - Human-readable country name.
 * @returns {string} Flag emoji, or a default flag if unmapped.
 */
export const getFlagEmoji = (countryName) => {
  // Map country names to ISO 3166-1 alpha-2 codes
  const countryCodeMap = {
    Australia: 'AU',
    India: 'IN',
    England: 'GB',
    Pakistan: 'PK',
    'New Zealand': 'NZ',
    'South Africa': 'ZA',
    'West Indies': 'JM',
    'Sri Lanka': 'LK',
    Bangladesh: 'BD',
    Afghanistan: 'AF',
    Ireland: 'IE',
    Zimbabwe: 'ZW',
    Scotland: 'GB',
    Netherlands: 'NL',
  };

  const code = countryCodeMap[countryName];
  if (!code) return '\u{1F3F4}'; // default black flag

  // Convert country code to regional indicator symbols
  return String.fromCodePoint(...code.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
};

/**
 * Calculates the percentage difference between two numeric values.
 *
 * Formula: |v1 - v2| / ((v1 + v2) / 2) * 100
 * This gives a symmetrical percentage difference used in the comparison engine.
 *
 * @param {number|string} val1 - First value.
 * @param {number|string} val2 - Second value.
 * @returns {string} Formatted percentage string.
 */
export const getPercentDiff = (val1, val2) => {
  const v1 = parseFloat(val1) || 0;
  const v2 = parseFloat(val2) || 0;

  if (v1 === 0 && v2 === 0) return '0.0';

  const avg = (v1 + v2) / 2;
  if (avg === 0) return '0.0';

  return ((Math.abs(v1 - v2) / avg) * 100).toFixed(1);
};

/**
 * Aggregates a player's career stats by format type (T20I, ODI, Test, etc.).
 *
 * The SportMonks API returns career entries PER SEASON, not as lifetime totals.
 * E.g., Dhoni has 10+ separate ODI entries (one per season), each showing ~5 matches.
 * This function sums them into a single object per format.
 *
 * @param {Array} career - The player.career array from the API.
 * @returns {Array} Aggregated career entries, one per unique type.
 */
export const aggregateCareerByType = (career) => {
  if (!career || career.length === 0) return [];

  const grouped = {};

  career.forEach((entry) => {
    const type = entry.type;
    if (!grouped[type]) {
      grouped[type] = {
        type,
        season_id: entry.season_id,
        batting: null,
        bowling: null,
      };
    }

    // Aggregate batting stats
    if (entry.batting) {
      if (!grouped[type].batting) {
        grouped[type].batting = { ...entry.batting };
      } else {
        const agg = grouped[type].batting;
        agg.matches = (agg.matches || 0) + (entry.batting.matches || 0);
        agg.innings = (agg.innings || 0) + (entry.batting.innings || 0);
        agg.runs_scored = (agg.runs_scored || 0) + (entry.batting.runs_scored || 0);
        agg.not_outs = (agg.not_outs || 0) + (entry.batting.not_outs || 0);
        agg.hundreds = (agg.hundreds || 0) + (entry.batting.hundreds || 0);
        agg.fifties = (agg.fifties || 0) + (entry.batting.fifties || 0);
        agg.four_x = (agg.four_x || 0) + (entry.batting.four_x || 0);
        agg.six_x = (agg.six_x || 0) + (entry.batting.six_x || 0);
        agg.balls_faced = (agg.balls_faced || 0) + (entry.batting.balls_faced || 0);

        // Recalculate derived stats
        if (entry.batting.highest_inning_score > (agg.highest_inning_score || 0)) {
          agg.highest_inning_score = entry.batting.highest_inning_score;
        }
        const dismissals = agg.innings - agg.not_outs;
        agg.average = dismissals > 0 ? parseFloat((agg.runs_scored / dismissals).toFixed(2)) : 0;
        agg.strike_rate =
          agg.balls_faced > 0
            ? parseFloat(((agg.runs_scored / agg.balls_faced) * 100).toFixed(2))
            : 0;
      }
    }

    // Aggregate bowling stats
    if (entry.bowling) {
      if (!grouped[type].bowling) {
        grouped[type].bowling = { ...entry.bowling };
      } else {
        const agg = grouped[type].bowling;
        agg.matches = (agg.matches || 0) + (entry.bowling.matches || 0);
        agg.innings = (agg.innings || 0) + (entry.bowling.innings || 0);
        agg.overs = (agg.overs || 0) + (entry.bowling.overs || 0);
        agg.runs = (agg.runs || 0) + (entry.bowling.runs || 0);
        agg.wickets = (agg.wickets || 0) + (entry.bowling.wickets || 0);
        agg.medians = (agg.medians || 0) + (entry.bowling.medians || 0);

        // Recalculate derived bowling stats
        agg.average = agg.wickets > 0 ? parseFloat((agg.runs / agg.wickets).toFixed(2)) : 0;
        agg.econ_rate = agg.overs > 0 ? parseFloat((agg.runs / agg.overs).toFixed(2)) : 0;
        agg.strike_rate =
          agg.wickets > 0 ? parseFloat(((agg.overs * 6) / agg.wickets).toFixed(2)) : 0;
      }
    }
  });

  return Object.values(grouped);
};

/**
 * Returns a single grand-total stats object across ALL formats.
 *
 * aggregateCareerByType gives [{ type: 'T20I', ... }, { type: 'ODI', ... }].
 * This function sums those into one combined object so we can show
 * "Total Matches: 350" instead of just one format's count.
 *
 * @param {Array} career - The player.career array from the API.
 * @returns {{ matches: number, runs: number, average: number, strikeRate: number, highest: number, wickets: number }}
 */
export const getTotalCareerStats = (career) => {
  const aggregated = aggregateCareerByType(career);

  let totalMatches = 0;
  let totalRuns = 0;
  let totalBallsFaced = 0;
  let totalInnings = 0;
  let totalNotOuts = 0;
  let highest = 0;
  let totalWickets = 0;

  aggregated.forEach((entry) => {
    if (entry.batting) {
      totalMatches += entry.batting.matches || 0;
      totalRuns += entry.batting.runs_scored || 0;
      totalBallsFaced += entry.batting.balls_faced || 0;
      totalInnings += entry.batting.innings || 0;
      totalNotOuts += entry.batting.not_outs || 0;
      if ((entry.batting.highest_inning_score || 0) > highest) {
        highest = entry.batting.highest_inning_score;
      }
    }
    if (entry.bowling) {
      totalWickets += entry.bowling.wickets || 0;
      // Use bowling.matches only if no batting.matches (to avoid double-counting)
      if (!entry.batting?.matches) {
        totalMatches += entry.bowling.matches || 0;
      }
    }
  });

  const dismissals = totalInnings - totalNotOuts;
  const average = dismissals > 0 ? parseFloat((totalRuns / dismissals).toFixed(2)) : 0;
  const strikeRate =
    totalBallsFaced > 0 ? parseFloat(((totalRuns / totalBallsFaced) * 100).toFixed(2)) : 0;

  return {
    matches: totalMatches,
    runs: totalRuns,
    average,
    strikeRate,
    highest,
    wickets: totalWickets,
  };
};
