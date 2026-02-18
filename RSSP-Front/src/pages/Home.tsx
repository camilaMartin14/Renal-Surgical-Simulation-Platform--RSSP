import { Link } from 'react-router-dom'
import { GAMES } from '../games'
import { Home as HomeIcon, BarChart2, ChevronRight, PlayCircle } from 'lucide-react'

export default function Home() {

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      {/* Left Dashboard Sidebar */}
      <div style={{ 
        width: '240px', 
        flexShrink: 0,
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem' 
      }}>
        <div style={{ 
          background: 'var(--bg-sidebar)', 
          borderRadius: '12px', 
          padding: '1.5rem', 
          color: 'white',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            <Link to="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600
            }}>
              <HomeIcon size={20} />
              Inicio
            </Link>
            <Link to="/results" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              color: 'rgba(255,255,255,0.7)', 
              textDecoration: 'none',
              fontWeight: 500
            }}>
              <BarChart2 size={20} />
              Resultados
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>Escenarios de Entrenamiento</h2>
        </div>

        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.25rem' }}>
              Modo demo clínico
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text)' }}>
              Usa la simulación de <strong>Ablación de Tumor Renal</strong> como escenario rápido para mostrar el
              flujo operador–robot Justina a médicos y decisores.
            </div>
          </div>
          <Link
            to="/tumor-ablation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              background: 'var(--accent)',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            Abrir demo
            <ChevronRight size={16} />
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Último Puntaje</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>0%</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>-</div>
          </div>
          <div className="card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Horas Totales de Práctica</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>0h 0m</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>0h 0m esta semana</div>
          </div>
          <div className="card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tendencia de Error</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>0%</div>
            <a href="#" style={{ fontSize: '0.9rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Más detalles <ChevronRight size={14} />
            </a>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {GAMES.map((g, index) => (
            <Link
              key={g.id}
              to={g.path}
              style={{
                display: 'block',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow =
                  '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                style={{
                  height: '140px',
                  background: g.image
                    ? `url(${g.image}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${
                        ['#fca5a5', '#fcd34d', '#86efac', '#93c5fd', '#c4b5fd'][index % 5]
                      } 0%, #e2e8f0 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {g.image && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.2)',
                    }}
                  />
                )}
                <PlayCircle
                  size={40}
                  color="white"
                  style={{
                    opacity: 0.9,
                    zIndex: 1,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                  }}
                />
              </div>

              <div style={{ padding: '1rem' }}>
                <h3
                  style={{
                    margin: '0 0 0.25rem',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                  }}
                >
                  {g.title}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    Difficulty:
                  </span>
                  <div style={{ display: 'flex', color: 'var(--text)' }}>
                    {'★'.repeat(3 + (index % 3))}
                    {'☆'.repeat(2 - (index % 3))}
                  </div>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {g.description}
                </p>
                <div
                  style={{
                    marginTop: '0.75rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Mejor Personal: -
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
