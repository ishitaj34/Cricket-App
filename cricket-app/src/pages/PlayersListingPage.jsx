import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPlayers, fetchCountries } from '../api/sportmonks';
import PlayerCard from '../components/PlayerCard';
import Loader from '../components/Loader';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function PlayersListingPage({ isMobileMenuOpen }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
      params.delete('page');
    } else {
      params.delete('search');
    }
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const {
    data: players = [],
    isLoading: pLoading,
    isError: pErr,
  } = useQuery({ queryKey: ['players'], queryFn: fetchPlayers });
  const { data: countries = [], isLoading: cLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  });

  const countryMap = useMemo(() => {
    const map = new Map();
    countries.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [countries]);

  const FilterOptions = useMemo(() => {
    const pos = new Set();
    const ts = new Set();
    players.forEach((p) => {
      if (p.position?.name) pos.add(p.position.name);
      if (p.career) p.career.forEach((c) => ts.add(c.type));
    });
    return {
      positions: Array.from(pos).sort(),
      tournamentTypes: Array.from(ts).sort(),
    };
  }, [players]);

  const activeCountry = searchParams.get('country') || '';
  const activePosition = searchParams.get('position') || '';
  const activeTourney = searchParams.get('tourney') || '';
  const activeSort = searchParams.get('sort') || 'firstname_asc';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const ITEMS_PER_PAGE = 12;

  const handleFilterChange = (key, val) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }

    // Only reset to page 1 if we are changing a filter/search, not if we are specifically navigating pages.
    if (key !== 'page') {
      params.delete('page');
    }

    setSearchParams(params);
  };


  /**
   * Processes the raw dataset based on four concurrent criteria:
   * 1. Fuzzy Name Search (Local State)
   * 2. Country/Team Filter (URL State)
   * 3. Role/Position Filter (URL State)
   * 4. Tournament/Format Filter (URL State - Requires nested career search)
   */
  const processedPlayers = useMemo(() => {
    let result = [...players];
    const q = searchParams.get('search')?.toLowerCase();

    // Filter by name (case-insensitive)
    if (q) {
      result = result.filter((p) => p.fullname?.toLowerCase().includes(q));
    }

    // Filter by specific squads/countries
    if (activeCountry) {
      result = result.filter((p) => countryMap.get(p.country_id) === activeCountry);
    }

    // Filter by player specialities (Batsman, Bowler, etc.)
    if (activePosition) {
      result = result.filter((p) => p.position?.name === activePosition);
    }

    // Advanced search through the player's career formats (ODI, T20I, Test)
    if (activeTourney) {
      result = result.filter((p) => p.career?.some((c) => c.type === activeTourney));
    }

    // Final sorting based on selected criteria
    const [sortKey, sortDir] = activeSort.split('_');
    result.sort((a, b) => {
      let valA, valB;
      if (sortKey === 'firstname') {
        valA = a.firstname || '';
        valB = b.firstname || '';
      } else if (sortKey === 'id') {
        valA = a.id;
        valB = b.id;
      } else if (sortKey === 'updatedAt') {
        valA = new Date(a.updated_at).getTime();
        valB = new Date(b.updated_at).getTime();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [players, searchParams, countryMap, activeCountry, activePosition, activeTourney, activeSort]);

  const sliceStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPlayers = processedPlayers.slice(sliceStart, sliceStart + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(processedPlayers.length / ITEMS_PER_PAGE) || 1;

  if (pErr) return <div className="error-banner">Failed to load players</div>;

  return (
    <div className="listing-layout">
      {/* SideNavBar / Filter Shell */}
      <aside className={`sidebar custom-scrollbar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-filters-container">
          <h3 className="sidebar-title" style={{ padding: '0 24px', fontSize: '0.625rem' }}>Scout Hub Filters</h3>
          <div className="sidebar-filters">
            {/* Search Input */}
            <div className="filter-group">
              <label className="filter-label">Search Name</label>
              <div className="search-wrapper">
                <span className="material-symbols-outlined search-icon">search</span>
                <input
                  type="text"
                  placeholder="e.g. Kohli"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="filter-group">
              <label className="filter-label">Country</label>
              <select
                value={activeCountry}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="filter-select"
              >
                <option value="">All Nations</option>
                {Array.from(countryMap.values())
                  .sort()
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Role</label>
              <select
                value={activePosition}
                onChange={(e) => handleFilterChange('position', e.target.value)}
                className="filter-select"
              >
                <option value="">All Roles</option>
                {FilterOptions.positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Tournament Type</label>
              <select
                value={activeTourney}
                onChange={(e) => handleFilterChange('tourney', e.target.value)}
                className="filter-select"
              >
                <option value="">All Formats</option>
                {FilterOptions.tournamentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearchParams(new URLSearchParams());
                setSearchInput('');
              }}
              className="reset-btn"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* SideNav Hubs */}
        <nav className="nav-list sidebar-nav">
          <Link to="/" className="nav-item active">
            <span className="material-symbols-outlined">radar</span> Scouting Hub
          </Link>
          <Link to="/compare" className="nav-item">
            <span className="material-symbols-outlined">compare_arrows</span> Head-to-Head
          </Link>
          <div className="nav-item disabled" style={{ opacity: 0.3 }}>
            <span className="material-symbols-outlined">analytics</span> Analytics (Soon)
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-section">
        {/* Contextual Header */}
        <div className="top-header">
          <div>
            <div className="scouting-label">
              <span className="scouting-dot"></span>
              <span className="scouting-text">Scouting Database</span>
            </div>
            <h1 className="page-title">Active Roster</h1>
            <p className="page-subtitle">
              Found <span className="text-white">{processedPlayers.length}</span> matching your
              elite criteria
            </p>
          </div>

          <div className="sort-container">
            <span className="sort-label">Sort By</span>
            <select
              value={activeSort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="filter-select sort-select"
            >
              <option value="firstname_asc">First Name (A-Z)</option>
              <option value="firstname_desc">First Name (Z-A)</option>
              <option value="id_asc">ID (Low to High)</option>
              <option value="id_desc">ID (High to Low)</option>
              <option value="updatedAt_desc">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Player Grid (Bento Style) */}
        {pLoading || cLoading ? (
          <Loader text="Syncing Global Roster..." />
        ) : paginatedPlayers.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🏏</p>
            <p className="empty-text">No players matched your criteria</p>
            <button
              onClick={() => {
                setSearchParams(new URLSearchParams());
                setSearchInput('');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {paginatedPlayers.map((p) => (
              <PlayerCard key={p.id} player={p} countryName={countryMap.get(p.country_id)} />
            ))}
          </div>
        )}

        {/* Pagination Shell */}
        {totalPages > 1 && (
          <div className="pagination">
            <p className="page-info">
              Page <span>{currentPage}</span> of <span>{totalPages}</span>
            </p>
            <div className="page-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => handleFilterChange('page', currentPage - 1)}
                className="page-btn prev"
              >
                <span className="material-symbols-outlined">chevron_left</span> Previous
              </button>

              <div className="page-dots">
                <span className={`page-dot ${currentPage === 1 ? 'active' : ''}`}></span>
                <span
                  className={`page-dot ${currentPage > 1 && currentPage < totalPages ? 'active' : ''}`}
                ></span>
                <span
                  className={`page-dot ${currentPage === totalPages && totalPages > 1 ? 'active' : ''}`}
                ></span>
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => handleFilterChange('page', currentPage + 1)}
                className="page-btn next"
              >
                Next <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
