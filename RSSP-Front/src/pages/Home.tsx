import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GAMES } from '../games'
import { Home as HomeIcon, BarChart2, ChevronRight, PlayCircle } from 'lucide-react'
import { getAllResults } from '../domain/resultsStore'
import { useProgressStore } from '../progressStore'



export default function Home() {

  const { completedGames } = useProgressStore()
  const [lastScore, setLastScore] = useState<number | null>(null)
  const [lastGameTitle, setLastGameTitle] = useState<string | null>(null)
  const [totalTimeMs, setTotalTimeMs] = useState(0)
  const [totalWeekMs, setTotalWeekMs] = useState(0)

  useEffect(() => {
    const list = getAllResults().slice().sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    if (list.length > 0) {
      setLastScore(list[0].perfection)
      const g = GAMES.find((x) => x.id === list[0].gameId)
      setLastGameTitle(g?.title ?? list[0].gameId)
    }
    const total = list.reduce((acc, r) => acc + r.timeMs, 0)
    setTotalTimeMs(total)
    const now = Date.now()
    const weekMs = list
      .filter((r) => now - new Date(r.at).getTime() <= 7 * 24 * 60 * 60 * 1000)
      .reduce((acc, r) => acc + r.timeMs, 0)
    setTotalWeekMs(weekMs)
  }, [])

  const hoursTotal = Math.floor(totalTimeMs / 3_600_000)
  const minutesTotal = Math.round((totalTimeMs % 3_600_000) / 60_000)
  const hoursWeek = Math.floor(totalWeekMs / 3_600_000)
  const minutesWeek = Math.round((totalWeekMs % 3_600_000) / 60_000)

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="dashboard-sidebar-inner">
          <nav className="home-nav">
            <Link to="/" className="home-nav-link home-nav-link-primary">
              <HomeIcon size={20} />
              Inicio
            </Link>
            <Link to="/results" className="home-nav-link home-nav-link-secondary">
              <BarChart2 size={20} />
              Resultados
            </Link>
          </nav>
        </div>
      </div>

      <div className="dashboard-main">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.75rem',
            gap: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                margin: 0,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: 'var(--text-light)',
              }}
            >
              Escenarios de Entrenamiento
            </h2>
          </div>
        </div>

        <div className="home-hero">
          <div>
            <div className="home-hero-title">
              Modo demo clínico
            </div>
            <div className="home-hero-text">
              Prueba la simulación de <strong>Ablación de Tumor Renal</strong> como escenario rápido para probar el
              flujo operador–robot en una cirugía renal mínimamente invasiva.
            </div>
          </div>
          <Link
            to="/tumor-ablation"
            className="home-hero-cta"
          >
            Abrir demo
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="home-intro-grid">
          <div className="home-intro-main">
            <div className="home-intro-kicker">
              Plataforma digital de simulación
            </div>
            <h3 className="home-intro-title">
              Reduciendo el riesgo en el diseño de robots quirúrgicos
            </h3>
            <p className="home-intro-text">
              La aplicación surge a partir de un desafío de la plataforma <a href="https://nocountry.tech/showcase" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>No Country</a> y consiste en una serie de minijuegos 
              orientados a medir la precisión de cirujanos al manipular un robot quirúrgico. 
              Funciona como un entorno de simulación que permite evaluar interacción, desempeño y métricas de control sin necesidad de hardware físico,
               facilitando la validación temprana de decisiones de diseño en el desarrollo de robótica quirúrgica.
            </p>
          </div>

          <div className="home-intro-side">
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
              Qué puedes explorar con RSSP
            </h3>
            <ul className="home-intro-list">
              <li>
                • Simular interacciones entre un operador humano y un sistema robótico conceptual.
              </li>
              <li>
                • Probar interfaces de control, visualización y feedback sin depender de hardware real.
              </li>
              <li>
                • Registrar métricas básicas de desempeño como trayectorias, tiempos y errores.
              </li>
              <li>
                • Utilizar los resultados como insumo para discusiones con médicos y decisores de salud.
              </li>
            </ul>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stat-grid">
          <div className="card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Último Puntaje</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>
              {lastScore != null ? `${Number(lastScore).toFixed(3)}%` : '0.000%'}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {lastGameTitle ?? '-'}
            </div>
          </div>
          <div className="card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Horas Totales de Práctica</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>
              {hoursTotal}h {minutesTotal}m
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {hoursWeek}h {minutesWeek}m esta semana
            </div>
          </div>
          <div className="card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tendencia de Error</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>
              {lastScore != null ? `${Math.max(0, 100 - lastScore).toFixed(3)}%` : '0.000%'}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Estimación simple basada en la última sesión.
            </div>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="home-scenarios-grid">
          {GAMES.map((g, index) => (
            <Link
              key={g.id}
              to={g.path}
              className="home-scenario-card"
            >
              <div
                className="home-scenario-media"
                style={{
                  background: g.image
                    ? `url(${g.image}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${
                        ['#fca5a5', '#fcd34d', '#86efac', '#93c5fd', '#c4b5fd'][index % 5]
                      } 0%, #e2e8f0 100%)`,
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

              <div className="home-scenario-body">
                <h3 className="home-scenario-title">
                  {g.title}
                </h3>
                <div className="home-scenario-meta">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {g.requiredRank ? `Recomendado para ${g.requiredRank}` : ''}
                  </span>
                </div>
                <p className="home-scenario-description">
                  {g.description}
                </p>
                <div className="home-scenario-footer">
                  {completedGames.includes(g.id) ? (
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>Completado (≥80%)</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Pendiente</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
