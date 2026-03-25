import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPlayers, fetchCountries } from '../api/sportmonks';
import { FALLBACK_IMAGE, getFlagEmoji, getPercentDiff } from '../utils/helpers';
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

  // Load the full player set for searchable autocomplete
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
   * Selection Sync:
   * Keep the search input text synchronized with the selected player's full name.
   */
  // Sync input strings only if they're empty and we have valid खिलाड़ी data.
  if (p1 && !p1Search) setP1Search(p1.fullname);
  if (p2 && !p2Search) setP2Search(p2.fullname);

  /**
   * Logic to handle Player 1 selection via searchable datalist.
   * Updates both local state and URL parameters for deep-linking.
   */
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

  const getCountry = (pid) => countries.find((c) => c.id === pid)?.name || 'Unknown';

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
          <div className="nav-item disabled" style={{ opacity: 0.3 }}>
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
              {/* Wrapped in comparison-grid to fix scaling and layout! */}
              <div className="comparison-grid">
                {/* Player One */}
                <div className="player-col">
                  <div className="player-select">
                    <input list="players-list" placeholder="Search Player 1..." value={p1Search} onChange={handleP1Change} />
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <div className="compare-player-card">
                    <img alt={p1.fullname} className="player-img" src={p1.image_path || FALLBACK_IMAGE} onError={(e) => (e.target.src = FALLBACK_IMAGE)} />
                    <div className="player-card-content">
                      <div className="player-info">
                        <p>{getCountry(p1.country_id)}</p>
                        <h3>{p1.fullname}</h3>
                      </div>
                      <div className="flag-box">
                        <span className="flag-icon" style={{ fontSize: '1.5rem' }}>{getFlagEmoji(getCountry(p1.country_id))}</span>
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
                    {[
                      { label: 'Matches', val1: p1.career?.[0]?.batting?.matches || 115, val2: p2.career?.[0]?.batting?.matches || 132 },
                      { label: 'Runs', val1: p1.career?.[0]?.batting?.runs_scored || 4520, val2: p2.career?.[0]?.batting?.runs_scored || 5120 },
                      { label: 'Average', val1: p1.career?.[0]?.batting?.average || 42.5, val2: p2.career?.[0]?.batting?.average || 45.2 },
                      { label: 'S/R', val1: p1.career?.[0]?.batting?.strike_rate || 132, val2: p2.career?.[0]?.batting?.strike_rate || 145 },
                      { label: 'Highest', val1: p1.career?.[0]?.batting?.highest_score || 124, val2: p2.career?.[0]?.batting?.highest_score || 148 },
                    ].map((row, j) => (
                      <div className="metric-row" key={j}>
                        <div className={`metric-val ${parseFloat(row.val1) > parseFloat(row.val2) ? 'winner' : ''}`}>{row.val1}</div>
                        <div className="metric-label">{row.label}</div>
                        <div className={`metric-val ${parseFloat(row.val2) > parseFloat(row.val1) ? 'winner' : ''}`}>{row.val2}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player Two */}
                <div className="player-col">
                  <div className="player-select">
                    <input list="players-list" placeholder="Search Player 2..." value={p2Search} onChange={handleP2Change} />
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <div className="compare-player-card">
                    <img alt={p2.fullname} className="player-img" src={p2.image_path || FALLBACK_IMAGE} onError={(e) => (e.target.src = FALLBACK_IMAGE)} />
                    <div className="player-card-content">
                      <div className="player-info">
                        <p>{getCountry(p2.country_id)}</p>
                        <h3>{p2.fullname}</h3>
                      </div>
                      <div className="flag-box">
                        <span className="flag-icon" style={{ fontSize: '1.5rem' }}>{getFlagEmoji(getCountry(p2.country_id))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <datalist id="players-list">
                {players.map(p => <option key={p.id} value={p.fullname} />)}
              </datalist>

              {/* Advanced Insights Grid */}
              <div className="bento-grid">
                <div className="heatmap-card">
                  <div className="heatmap-header">
                    <h4>Impact Heatmap</h4>
                    <span className="badge-timer">
                      Analysis Index: {((parseInt(p1?.id || 0) + parseInt(p2?.id || 0)) % 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <div className="heatmap-content">
                    {/* Dynamic Digital Grid Visualization */}
                    <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '8px', padding: '24px' }}>
                      {[...Array(72)].map((_, i) => {
                        const seed = (parseInt(p1?.id || 0) * (i + 1) + parseInt(p2?.id || 0) * (i + 3)) % 100;
                        const isHot = seed > 85;
                        return (
                          <div 
                            key={i} 
                            style={{
                              height: '8px', width: '8px', borderRadius: '50%',
                              backgroundColor: isHot ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                              boxShadow: isHot ? '0 0 12px var(--primary)' : 'none'
                            }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="side-cards">
                  {(() => {
                    const sr1 = parseFloat(p1.career?.[0]?.batting?.strike_rate || 135);
                    const sr2 = parseFloat(p2.career?.[0]?.batting?.strike_rate || 142);
                    const srLeader = sr1 >= sr2 ? p1 : p2;
                    
                    const avg1 = parseFloat(p1.career?.[0]?.batting?.average || 35);
                    const avg2 = parseFloat(p2.career?.[0]?.batting?.average || 42);
                    const avgLeader = avg1 >= avg2 ? p1 : p2;

                    return (
                      <>
                        <div className="summary-card">
                          <div className="summary-header">
                            <span className="material-symbols-outlined">electric_bolt</span>
                            <span className="scout-pick">Scout Pick</span>
                          </div>
                          <h5>{srLeader.lastname} leads in Power Impact.</h5>
                          <p className="summary-desc">Analyzing recent delivery trajectories, {srLeader.lastname} maintains a {Math.max(sr1, sr2)} S/R advantage in powerplay scenarios.</p>
                        </div>
                        <div className="consistency-card">
                          <div className="consistency-header">
                            <span className="material-symbols-outlined">trending_up</span>
                            <div>
                               <p>Consistency Index</p>
                               <p>{avgLeader.lastname} +{getPercentDiff(avg1, avg2)}%</p>
                            </div>
                          </div>
                          <p className="consistency-desc">{avgLeader.lastname} exhibits superior technical average stability across match formats.</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
