import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }: { children?: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="page-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-brand">
            <div className="app-header-mark">
              <svg
                width="24"
                height="24"
                viewBox="0 0 100 100"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="50" fill="#D6F1FF" />
                <path d="M50 20 V80 M20 50 H80" stroke="#FF69B4" strokeWidth="15" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <Link to="/" className="app-header-title">
                RSSP
              </Link>
              <div className="app-header-tagline">
                Renal Surgical Simulation Platform
              </div>
            </div>
          </div>

          <nav className="app-header-nav">
            <Link
              to="/"
              className={location.pathname === '/' ? 'is-active' : undefined}
            >
              Tablero
            </Link>
            <Link
              to="/results"
              className={location.pathname === '/results' ? 'is-active' : undefined}
            >
              Resultados
            </Link>
          </nav>

          <div className="app-header-user">
          </div>
        </div>
      </header>

      <main className="page-main">
        {children}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        marginTop: 'auto',
        borderTop: '1px solid var(--border)',
        color: 'var(--navy)',
        fontSize: '0.9rem',
        backgroundColor: 'var(--accent)'
      }}>
        Desarrollado por <a 
          href="https://www.linkedin.com/in/camilamartindev/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}
        >
          Camila Martín
        </a>
      </footer>
    </div>
  )
}
