import { memo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FALLBACK_IMAGE, getFlagEmoji, getTotalCareerStats } from '../utils/helpers';

/**
 * Scout Hub: Reusable Player Preview Card.
 *
 * Used in the bento-grid roster view. Features glassmorphism effects,
 * automatic image fallbacks, and role-based stat labeling.
 *
 * Wrapped with React.memo to prevent unnecessary re-renders when
 * the parent list re-renders but this player's data hasn't changed.
 */
function PlayerCard({ player, countryName }) {
  const imgPath = player.image_path || FALLBACK_IMAGE;

  const isBowler = player.position?.name?.toLowerCase().includes('bowl');
  const tagStr = player.position?.name || 'Player';

  // Grand total across all formats (T20I + ODI + Test + T20)
  const total = getTotalCareerStats(player.career);

  let stat1, stat2, stat3;

  if (isBowler && total.wickets > 0) {
    stat1 = { label: 'Matches', value: total.matches || '-' };
    stat2 = { label: 'Wickets', value: total.wickets || '-' };
    stat3 = { label: 'Runs', value: total.runs || '-' };
  } else if (total.matches > 0) {
    stat1 = { label: 'Matches', value: total.matches };
    stat2 = { label: 'Runs', value: total.runs };
    stat3 = { label: 'Avg', value: total.average };
  } else {
    stat1 = { label: 'Matches', value: '-' };
    stat2 = { label: 'Runs', value: '-' };
    stat3 = { label: 'Avg', value: '-' };
  }

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

PlayerCard.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.number.isRequired,
    fullname: PropTypes.string,
    image_path: PropTypes.string,
    position: PropTypes.shape({
      name: PropTypes.string,
    }),
    career: PropTypes.arrayOf(
      PropTypes.shape({
        batting: PropTypes.object,
        bowling: PropTypes.object,
      })
    ),
  }).isRequired,
  countryName: PropTypes.string,
};

export default memo(PlayerCard);
