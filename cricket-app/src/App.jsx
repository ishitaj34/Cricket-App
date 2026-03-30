import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PlayersListingPage from './pages/PlayersListingPage';
import SinglePlayerPage from './pages/SinglePlayerPage';
import ComparePage from './pages/ComparePage';
import './App.css';

/**
 * Main Content Component of Scout Hub.
 *
 * Manages the global layout (header, footer) and application-wide routing.
 */
function AppContent() {
  const location = useLocation();

  const isCompareRoute = location.pathname.startsWith('/compare');
  const isListingRoute = location.pathname === '/';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="header-logo">
          <Link className="header-logo-link" to="/" onClick={() => setIsMobileMenuOpen(false)}>
            SCOUT HUB
          </Link>
        </div>
        <div className="header-nav-container">
          <div className="nav-actions">
            <button
              title="Toggle Scouting Filters"
              onClick={() => isListingRoute && setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`material-symbols-outlined icon-btn ${isListingRoute ? '' : 'icon-btn-disabled'} ${isListingRoute && isMobileMenuOpen ? 'icon-btn-active' : ''}`}
            >
              filter_list
            </button>
          </div>
        </div>
      </header>

      <div className={!isCompareRoute ? 'layout-wrapper' : 'layout-wrapper-compare'}>
        <Routes>
          <Route path="/" element={<PlayersListingPage isMobileMenuOpen={isMobileMenuOpen} />} />
          <Route path="/players/:id" element={<SinglePlayerPage />} />
          <Route path="/compare" element={<ComparePage isMobileMenuOpen={isMobileMenuOpen} />} />
        </Routes>
      </div>

      {!isCompareRoute && (
        <footer className={`app-footer ${isListingRoute ? 'with-sidebar' : ''}`}>
          <div>&copy; {new Date().getFullYear()} SCOUT HUB | THE DIGITAL CURATOR</div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Scouting</a>
            <a href="https://sportmonks.com/cricket-api/" target="_blank" rel="noopener noreferrer">
              Data API
            </a>
          </div>
        </footer>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
