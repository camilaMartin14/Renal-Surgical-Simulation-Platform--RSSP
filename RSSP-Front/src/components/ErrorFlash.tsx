import { useEffect } from 'react'

interface ErrorFlashProps {
  /** When true, shows red flash and optional badge; auto-clears after duration. */
  trigger: boolean
  /** Callback when flash ends (optional, for syncing state). */
  onClear?: () => void
  /** How long the flash is visible (ms). */
  duration?: number
  /** Message to show in the red badge (e.g. "¡Error crítico!"). */
  message?: string
  /** Optional class to apply to wrapper when flashing. */
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export default function ErrorFlash({
  trigger,
  onClear,
  duration = 600,
  message = '¡Error crítico!',
  className = '',
  style,
  children,
}: ErrorFlashProps) {
  useEffect(() => {
    if (!trigger) return
    const t = setTimeout(() => onClear?.(), duration)
    return () => clearTimeout(t)
  }, [trigger, duration, onClear])

  return (
    <div
      className={[className, trigger ? 'error-flash' : ''].filter(Boolean).join(' ')}
      style={{ position: 'relative', ...style }}
    >
      {trigger && (
        <div className="error-badge" role="alert">
          {message}
        </div>
      )}
      {children}
    </div>
  )
}
