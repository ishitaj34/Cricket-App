import { Link } from 'react-router-dom';
import { FALLBACK_IMAGE, getFlagEmoji } from '../utils/helpers';

/**
 * Scout Hub: Reusable Player Preview Card.
 * 
 * Used in the bento-grid roster view. Features glassmorphism effects,
 * automatic image fallbacks, and role-based stat labeling.
 * 
 * @param {Object} props.player The raw player data object from SportMonks.
 * @param {string} props.countryName Mapped country name for display.
 */
export default function PlayerCard({ player, countryName }) {
  const imgPath = player.image_path || FALLBACK_IMAGE;

  // Mock derived stats based on role to demonstrate the design
  const isBowler = player.position?.name?.toLowerCase().includes('bowl');
  const tagStr = player.position?.name || 'Player';

  const stat1 = isBowler ? { label: 'Wickets', value: '341' } : { label: 'Runs', value: '2420' };
  const stat2 = isBowler ? { label: 'Avg', value: '27.5' } : { label: 'S/R', value: '145.2' };
  const stat3 = isBowler ? { label: 'Speed', value: '151.2' } : { label: 'Catches', value: '118' };

  return (
    <Link to={`/players/${player.id}`} className="player-card">
      <div className="card-image-box">
        <img
          src={imgPath}
          alt={player.fullname}
          className="card-image"
          onError={(e) => {
            e.target.src = FALLBACK_IMAGE;
          }}
        />
        <div className="card-image-overlay"></div>

        <div className="card-badges">
          {countryName && <div className="flag-badge">{getFlagEmoji(countryName)}</div>}
          {player.position?.name && <div className="role-badge">{tagStr}</div>}
        </div>
      </div>

      <div className="card-glass-panel">
        <h3 className="card-title">{player.fullname}</h3>
        <p className="card-country">{countryName || 'Unknown Origin'}</p>

        <div className="card-stats">
          <div className="card-stat">
            <div className="card-stat-label">{stat1.label}</div>
            <div className="card-stat-val">{stat1.value}</div>
          </div>
          <div className="card-stat">
            <div className="card-stat-label">{stat2.label}</div>
            <div className="card-stat-val highlight">{stat2.value}</div>
          </div>
          <div className="card-stat">
            <div className="card-stat-label">{stat3.label}</div>
            <div className="card-stat-val">{stat3.value}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
