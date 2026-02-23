import { useCallback, useRef } from 'react'

export const useGameSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
    const ctx = getContext()
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + duration)
  }, [getContext])

  const playSuccess = useCallback(() => {
    const ctx = getContext()
    if (ctx.state === 'suspended') ctx.resume()
    
    // Arpegio mayor
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50] // C E G C
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.1)
      gain.gain.setValueAtTime(0.1, now + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.3)
    })
  }, [getContext])

  const playError = useCallback(() => {
    playTone(150, 'sawtooth', 0.4, 0.15)
  }, [playTone])

  const playClick = useCallback(() => {
    playTone(800, 'sine', 0.05, 0.05)
  }, [playTone])

  const playStart = useCallback(() => {
    playTone(440, 'sine', 0.1, 0.1)
    setTimeout(() => playTone(880, 'sine', 0.2, 0.1), 100)
  }, [playTone])

  return {
    playSuccess,
    playError,
    playClick,
    playStart
  }
}