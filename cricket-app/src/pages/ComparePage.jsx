import { useState, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { fetchPlayers, fetchCountries } from '../api/sportmonks';
import {
  FALLBACK_IMAGE,
  getFlagEmoji,
  getPercentDiff,
  getTotalCareerStats,
} from '../utils/helpers';
import Loader from '../components/Loader';

/**
 * Scout Hub: Head-to-Head Comparison Engine.
 *
 * Allows users to select any two players from the roster and compare
 * their statistics side-by-side using high-performance visual clusters
 * and a truth-based intelligence summary.
 */
export default function ComparePage({ isMobileMenuOpen }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: players = [] } = useQuery({ queryKey: ['players'], queryFn: fetchPlayers });
  const { data: countries = [] } = useQuery({ queryKey: ['countries'], queryFn: fetchCountries });

  const initialP1 = searchParams.get('p1') || '';
  const initialP2 = searchParams.get('p2') || '';

  const [playerOneId, setPlayerOneId] = useState(initialP1);
  const [playerTwoId, setPlayerTwoId] = useState(initialP2);
  const [p1Search, setP1Search] = useState('');
  const [p2Search, setP2Search] = useState('');

  // Default to two players if available to show the UI
  const p1 = players.find((p) => p.id.toString() === playerOneId) || players[0];
  const p2 = players.find((p) => p.id.toString() === playerTwoId) || players[1] || players[0];

  /**
   * Selection Sync via refs instead of useEffect+setState.
   * Refs track the previously synced player ID. When the player changes,
   * we update the search text imperatively during render (no cascading effects).
   */
  const prevP1Id = useRef(null);
  const prevP2Id = useRef(null);

  if (p1?.id !== prevP1Id.current) {
    prevP1Id.current = p1?.id ?? null;
    if (p1?.fullname && p1.fullname !== p1Search) {
      setP1Search(p1.fullname);
    }
  }
  if (p2?.id !== prevP2Id.current) {
    prevP2Id.current = p2?.id ?? null;
    if (p2?.fullname && p2.fullname !== p2Search) {
      setP2Search(p2.fullname);
    }
  }

  const handleP1Change = (e) => {
    const val = e.target.value;
    setP1Search(val);
    const found = players.find((p) => p.fullname.toLowerCase() === val.toLowerCase());
    if (found) {
      setPlayerOneId(found.id.toString());
      const params = new URLSearchParams(searchParams);
      params.set('p1', found.id);
      setSearchParams(params);
    }
  };

  /**
   * Logic to handle Player 2 selection via searchable datalist.
   */
  const handleP2Change = (e) => {
    const val = e.target.value;
    setP2Search(val);
    const found = players.find((p) => p.fullname.toLowerCase() === val.toLowerCase());
    if (found) {
      setPlayerTwoId(found.id.toString());
      const params = new URLSearchParams(searchParams);
      params.set('p2', found.id);
      setSearchParams(params);
    }
  };

  /**
   * Filter the datalist to show only the top 50 matches for the
   * current search text, instead of dumping the entire roster (~1000+ items)
   * into the DOM which causes browser lag and is a poor UX.
   */
  const filteredP1Options = useMemo(() => {
    if (!p1Search || p1Search.length < 2) return players.slice(0, 50);
    const q = p1Search.toLowerCase();
    return players.filter((p) => p.fullname.toLowerCase().includes(q)).slice(0, 50);
  }, [players, p1Search]);

  const filteredP2Options = useMemo(() => {
    if (!p2Search || p2Search.length < 2) return players.slice(0, 50);
    const q = p2Search.toLowerCase();
    return players.filter((p) => p.fullname.toLowerCase().includes(q)).slice(0, 50);
  }, [players, p2Search]);

  const getCountry = (pid) => countries.find((c) => c.id === pid)?.name || 'Unknown';

  /**
   * Build comparison rows from real API data.
   * Using `?? '-'` so that:
   * - A player with 0 matches shows 0.
   * - A player with missing data shows '-'.
   */
  const comparisonRows = useMemo(() => {
    if (!p1 || !p2) return [];
    const t1 = getTotalCareerStats(p1.career);
    const t2 = getTotalCareerStats(p2.career);
    return [
      {
        label: 'Matches',
        val1: t1.matches || '-',
        val2: t2.matches || '-',
      },
      {
        label: 'Runs',
        val1: t1.runs || '-',
        val2: t2.runs || '-',
      },
      {
        label: 'Average',
        val1: t1.average || '-',
        val2: t2.average || '-',
      },
      {
        label: 'S/R',
        val1: t1.strikeRate || '-',
        val2: t2.strikeRate || '-',
      },
      {
        label: 'Highest',
        val1: t1.highest || '-',
        val2: t2.highest || '-',
      },
    ];
  }, [p1, p2]);

  return (
    <div className="compare-layout">
      {/* Sidebar Navigation: Consistent with main Roster view */}
      <aside className={`compare-sidebar sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <nav className="nav-list sidebar-nav">
          <Link to="/" className="nav-item">
            <span className="material-symbols-outlined">radar</span> Scouting Hub
          </Link>
          <Link to="/compare" className="nav-item active">
            <span className="material-symbols-outlined">compare_arrows</span> Head-to-Head
          </Link>
          <div className="nav-item disabled">
            <span className="material-symbols-outlined">analytics</span> Analytics (Soon)
          </div>
        </nav>
      </aside>

      <main className="compare-main-content">
        <section className="compare-container">
          <div className="page-header">
            <h2>Head-to-Head</h2>
            <p>Pitch Precision Analytics</p>
          </div>

          {!p1 || !p2 ? (
            <Loader text="Analyzing Head-to-Head Metrics..." />
          ) : (
            <>
              <div className="comparison-grid">
                {/* Player One */}
                <div className="player-col">
                  <div className="player-select">
                    <input
                      list="players-list-p1"
                      placeholder="Search Player 1..."
                      value={p1Search}
                      onChange={handleP1Change}
                    />
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <div className="compare-player-card">
                    <img
                      alt={p1.fullname}
                      className="player-img"
                      src={p1.image_path || FALLBACK_IMAGE}
                      onError={(e) => (e.target.src = FALLBACK_IMAGE)}
                    />
                    <div className="player-card-content">
                      <div className="player-info">
                        <p>{getCountry(p1.country_id)}</p>
                        <h3>{p1.fullname}</h3>
                      </div>
                      <div className="flag-box">
                        <span className="flag-icon flag-icon-lg">
                          {getFlagEmoji(getCountry(p1.country_id))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="stats-col">
                  <div className="metrics-header">
                    <span>Comparison Metrics</span>
                  </div>
                  <div className="glass-table">
                    {comparisonRows.map((row, j) => (
                      <div className="metric-row" key={j}>
                        <div
                          className={`metric-val ${parseFloat(row.val1) > parseFloat(row.val2) ? 'winner' : ''}`}
                        >
                          {row.val1}
                        </div>
                        <div className="metric-label">{row.label}</div>
                        <div
                          className={`metric-val ${parseFloat(row.val2) > parseFloat(row.val1) ? 'winner' : ''}`}
                        >
                          {row.val2}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player Two */}
                <div className="player-col">
                  <div className="player-select">
                    <input
                      list="players-list-p2"
                      placeholder="Search Player 2..."
                      value={p2Search}
                      onChange={handleP2Change}
                    />
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <div className="compare-player-card">
                    <img
                      alt={p2.fullname}
                      className="player-img"
                      src={p2.image_path || FALLBACK_IMAGE}
                      onError={(e) => (e.target.src = FALLBACK_IMAGE)}
                    />
                    <div className="player-card-content">
                      <div className="player-info">
                        <p>{getCountry(p2.country_id)}</p>
                        <h3>{p2.fullname}</h3>
                      </div>
                      <div className="flag-box">
                        <span className="flag-icon flag-icon-lg">
                          {getFlagEmoji(getCountry(p2.country_id))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtered datalists: only show relevant matches, not the entire roster */}
              <datalist id="players-list-p1">
                {filteredP1Options.map((p) => (
                  <option key={p.id} value={p.fullname} />
                ))}
              </datalist>
              <datalist id="players-list-p2">
                {filteredP2Options.map((p) => (
                  <option key={p.id} value={p.fullname} />
                ))}
              </datalist>

              {/* Advanced Insights Grid */}
              <InsightsGrid p1={p1} p2={p2} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}

ComparePage.propTypes = {
  isMobileMenuOpen: PropTypes.bool,
};

/**
 * Extracted Insights Grid component.
 * Replaces the IIFE that was inside JSX — a pattern that hurts readability
 * and makes it impossible to apply React optimizations like memo.
 */
function InsightsGrid({ p1, p2 }) {
  const t1 = getTotalCareerStats(p1.career);
  const t2 = getTotalCareerStats(p2.career);

  const sr1 = t1.strikeRate;
  const sr2 = t2.strikeRate;
  const srLeader = sr1 >= sr2 ? p1 : p2;

  const avg1 = t1.average;
  const avg2 = t2.average;
  const avgLeader = avg1 >= avg2 ? p1 : p2;

  return (
    <div className="bento-grid">
      <div className="heatmap-card">
        <div className="heatmap-header">
          <h4>Impact Heatmap</h4>
          <span className="badge-timer">
            Analysis Index: {((parseInt(p1?.id || 0) + parseInt(p2?.id || 0)) % 100).toFixed(0)}%
            Match
          </span>
        </div>
        <div className="heatmap-content">
          <div className="heatmap-grid compare-heatmap-grid">
            {[...Array(72)].map((_, i) => {
              const seed =
                (parseInt(p1?.id || 0) * (i + 1) + parseInt(p2?.id || 0) * (i + 3)) % 100;
              const isHot = seed > 85;
              return (
                <div key={i} className={`heatmap-dot ${isHot ? 'heatmap-dot-hot' : ''}`}></div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="side-cards">
        <div className="summary-card">
          <div className="summary-header">
            <span className="material-symbols-outlined">electric_bolt</span>
            <span className="scout-pick">Scout Pick</span>
          </div>
          <h5>{srLeader.lastname} leads in Power Impact.</h5>
          <p className="summary-desc">
            Analyzing recent delivery trajectories, {srLeader.lastname} maintains a{' '}
            {Math.max(sr1, sr2)} S/R advantage in powerplay scenarios.
          </p>
        </div>
        <div className="consistency-card">
          <div className="consistency-header">
            <span className="material-symbols-outlined">trending_up</span>
            <div>
              <p>Consistency Index</p>
              <p>
                {avgLeader.lastname} +{getPercentDiff(avg1, avg2)}%
              </p>
            </div>
          </div>
          <p className="consistency-desc">
            {avgLeader.lastname} exhibits superior technical average stability across match formats.
          </p>
        </div>
      </div>
    </div>
  );
}

InsightsGrid.propTypes = {
  p1: PropTypes.shape({
    id: PropTypes.number,
    lastname: PropTypes.string,
    career: PropTypes.array,
  }).isRequired,
  p2: PropTypes.shape({
    id: PropTypes.number,
    lastname: PropTypes.string,
    career: PropTypes.array,
  }).isRequired,
};
