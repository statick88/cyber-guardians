'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { isAudioMuted, setAudioMuted, initAudio } from '@/lib/soundEffects'

export default function VolumeControl() {
  const [muted, setMuted] = useState(false)

  // Sync with localStorage + master gain on mount
  useEffect(() => {
    initAudio()
    setMuted(isAudioMuted())
  }, [])

  function toggle() {
    const next = !muted
    setMuted(next)
    setAudioMuted(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      className={`
        min-h-[44px] min-w-[44px]
        flex items-center justify-center
        bg-slate-800/80 backdrop-blur-sm
        border border-slate-700
        rounded-full
        text-slate-300 hover:text-white
        hover:scale-110
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-cyan-400
      `}
    >
      {muted ? (
        <VolumeX className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Volume2 className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  )
}
