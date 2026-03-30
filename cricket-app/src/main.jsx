import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.jsx';

/**
 * React Query Configuration
 *
 * staleTime: Infinity — Prevents re-fetching from the API while the tab
 *   is open. Since we cache player data in IndexedDB (see sportmonks.js),
 *   data is already persisted across page refreshes. Setting staleTime to
 *   Infinity means React Query won't trigger unnecessary network requests
 *   when components re-mount or the user navigates between pages.
 *
 * gcTime: Infinity — Prevents React Query from garbage-collecting the
 *   in-memory cache when a query has no active observers. Without this,
 *   navigating away from the listing page would discard the data and force
 *   a fresh IndexedDB read (or worse, an API call) on return.
 *
 * Why IndexedDB over localStorage?
 *   The player dataset (with career includes) is ~80MB of JSON.
 *   localStorage has a 5-10MB limit and is synchronous (blocks the main
 *   thread). IndexedDB supports large payloads asynchronously and is
 *   purpose-built for structured data storage in the browser.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
