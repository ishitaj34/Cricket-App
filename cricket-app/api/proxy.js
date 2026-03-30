/**
 * Vercel Serverless Proxy for SportMonks API.
 *
 * Injects the API token server-side so it is never exposed in the
 * browser bundle. The client calls `/api-proxy/…` which this function
 * rewrites to the real SportMonks endpoint with the secret attached.
 */
export default async function handler(req, res) {
  try {
    const forwardPath = req.url.replace(/^\/api-proxy/, '');
    const url = new URL(forwardPath, 'https://cricket.sportmonks.com/api/v2.0');

    // Inject the server-only token
    url.searchParams.set('api_token', process.env.SPORTMONKS_API_TOKEN);

    const response = await fetch(url.toString());
    const data = await response.json();

    // Forward cache-control headers if present
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) {
      res.setHeader('Cache-Control', cacheControl);
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data from SportMonks API' });
  }
}
