# Scout Hub: Cricket Intelligence Dashboard

### Overview

**Scout Hub** is a high-performance scouting intelligence dashboard designed for professional cricket analysts and talent scouts. It provides a premium, data-driven environment for exploring global player rosters, conducting head-to-head technical comparisons, and deep-diving into individual career trajectories.

---

### Core Functionality

- **Roster Filtering**: A multi-dimensional filtering engine allowing scouts to slice the global player database by country, position, and tournament with real-time debounced searching.
- **Head-to-Head Comparison**: A dedicated comparison engine that calculates "Match Signatures" and "Consistency Indexes" between two players using visual clustering and relative delta math.
- **Technical Dossier**: Individual player pages featuring multi-format career switchers (T20, ODI, Test) and performance vitals.
- **Fluid UI**: A responsive, dark-mode interface built entirely with Vanilla CSS, featuring custom glassmorphism effects and micro-animations.
- **Hybrid Data Caching**: Implements `TanStack Query` for intelligent background fetching and state persistence, ensuring near-instant navigation between views.
- **Scout Intelligence**: Automated "Scout Pick" logic that identifies the statistical leader in specific metrics during live comparisons.

---

### Terminology Used

| Term | Definition |
|------|-----------|
| **Hub-and-Spoke Navigation** | A layout strategy using a fixed sidebar for global hubs (Roster, Compare) and a main section for contextual actions. |
| **Match Signature** | A dynamic visual heatmap generated based on player metadata to represent their technical footprint. |
| **Consistency Index** | A calculated percentage difference between players, providing a quick sanity check for statistical leads. |
| **Scout Pick** | An automated highlighting system that identifies the superior performer in a head-to-head pairing. |
| **Hydration** | The process of mapping raw API ID references (Country ID, Position ID) to their readable metadata via cached lookups. |
| **Bento Grid** | A modern tiling layout strategy used for the player roster and dashboard components. |

---

### Tech Stack

- **Framework:** React 18 (Vite)
- **Data Management:** TanStack Query v5 (Optimized @tanstack/react-query)
- **Styling:** Vanilla CSS3 (Custom Design System with CSS Variables)
- **API:** SportMonks Cricket API (v2)
- **Routing:** React Router 6 (URL-driven state management)
- **Architecture:** 
    - **Functional Components**: Clean, hook-based logic.
    - **DRY Utility System**: Centralized helper functions for math and formatting.
    - **Debounced Engines**: Optimized search to prevent API throttling.
- **Performance:**
    - Zero external UI libraries (Maximum performance/minimal bundle size).
    - Memoized data processing for large-scale filtering.
    - Custom responsive "drawer" navigation for mobile devices.

---

### Project Structure

```tree
cricket-app/
│
├── src/
│   ├── api/
│   │   └── sportmonks.js      # Centralized API service (TanStack Query ready)
│   ├── components/
│   │   ├── PlayerCard.jsx     # Reusable item-view for the bento grid
│   │   ├── Loader.jsx         # Custom "Cricket Intelligence" animation
│   │   └── Loader.css         # Scoped animation keyframes and styles
│   ├── pages/
│   │   ├── PlayersListingPage.jsx # Core filtering and roster engine
│   │   ├── ComparePage.jsx        # Head-to-Head analysis tool
│   │   └── SinglePlayerPage.jsx   # Technical dossier and vitals
│   ├── utils/
│   │   └── helpers.js         # Shared logic (flags, math, fallbacks)
│   ├── App.jsx                # Global router and mobile drawer logic
│   ├── App.css                # Centralized Design System and Theme
│   └── main.jsx               # Entry point and QueryClient provider
│
├── .env                       # Secure API token management
├── vite.config.js             # API Proxy configuration
└── README.md
```

---

### Code Navigation Guide

1. **API Orchestration**
   *File:* `src/api/sportmonks.js`
   - Handles all async communication with the data provider.
   - Implements standardized data structures for easy consumption across components.

2. **Filtering Engine & Roster**
   *File:* `src/pages/PlayersListingPage.jsx`
   - Manages the complex intersection of search, dropdown filters, and URL-driven state.
   - Loads and maps country/position metadata to ensure readable labels.

3. **Comparison Intelligence**
   *File:* `src/pages/ComparePage.jsx`
   - Orchestrates the dual-lookup player selection.
   - Calculates the **Consistency Index** using central helpers to determine statistical leaders.

4. **Shared Utilities (DRY)**
   *File:* `src/utils/helpers.js`
   - Centralizes image fallbacks, flag emoji mapping, and delta-math.
   - Ensures consistency in formatting across the Roster and Dossier pages.

5. **Responsive Design System**
   *File:* `src/App.css`
   - Implements the "Modern Dark" design system.
   - Handles the complex Mobile Drawer transition and responsive grid breakpoints (1024px, 768px).

---

### User Experience Workflow

1. **Discovery (Scouting Hub)**
   - User navigates the global bento grid.
   - Refines results using high-precision filters (e.g., "Wicketkeeper from India").

2. **Analysis (Head-to-Head)**
   - User inputs two names into the comparison tool.
   - Reviews the "Match Signature" heatmaps and the automated "Scout Pick" highlights.

3. **Deep Dive (Single Dossier)**
   - User opens a full player profile.
   - Swaps between ODI, T20, and Test formats to evaluate historical impact.

---