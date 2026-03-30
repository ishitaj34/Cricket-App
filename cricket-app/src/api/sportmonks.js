import axios from 'axios';

/**
 * Scout Hub SportMonks API Service
 *
 * Handles all network requests to the SportMonks Cricket API.
 * - In development: Uses the Vite proxy (/api) to avoid CORS issues.
 * - In production: Uses the Vercel serverless proxy (/api-proxy) so the
 *   API token stays server-side and never reaches the browser.
 *
 * Implements IndexedDB-based caching so that large datasets (players ~80MB)
 * are persisted across page refreshes and don't require re-fetching every
 * time the user visits.
 */

const isDev = import.meta.env.DEV;

/**
 * Both Vite (dev) and Vercel (prod) proxies are now configured
 * to inject the API token on the server-side. The client
 * never needs to know or touch the token.
 */
const apiClient = axios.create({
  baseURL: isDev ? '/api/v2.0' : '/api-proxy',
});

// IndexedDB Cache Layer
const DB_NAME = 'ScoutHubCache';
const DB_VERSION = 1;
const STORE_NAME = 'apiCache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Opens (or creates) the IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
function openCacheDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Reads a cached value from IndexedDB.
 * Returns null if missing or expired.
 *
 * @param {string} key - Cache key (e.g. 'players', 'countries').
 * @returns {Promise<*|null>}
 */
async function getCached(key) {
  try {
    const db = await openCacheDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const entry = req.result;
        if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
          resolve(entry.data);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Writes a value to the IndexedDB cache with a timestamp.
 *
 * @param {string} key - Cache key.
 * @param {*} data - Data to cache.
 */
async function setCache(key, data) {
  try {
    const db = await openCacheDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key, data, timestamp: Date.now() });
  } catch {
    // Silently fail
  }
}

// API Functions

/**
 * Fetches all players along with their career statistics.
 * Checks IndexedDB first; falls back to network.
 *
 * @returns {Promise<Array>} Array of player objects with nested career data.
 */
export const fetchPlayers = async () => {
  const cached = await getCached('players');
  if (cached) return cached;

  const { data } = await apiClient.get('/players', {
    params: { include: 'career' },
  });

  const players = data.data;
  await setCache('players', players);
  return players;
};

/**
 * Fetches the global list of countries.
 * Used for mapping country_id on player objects to human-readable names and flags.
 *
 * @returns {Promise<Array>} Array of country objects.
 */
export const fetchCountries = async () => {
  const cached = await getCached('countries');
  if (cached) return cached;

  const { data } = await apiClient.get('/countries');

  const countries = data.data;
  await setCache('countries', countries);
  return countries;
};
