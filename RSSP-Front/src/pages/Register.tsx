import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../store'

export default function Register() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError('Nombre y apellido son obligatorios.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      })

      if (!response.ok) {
        let message = 'No se pudo crear la cuenta.'
        try {
          const body = (await response.json()) as any
          const backendMessage =
            body?.error ??
            body?.Error ??
            body?.message ??
            body?.Message
          if (backendMessage && typeof backendMessage === 'string') {
            message = backendMessage
          }
        } catch {
        }
        setError(message)
        setLoading(false)
        return
      }

      navigate('/login')
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
          Justina
          <div style={{ marginLeft: 'auto' }}>
            <Link to="/login" style={{ marginRight: '1rem', color: 'var(--text)', fontWeight: 600 }}>Iniciar Sesión</Link>
            <Link to="/register" style={{ padding: '0.5rem 1rem', background: 'var(--bg-dark)', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>Registrarse</Link>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
          <h1 style={{ marginBottom: '2rem', fontSize: '2rem', textAlign: 'center' }}>Crea tu cuenta</h1>

          {error && (
            <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </p>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="firstname">Nombre</label>
              <input
                type="text"
                id="firstname"
                placeholder="Ingresa tu nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="lastname">Apellido</label>
              <input
                type="text"
                id="lastname"
                placeholder="Ingresa tu apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

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

            <div>
              <label htmlFor="confirm-password">Confirmar contraseña</label>
              <input
                type="password"
                id="confirm-password"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
            
            <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
              <Link to="/login" style={{ color: 'var(--text-muted)' }}>¿Ya tienes una cuenta?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
