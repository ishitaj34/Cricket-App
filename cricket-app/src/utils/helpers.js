/**
 * Common image fallback URL
 */
export const FALLBACK_IMAGE = 'https://cdn.sportmonks.com/images/cricket/placeholder.png';

/**
 * Normalizes country strings and returns an emoji flag.
 * @param {string} countryName 
 * @returns {string} flag emoji
 */
export const getFlagEmoji = (countryName) => {
  const flags = {
    'Australia': '🇦🇺',
    'India': '🇮🇳',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Pakistan': '🇵🇰',
    'New Zealand': '🇳🇿',
    'South Africa': '🇿🇦',
    'West Indies': '🏝️',
    'Sri Lanka': '🇱🇰',
    'Bangladesh': '🇧🇩',
    'Afghanistan': '🇦🇫',
    'Ireland': '🇮🇪',
    'Zimbabwe': '🇿🇼',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Netherlands': '🇳🇱'
  };
  return flags[countryName] || '🏴';
};

/**
 * Calculates percentage difference between two values.
 */
export const getPercentDiff = (val1, val2) => {
  const v1 = parseFloat(val1) || 0;
  const v2 = parseFloat(val2) || 0;
  if (v1 === 0 && v2 === 0) return '0.0';
  return Math.abs(v1 - v2).toFixed(1);
};
