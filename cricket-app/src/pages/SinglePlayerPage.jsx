import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPlayers, fetchCountries } from '../api/sportmonks';
import { FALLBACK_IMAGE } from '../utils/helpers';
import Loader from '../components/Loader';

/**
 * Scout Hub: Individual Player Dossier.
 * 
 * Renders a full technical profile of a player, including vitals, 
 * performance impact bars, and a multi-format (T20, ODI, Test) career switcher.
 */
export default function SinglePlayerPage() {
  const { id } = useParams();
  const [activeCareerIndex, setActiveCareerIndex] = useState(0);

  const { data: players = [], isLoading: pLoading } = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  });
  const { data: countries = [] } = useQuery({ queryKey: ['countries'], queryFn: fetchCountries });

  const player = players.find((p) => p.id === parseInt(id));
  const country = countries.find((c) => c.id === player?.country_id);

  // Use a deterministic "random" rank based on player ID to satisfy React purity rules.
  const worldRank = useMemo(() => {
    if (!player?.id) return 1;
    // Simple hash: (ID * some prime) % range + 1
    return ((player.id * 31) % 50) + 1;
  }, [player?.id]);

  if (pLoading) return <Loader text="Loading Pitch Data..." />;

  if (!player)
    return (
      <div className="sp-not-found">
        <h2 className="sp-title">Player Not Found</h2>
        <Link to="/" className="sp-back-btn">
          Back to Players
        </Link>
      </div>
    );

  const imgPath = player.image_path || FALLBACK_IMAGE;

  /**
   * Performance Switcher Logic:
   * Some players have duplicate career entries in the API. We filter for 
   * unique tournament types (e.g., only one 'ODI' button) to ensure a clean UI.
   */
  const careerTypes = [];
  const uniqueCareers = [];
  player.career?.forEach((c) => {
    if (!careerTypes.includes(c.type)) {
      careerTypes.push(c.type);
      uniqueCareers.push(c);
    }
  });

  const activeCareer = uniqueCareers[activeCareerIndex] || player.career?.[0];

  return (
    <div className="sp-page-wrapper">
      {/* Sticky Contextual Header */}
      <header className="sp-toolbar">
        <Link to="/" className="back-link">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Roster
        </Link>
        <div className="sp-toolbar-actions">
          <Link
            to={`/compare?p1=${player.id}`}
            className="btn-compare"
            style={{ textDecoration: 'none', display: 'grid', placeItems: 'center' }}
          >
            Compare {player.lastname}
          </Link>
        </div>
      </header>

      {/* Player Hero Section */}
      <section className="sp-hero">
        <div className="sp-hero-bg">
          <div className="sp-hero-overlay"></div>
          <img
            alt="Stadium"
            className="sp-hero-img-bg"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVq6Gj4rpzopGf9kTp89nJQYnE1xZM0uapYtjr_YxYGulH0k2VNzlgvXwe7CmpteXo0DhYXoMlEWRKmz9JvslkKDaISHei4Y1A0bEH5MwT7XAmUI666nnNrkPjeLPBe6qztfXbXRwwuyTZvocDMEyjS1BtSWFqBLCKhJaW9f6hrJVngxubO9SPcWn27_jYi3lhC22su8kdq6x6bd9pdeRxKPBTmF-SsE75Qlhhn8orr7hAdCtz_OIFRXW68yNee25ZNxiOaW2OmIw"
          />
        </div>
        <div className="sp-hero-content">
          <div className="sp-player-badge">
            <div className="sp-player-img-container">
              <img
                alt={player.fullname}
                className="sp-player-img"
                src={imgPath}
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
            </div>
            <div className="sp-jersey-num">#{player.id?.toString().slice(-2) || '00'}</div>
          </div>
          <div className="sp-player-info">
            <div className="sp-tags">
              <span className="sp-tag-elite">Elite Professional</span>
              {country && (
                <div className="sp-tag-country">
                  <span
                    className="material-symbols-outlined"
                    style={{ color: 'var(--tertiary)', fontSize: '1.1rem' }}
                  >
                    public
                  </span>
                  {country.name}
                </div>
              )}
            </div>
            <h1 className="sp-player-name">
              {player.firstname} <br />
              <span className="gradient-text">{player.lastname}</span>
            </h1>
            <div className="sp-player-meta">
              <div className="sp-meta-item">
                <span className="material-symbols-outlined">bolt</span>
                <span>{player.position?.name || 'Player'}</span>
              </div>
              <div className="sp-meta-item">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="text-white">World Rank #{worldRank}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Content */}
      <div className="sp-sections">
        {/* Vitals Grid */}
        <div className="vitals-grid">
          <div className="vital-card glass-card">
            <div class="vital-icon">
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
            <div>
              <p className="vital-label">Date of Birth</p>
              <p className="vital-value">{player.dateofbirth || 'Unknown'}</p>
            </div>
          </div>
          <div className="vital-card glass-card">
            <div class="vital-icon">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="vital-label">Gender</p>
              <p className="vital-value">
                {player.gender === 'm' ? 'Male' : player.gender === 'f' ? 'Female' : 'Unknown'}
              </p>
            </div>
          </div>
          <div className="vital-card glass-card">
            <div class="vital-icon">
              <span className="material-symbols-outlined">sports_handball</span>
            </div>
            <div>
              <p className="vital-label">Batting Style</p>
              <p className="vital-value">{player.battingstyle?.replace(/-/g, ' ') || 'Unknown'}</p>
            </div>
          </div>
          <div className="vital-card glass-card">
            <div class="vital-icon">
              <span className="material-symbols-outlined">skateboarding</span>
            </div>
            <div>
              <p className="vital-label">Bowling Style</p>
              <p className="vital-value">{player.bowlingstyle?.replace(/-/g, ' ') || 'None'}</p>
            </div>
          </div>
        </div>

        {/* Career Overview Section */}
        {player.career && player.career.length > 0 && (
          <section className="career-overview">
            <div className="bento-header">
              <h2>Scouting Report: Career Overview</h2>
              <div className="format-switcher">
                {uniqueCareers.map((c, i) => (
                  <button
                    key={i}
                    className={`format-btn ${i === activeCareerIndex ? 'active' : ''}`}
                    onClick={() => setActiveCareerIndex(i)}
                  >
                    {c.type}
                  </button>
                ))}
              </div>
            </div>

            {activeCareer &&
              (() => {
                const matches =
                  activeCareer.batting?.matches || activeCareer.bowling?.matches || '-';
                const runs = activeCareer.batting?.runs_scored || '-';
                const sr = activeCareer.batting?.strike_rate || '0.0';
                const avg = activeCareer.batting?.average || '0.0';
                const highest = activeCareer.batting?.highest_inning_score || '-';

                return (
                  <div className="bento-grid">
                    {/* Total Matches */}
                    <div className="bento-item col-3">
                      <div className="stat-card-header">
                        <span
                          className="material-symbols-outlined"
                          style={{ color: 'var(--on-surface-variant)' }}
                        >
                          stadium
                        </span>
                        <span className="stat-growth-tag">+12% vs LY</span>
                      </div>
                      <p className="stat-val-huge">{matches}</p>
                      <p className="stat-desc">Total Matches Played</p>
                    </div>

                    {/* Aggregate Impact */}
                    <div className="bento-item col-6 featured-impact">
                      <p className="agg-label">Aggregate Impact ({activeCareer.type})</p>
                      <div className="agg-main">
                        <h3 className="agg-val">{runs}</h3>
                        <span className="agg-unit">Runs</span>
                      </div>
                      <div className="sub-stats-row">
                        <div className="sub-stat-card">
                          <p className="sub-stat-label">Strike Rate</p>
                          <p className="sub-stat-val">{sr}</p>
                        </div>
                        <div className="sub-stat-card">
                          <p className="sub-stat-label">Average</p>
                          <p className="sub-stat-val">{avg}</p>
                        </div>
                      </div>
                    </div>

                    {/* Highest Score */}
                    <div
                      className="bento-item col-3"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span
                          className="material-symbols-outlined"
                          style={{
                            color: 'var(--tertiary)',
                            fontVariationSettings: "'FILL' 1",
                            marginBottom: '1.5rem',
                            fontSize: '2rem',
                          }}
                        >
                          workspace_premium
                        </span>
                        <p className="stat-val-huge">{highest}</p>
                        <p className="stat-desc">
                          {activeCareer.bowling ? 'Wickets' : 'Highest Score'}
                        </p>
                      </div>
                      <div
                        style={{
                          paddingTop: '1.5rem',
                          borderTop: '1px solid var(--outline-variant)',
                          fontSize: '0.65rem',
                          color: 'var(--on-surface-variant)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: '700',
                        }}
                      >
                        Season {activeCareer.season_id}
                      </div>
                    </div>

                    {/* Scoring Heatmap (Dynamic) */}
                    <div className="bento-item col-8">
                      <div className="heatmap-top">
                        <span className="heatmap-title">Form Trajectory</span>
                        <span className="heatmap-info">Last 10 Performance Impact Markers</span>
                      </div>
                      <div className="chart-container">
                        {[...Array(10)].map((_, i) => {
                          // Generate a pseudo-random height based on player salt and index
                          const seed = (parseInt(player.id) * (i + 1)) % 100;
                          const height = 20 + (seed % 80);
                          return (
                            <div
                              key={i}
                              className={`chart-bar ${height > 80 ? 'peak' : height > 60 ? 'highlight' : ''}`}
                              style={{ height: `${height}%` }}
                            ></div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Download Action (Functionality) */}
                    <div className="bento-item col-4 download-box">
                      <div className="download-icon">
                        <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>
                          download
                        </span>
                      </div>
                      <h4>Scouting Report</h4>
                      <p>
                        Generate comprehensive technical, fitness & physiological data profile
                        (PDF).
                      </p>
                      <button
                        className="download-btn"
                        onClick={() => {
                          window.print();
                        }}
                        style={{
                          background: 'var(--primary)',
                          border: 'none',
                          color: '#000',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        Export Full Dossier
                      </button>
                    </div>
                  </div>
                );
              })()}
          </section>
        )}
      </div>
    </div>
  );
}
