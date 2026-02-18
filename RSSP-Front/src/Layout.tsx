import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { getCurrentUser, setCurrentUser as setCurrentUserInStore } from './store'

type HeaderUser = {
  id: number
  email?: string
}

export default function Layout({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<HeaderUser | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [location.pathname])

  const handleLogout = () => {
    setCurrentUserInStore(null)
    setUser(null)
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '0.75rem 1.5rem',
          background: 'var(--bg-sidebar)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 24, height: 24, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }}></div>
          <Link to="/" style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', textDecoration: 'none' }}>
            RSSP
          </Link>
        </div>

        <nav style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <Link
            to="/"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Tablero
          </Link>
          <Link
            to="/results"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: location.pathname === '/results' ? 'rgba(255,255,255,0.1)' : 'transparent',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Resultados
          </Link>
        </nav>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginLeft: '1rem',
          }}
        >
          {user ? (
            <>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: 'var(--accent)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={18} color="white" />
              </div>
              <span style={{ fontSize: '0.9rem' }}>{user.email ?? 'Usuario'}</span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '0.35rem 0.9rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'transparent',
                  color: 'white',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                }}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                style={{
                  color: 'var(--bg-sidebar)',
                  background: 'white',
                  textDecoration: 'none',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </header>
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  )
}
