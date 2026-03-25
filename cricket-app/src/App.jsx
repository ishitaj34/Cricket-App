import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link, useSearchParams } from 'react-router-dom';
import PlayersListingPage from './pages/PlayersListingPage';
import SinglePlayerPage from './pages/SinglePlayerPage';
import ComparePage from './pages/ComparePage';
import './App.css';

/**
 * Main Content Component of Scout Hub.
 * 
 * Manages the global layout (header, footer) and application-wide routing logic.
 * Decides when to hide shared navigation elements based on current routes.
 */
function AppContent() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // The Compare tool features a dedicated full-screen layout, so we hide standard site framing
  const isCompareRoute = location.pathname.startsWith('/compare');
  // Sorting is only valid for the home player listing view
  const isListingRoute = location.pathname === '/';

  /**
   * Toggles the sorting order (ASC/DESC) for a given player field in the URL.
   * Persistent sorting ensures that shared links maintain their specific order.
   * @param {string} field The player property to sort by (e.g., 'firstname').
   */
  const toggleSort = (field) => {
    if (!isListingRoute) return;
    const current = searchParams.get('sort');
    const params = new URLSearchParams(searchParams);
    if (current === `${field}_asc`) {
      params.set('sort', `${field}_desc`);
    } else {
      params.set('sort', `${field}_asc`);
    }
    setSearchParams(params, { replace: true });
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="header-logo">
          <Link 
            style={{ textDecoration: 'none', color: '#fff' }} 
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            SCOUT HUB
          </Link>
        </div>
        <div className="header-nav-container">
          <div className="nav-actions">
            <button
              title="Toggle Scouting Filters"
              onClick={() => isListingRoute && setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="material-symbols-outlined icon-btn"
              style={{ 
                opacity: isListingRoute ? 1 : 0.4,
                cursor: isListingRoute ? 'pointer' : 'default',
                color: (isListingRoute && isMobileMenuOpen) ? 'var(--primary)' : 'inherit'
              }}
            >
              filter_list
            </button>
            <button
              title="Toggle Alphabetical Sort"
              onClick={() => isListingRoute && toggleSort('firstname')}
              className="material-symbols-outlined icon-btn"
              style={{
                opacity: isListingRoute ? 1 : 0.4,
                cursor: isListingRoute ? 'pointer' : 'default',
              }}
            >
              sort_by_alpha
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
          <div>© 2024 SCOUT HUB | THE DIGITAL CURATOR</div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Scouting</a>
            <a href="https://sportmonks.com/cricket-api/" target="_blank" rel="noopener noreferrer">Data API</a>
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
