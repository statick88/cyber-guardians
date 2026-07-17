/**
 * Web Audio API sound synthesis for CyberGuardians.
 * No external audio files — all sounds are generated via oscillators.
 * SSR-safe: every public function guards on `typeof window`.
 */

const STORAGE_KEY_MUTE = 'cg_2026_audio_muted' as const

// ---------------------------------------------------------------------------
// Singleton AudioContext + Master Gain
// ---------------------------------------------------------------------------

let audioCtx: AudioContext | null = null
let masterGain: GainNode | null = null

/**
 * Track every live oscillator so `cleanupAudio()` can stop them all
 * during component teardown (prevents orphaned AudioNodes leaking).
 */
const activeOscillators = new Set<OscillatorNode>()

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
    masterGain = audioCtx.createGain()
    masterGain.connect(audioCtx.destination)
    applyMuteState()
  }
  return audioCtx
}

function applyMuteState() {
  if (masterGain) {
    masterGain.gain.value = isAudioMuted() ? 0 : 1
  }
}

// ---------------------------------------------------------------------------
// Mute state
// ---------------------------------------------------------------------------

export function isAudioMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY_MUTE) === 'true'
}

export function setAudioMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY_MUTE, String(muted))
  applyMuteState()
}

/**
 * Call once on app mount to sync the master gain with persisted mute state.
 */
export function initAudio(): void {
  if (typeof window === 'undefined') return
  // Lazy-init the context so the first user gesture can resume it.
  getAudioContext()
  applyMuteState()
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (isAudioMuted()) return null
  const ctx = getAudioContext()
  // Browser autoplay policy — must be called from a user gesture.
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  return ctx
}

interface OscOptions {
  frequency: number
  type: OscillatorType
  duration: number
  gain: number
  fadeIn?: boolean
  filter?: { type: BiquadFilterType; frequency: number }
}

/**
 * Create a single oscillator note, connect it through the master gain,
 * and schedule automatic cleanup.
 */
function playNote(options: OscOptions, startTime?: number): void {
  const ctx = ensureContext()
  if (!ctx) return

  const now = startTime ?? ctx.currentTime
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  osc.type = options.type
  osc.frequency.setValueAtTime(options.frequency, now)

  // Optional filter (used by playFailure)
  let destination: AudioNode = gainNode
  if (options.filter) {
    const filter = ctx.createBiquadFilter()
    filter.type = options.filter.type
    filter.frequency.setValueAtTime(options.filter.frequency, now)
    gainNode.connect(filter)
    destination = filter
  }

  destination.connect(masterGain!)

  // Envelope
  if (options.fadeIn) {
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(options.gain, now + 0.01)
  } else {
    gainNode.gain.setValueAtTime(options.gain, now)
  }
  gainNode.gain.linearRampToValueAtTime(0, now + options.duration)

  osc.connect(gainNode)
  activeOscillators.add(osc)
  osc.start(now)
  osc.stop(now + options.duration)

  // Cleanup
  osc.onended = () => {
    activeOscillators.delete(osc)
    osc.disconnect()
    gainNode.disconnect()
  }
}

// ---------------------------------------------------------------------------
// Public sound functions
// ---------------------------------------------------------------------------

/** Subtle "pop" for button presses. */
export function playClick(): void {
  const ctx = ensureContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(1200, ctx.currentTime)

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05)

  osc.connect(gainNode)
  gainNode.connect(masterGain!)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.05)

  osc.onended = () => {
    osc.disconnect()
    gainNode.disconnect()
  }
}

/** Bright ascending arpeggio: C4 → E4 → G4 → C5. */
export function playSuccess(): void {
  const ctx = ensureContext()
  if (!ctx) return

  const notes = [261.63, 329.63, 392.0, 523.25]
  const noteDuration = 0.08
  const gap = 0.1

  notes.forEach((freq, i) => {
    const offset = i * gap
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + offset)

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime + offset)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + offset + noteDuration)

    osc.connect(gainNode)
    gainNode.connect(masterGain!)
    osc.start(ctx.currentTime + offset)
    osc.stop(ctx.currentTime + offset + noteDuration)

    osc.onended = () => {
      osc.disconnect()
      gainNode.disconnect()
    }
  })
}

/** Descending, slightly distorted tone for incorrect answers. */
export function playFailure(): void {
  const ctx = ensureContext()
  if (!ctx) return

  const now = ctx.currentTime
  const duration = 0.4

  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(300, now)
  osc.frequency.linearRampToValueAtTime(100, now + duration)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(800, now)

  gainNode.gain.setValueAtTime(0.3, now)
  gainNode.gain.linearRampToValueAtTime(0, now + duration)

  osc.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(masterGain!)
  osc.start(now)
  osc.stop(now + duration)

  osc.onended = () => {
    osc.disconnect()
    filter.disconnect()
    gainNode.disconnect()
  }
}

/** Epic fanfare on module completion: C4 → E4 → G4 → C5 → G4 → C5. */
export function playLevelUp(): void {
  const ctx = ensureContext()
  if (!ctx) return

  const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 523.25]
  const noteDuration = 0.1
  const gap = 0.08
  const lastNoteDuration = 0.3

  notes.forEach((freq, i) => {
    const offset = i * gap
    const isLast = i === notes.length - 1
    const dur = isLast ? lastNoteDuration : noteDuration

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + offset)

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime + offset)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + offset + dur)

    osc.connect(gainNode)
    gainNode.connect(masterGain!)
    osc.start(ctx.currentTime + offset)
    osc.stop(ctx.currentTime + offset + dur)

    osc.onended = () => {
      osc.disconnect()
      gainNode.disconnect()
    }
  })
}

/** Rapid alternating high-low beep for security warnings. */
export function playAlarm(): void {
  const ctx = ensureContext()
  if (!ctx) return

  const now = ctx.currentTime
  const beepDuration = 0.5 / 6 // 3 alternations = 6 half-cycles
  const frequencies = [800, 600]

  for (let i = 0; i < 6; i++) {
    const offset = i * beepDuration
    const freq = frequencies[i % 2]

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, now + offset)

    gainNode.gain.setValueAtTime(0.25, now + offset)
    gainNode.gain.linearRampToValueAtTime(0, now + offset + beepDuration)

    osc.connect(gainNode)
    gainNode.connect(masterGain!)
    osc.start(now + offset)
    osc.stop(now + offset + beepDuration)

    osc.onended = () => {
      activeOscillators.delete(osc)
      osc.disconnect()
      gainNode.disconnect()
    }
  }
}

// ---------------------------------------------------------------------------
// Hook-specific sounds (moved from useAudioSynth to single AudioContext)
// ---------------------------------------------------------------------------

/** Quick high-pitched sweep for hover feedback. */
export function playHover(): void {
  const ctx = ensureContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.linearRampToValueAtTime(1200, now + 0.05)

  gainNode.gain.setValueAtTime(0.1, now)
  gainNode.gain.linearRampToValueAtTime(0, now + 0.05)

  osc.connect(gainNode)
  gainNode.connect(masterGain!)
  activeOscillators.add(osc)
  osc.start(now)
  osc.stop(now + 0.05)

  osc.onended = () => {
    activeOscillators.delete(osc)
    osc.disconnect()
    gainNode.disconnect()
  }
}

/** High arpeggio C5→E5→G5→C6 (higher octave than playSuccess). */
export function playSuccessArpeggio(): void {
  const ctx = ensureContext()
  if (!ctx) return

  const notes = [523.25, 659.25, 783.99, 1046.5]
  const noteDuration = 0.1
  const gap = 0.1

  notes.forEach((freq, i) => {
    const offset = i * gap
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + offset)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime + offset)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + offset + noteDuration)

    osc.connect(gainNode)
    gainNode.connect(masterGain!)
    activeOscillators.add(osc)
    osc.start(ctx.currentTime + offset)
    osc.stop(ctx.currentTime + offset + noteDuration)

    osc.onended = () => {
      activeOscillators.delete(osc)
      osc.disconnect()
      gainNode.disconnect()
    }
  })
}

/** Sawtooth sweep 800→200 for failure feedback. */
export function playFailureSiren(): void {
  const ctx = ensureContext()
  if (!ctx) return

  const now = ctx.currentTime
  const duration = 0.3

  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.linearRampToValueAtTime(200, now + duration)

  gainNode.gain.setValueAtTime(0.25, now)
  gainNode.gain.linearRampToValueAtTime(0, now + duration)

  osc.connect(gainNode)
  gainNode.connect(masterGain!)
  activeOscillators.add(osc)
  osc.start(now)
  osc.stop(now + duration)

  osc.onended = () => {
    activeOscillators.delete(osc)
    osc.disconnect()
    gainNode.disconnect()
  }
}

/** 4-beat 440Hz square pulse at 120 BPM. */
export function playWarningPulse(): void {
  const ctx = ensureContext()
  if (!ctx) return

  const now = ctx.currentTime
  const beatDuration = 0.25

  for (let i = 0; i < 4; i++) {
    const offset = i * beatDuration
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(440, now + offset)

    gainNode.gain.setValueAtTime(0.2, now + offset)
    gainNode.gain.linearRampToValueAtTime(0, now + offset + beatDuration)

    osc.connect(gainNode)
    gainNode.connect(masterGain!)
    activeOscillators.add(osc)
    osc.start(now + offset)
    osc.stop(now + offset + beatDuration)

    osc.onended = () => {
      activeOscillators.delete(osc)
      osc.disconnect()
      gainNode.disconnect()
    }
  }
}

// ---------------------------------------------------------------------------
// Cleanup — call during component teardown (e.g. useAudioSynth unmount)
// ---------------------------------------------------------------------------

/**
 * Stop all currently active oscillators and optionally close the
 * AudioContext.  Safe to call multiple times.
 */
export function cleanupAudio(): void {
  for (const osc of Array.from(activeOscillators)) {
    try { osc.stop() } catch { /* already stopped */ }
    osc.disconnect()
  }
  activeOscillators.clear()
}
