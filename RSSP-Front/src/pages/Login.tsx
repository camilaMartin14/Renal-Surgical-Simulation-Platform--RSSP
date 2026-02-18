import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL, setCurrentUser } from '../store'

function parseJwtPayload(token: string): any {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid token')
  }
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  const json = atob(padded)
  return JSON.parse(json)
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        let message = 'Credenciales inválidas o error al iniciar sesión.'
        try {
          const text = await response.text()
          if (text) {
            if (text.trim().startsWith('{')) {
              const body = JSON.parse(text) as any
              const backendMessage =
                body?.error ??
                body?.Error ??
                body?.message ??
                body?.Message
              if (backendMessage && typeof backendMessage === 'string') {
                message = backendMessage
              }
            } else {
              message = text
            }
          }
        } catch {
        }
        setError(message)
        setLoading(false)
        return
      }

      const token = await response.text()

      let payload: any
      try {
        payload = parseJwtPayload(token)
      } catch {
        setError('Respuesta de login inválida.')
        setLoading(false)
        return
      }

      const idClaim =
        payload['nameid'] ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      const emailClaim =
        payload['email'] ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']

      const userId = Number(idClaim)
      if (!userId || Number.isNaN(userId)) {
        setError('Respuesta de login inválida.')
        setLoading(false)
        return
      }

      setCurrentUser({ id: userId, email: emailClaim })
      navigate('/')
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg-card)'
    }}>
      <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>
          <div style={{ width: 24, height: 24, background: 'var(--bg-dark)', borderRadius: 4 }}></div>
          RSSP
          <div style={{ marginLeft: 'auto' }}>
            <Link to="/login" style={{ marginRight: '1rem', color: 'var(--text)', fontWeight: 600 }}>Iniciar Sesión</Link>
            <Link to="/register" style={{ padding: '0.5rem 1rem', background: 'var(--bg-dark)', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>Registrarse</Link>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>RSSP</h1>

          {error && (
            <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </p>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            <div>
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
            
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <a href="#" style={{ color: 'var(--text-muted)' }}>¿Olvidaste tu contraseña?</a>
              <Link to="/register" style={{ color: 'var(--text-muted)' }}>Crear una cuenta</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
