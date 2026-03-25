import axios from 'axios';

/**
 * Scout Hub SportMonks API Service
 * 
 * Handles all network requests to the SportMonks Cricket API.
 * Employs a Vite proxy (/api) for development to avoid CORS issues.
 */

const apiToken = import.meta.env.VITE_SPORTMONKS_API_TOKEN;

const apiClient = axios.create({
  baseURL: '/api/v2.0',
  params: {
    api_token: apiToken
  }
});

/**
 * Fetches all players along with their career statistics.
 * NOTE: The career inclusion significantly increases payload size (approx. 80MB)
 * but is necessary for detailed tournament-type filtering required by current specs.
 *
 * @returns {Promise<Array>} Array of player objects with nested career data.
 */
export const fetchPlayers = async () => {
  const { data } = await apiClient.get('/players', {
    params: {
      include: 'career',
    },
  });
  return data.data;
};

/**
 * Fetches the global list of countries.
 * Used for mapping country_id on player objects to human-readable names and flags.
 *
 * @returns {Promise<Array>} Array of country objects.
 */
export const fetchCountries = async () => {
  const { data } = await apiClient.get('/countries');
  return data.data;
};

/**
 * Fetches available player positions (roles).
 *
 * @returns {Promise<Array>} Array of position objects (e.g., Bowler, Batsman).
 */
export const fetchPositions = async () => {
  const { data } = await apiClient.get('/positions');
  return data.data;
};
