import { useEffect, useRef } from 'react'
import { TelemetryPoint } from '../types'

interface TelemetryHeatmapProps {
  data: TelemetryPoint[]
  width?: number
  height?: number
  className?: string
}

export default function TelemetryHeatmap({ data, width = 600, height = 400, className }: TelemetryHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Background
    ctx.fillStyle = '#16242e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw Grid
    ctx.strokeStyle = '#2F4858'
    ctx.lineWidth = 1
    ctx.beginPath()
    for(let i=0; i<=canvas.width; i+=50) {
      ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    }
    for(let i=0; i<=canvas.height; i+=50) {
      ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
    }
    ctx.stroke()

    if (!data || data.length === 0) {
      ctx.fillStyle = '#F5EFEB'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Sin datos de telemetría disponibles', canvas.width/2, canvas.height/2)
      return
    }

    // Draw Heatmap
    // We use "lighter" composite operation to add up colors
    ctx.globalCompositeOperation = 'lighter'
    
    data.forEach(p => {
      // Fallback to 0.5 if nx/ny missing (shouldn't happen with new data)
      const nx = p.nx ?? 0.5
      const ny = p.ny ?? 0.5
      
      const x = nx * canvas.width
      const y = ny * canvas.height
      
      // Color based on density (heat)
      // Azalea for heat
      const gradient = ctx.createRadialGradient(x, y, 1, x, y, 20)
      gradient.addColorStop(0, 'rgba(247, 201, 212, 0.25)') // Azalea
      gradient.addColorStop(1, 'rgba(247, 201, 212, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw path line on top
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    let started = false
    data.forEach((p) => {
      const nx = p.nx ?? 0.5
      const ny = p.ny ?? 0.5
      const x = nx * canvas.width
      const y = ny * canvas.height
      
      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
    
    // Draw Start and End points
    if (data.length > 0) {
        const start = data[0]
        const end = data[data.length - 1]
        
        // Start (Green)
        ctx.fillStyle = '#22c55e'
        ctx.beginPath()
        ctx.arc((start.nx??0.5)*canvas.width, (start.ny??0.5)*canvas.height, 5, 0, Math.PI*2)
        ctx.fill()
        
        // End (Red)
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.arc((end.nx??0.5)*canvas.width, (end.ny??0.5)*canvas.height, 5, 0, Math.PI*2)
        ctx.fill()
    }

  }, [data, width, height])

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      className={className}
      style={{ borderRadius: '8px', border: '1px solid var(--border)', maxWidth: '100%', height: 'auto' }}
    />
  )
}
