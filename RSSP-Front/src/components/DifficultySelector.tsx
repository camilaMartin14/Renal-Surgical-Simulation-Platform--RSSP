import type { Difficulty } from '../types'

const LABELS: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
}

interface DifficultySelectorProps {
  value: Difficulty
  onChange: (d: Difficulty) => void
  disabled?: boolean
}

export default function DifficultySelector({ value, onChange, disabled }: DifficultySelectorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dificultad:</span>
      {(['easy', 'medium', 'hard'] as const).map((d) => (
        <button
          key={d}
          type="button"
          disabled={disabled}
          onClick={() => onChange(d)}
          style={{
            padding: '0.35rem 0.75rem',
            background: value === d ? 'var(--accent)' : 'var(--bg-card)',
            color: value === d ? '#fff' : 'var(--text)',
            border: `1px solid ${value === d ? 'var(--accent)' : 'var(--border)'}`,
          }}
        >
          {LABELS[d]}
        </button>
      ))}
    </div>
  )
}
