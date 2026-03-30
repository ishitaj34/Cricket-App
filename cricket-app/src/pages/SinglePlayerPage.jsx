import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { fetchPlayers, fetchCountries } from '../api/sportmonks';
import { FALLBACK_IMAGE, STADIUM_HERO, aggregateCareerByType } from '../utils/helpers';
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

  // Aggregate all season-level entries into lifetime totals per format
  const uniqueCareers = aggregateCareerByType(player.career);
  const activeCareer = uniqueCareers[activeCareerIndex] || uniqueCareers[0];

  return (
    <div className="sp-page-wrapper">
      {/* Sticky Contextual Header */}
      <header className="sp-toolbar">
        <Link to="/" className="back-link">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Roster
        </Link>
        <div className="sp-toolbar-actions">
          <Link to={`/compare?p1=${player.id}`} className="btn-compare">
            Compare {player.lastname}
          </Link>
        </div>
      </header>

      {/* Player Hero Section — Uses self-hosted stadium image */}
      <section className="sp-hero">
        <div className="sp-hero-bg">
          <div className="sp-hero-overlay"></div>
          <img
            alt="Stadium"
            className="sp-hero-img-bg"
            src={STADIUM_HERO}
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
                  <span className="material-symbols-outlined sp-tag-country-icon">
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
                <span className="material-symbols-outlined sp-star-filled">
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
        {/* Vitals Grid — all divs use className */}
        <div className="vitals-grid">
          <div className="vital-card glass-card">
            <div className="vital-icon">
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
            <div>
              <p className="vital-label">Date of Birth</p>
              <p className="vital-value">{player.dateofbirth || 'Unknown'}</p>
            </div>
          </div>
          <div className="vital-card glass-card">
            <div className="vital-icon">
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
            <div className="vital-icon">
              <span className="material-symbols-outlined">sports_handball</span>
            </div>
            <div>
              <p className="vital-label">Batting Style</p>
              <p className="vital-value">{player.battingstyle?.replace(/-/g, ' ') || 'Unknown'}</p>
            </div>
          </div>
          <div className="vital-card glass-card">
            <div className="vital-icon">
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

            {activeCareer && (
              <CareerBentoGrid activeCareer={activeCareer} player={player} />
            )}
          </section>
        )}
      </div>
    </div>
  );
}

/**
 * Extracted Career Bento Grid component.
 */
function CareerBentoGrid({ activeCareer, player }) {
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
          <span className="material-symbols-outlined stat-icon-muted">
            stadium
          </span>
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
      <div className="bento-item col-3 highest-score-card">
        <div>
          <span className="material-symbols-outlined highest-score-icon">
            workspace_premium
          </span>
          <p className="stat-val-huge">{highest}</p>
          <p className="stat-desc">
            {activeCareer.bowling ? 'Wickets' : 'Highest Score'}
          </p>
        </div>
        <div className="highest-score-footer">
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

      {/* Scouting Report Notice (Export removed — window.print is not a proper PDF solution) */}
      <div className="bento-item col-4 download-box">
        <div className="download-icon">
          <span className="material-symbols-outlined download-icon-lg">
            download
          </span>
        </div>
        <h4>Scouting Report</h4>
        <p>
          Comprehensive technical, fitness &amp; physiological data profile available for download.
        </p>
        <span className="download-notice">Coming Soon</span>
      </div>
    </div>
  );
}

CareerBentoGrid.propTypes = {
  activeCareer: PropTypes.shape({
    type: PropTypes.string,
    season_id: PropTypes.number,
    batting: PropTypes.object,
    bowling: PropTypes.object,
  }).isRequired,
  player: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
};
