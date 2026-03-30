import './Loader.css';

export default function Loader({ text = 'Loading Pitch Data...' }) {
  return (
    <div className="loader-wrapper">
      <div className="loader-grid-overlay"></div>
      <div className="loader-glow-effect"></div>

      <main className="loader-main-content">
        <div className="loader-animation-container">
          <div className="loader-ball"></div>
          <div className="loader-bat-wrapper">
            <div className="loader-bat-handle"></div>
            <div className="loader-bat-blade">
              <div className="loader-bat-sticker"></div>
            </div>
          </div>
        </div>

        <section className="loader-status-container">
          <p className="loader-status-text">{text}</p>
          <div className="loader-loading-dots">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
        </section>
      </main>
    </div>
  );
}
