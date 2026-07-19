import { useCallback, useRef } from 'react'

/**
 * Independent quiz sound hook using Web Audio API.
 *
 * Correct = pleasant ascending two-note chime (C5→E5, ~300ms)
 * Incorrect = soft descending buzz (A4→F4, ~400ms)
 *
 * Separate AudioContext from useAudioSynth to keep quiz sounds isolated.
 */
export default function useQuizSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playCorrect = useCallback(() => {
    const ctx = getCtx()
    const now = ctx.currentTime

    // First note: C5 (523 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.value = 523
    gain1.gain.setValueAtTime(0.3, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.3)

    // Second note: E5 (659 Hz), offset 150ms
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = 659
    gain2.gain.setValueAtTime(0, now + 0.15)
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.16)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.45)
  }, [getCtx])

  const playIncorrect = useCallback(() => {
    const ctx = getCtx()
    const now = ctx.currentTime

    // First note: A4 (440 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'triangle'
    osc1.frequency.value = 440
    gain1.gain.setValueAtTime(0.25, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Second note: F4 (349 Hz), offset 200ms — descending
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.value = 349
    gain2.gain.setValueAtTime(0, now + 0.2)
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.21)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.2)
    osc2.stop(now + 0.55)
  }, [getCtx])

  return { playCorrect, playIncorrect }
}
