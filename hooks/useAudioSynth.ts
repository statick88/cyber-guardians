import { useCallback, useEffect } from 'react'
import {
  playClick,
  playSuccess,
  playFailure,
  playLevelUp,
  playAlarm,
  playHover,
  playSuccessArpeggio,
  playFailureSiren,
  playWarningPulse,
  cleanupAudio,
  isAudioMuted,
} from '@/lib/soundEffects'

/**
 * React hook that exposes the CyberGuardians audio API.
 *
 * All sound generation lives in `lib/soundEffects.ts` (single AudioContext
 * singleton). This hook exists only to provide a React-friendly interface
 * with useCallback memoisation and automatic cleanup on unmount.
 */
export default function useAudioSynth() {
  // Stop all orphaned oscillators when the component using this hook unmounts.
  useEffect(() => {
    return () => {
      cleanupAudio()
    }
  }, [])

  return {
    playClick:    useCallback(() => { void playClick() }, []),
    playSuccess:  useCallback(() => { void playSuccess() }, []),
    playFailure:  useCallback(() => { void playFailure() }, []),
    playLevelUp:  useCallback(() => { void playLevelUp() }, []),
    playAlarm:    useCallback(() => { void playAlarm() }, []),
    playHover:    useCallback(() => { void playHover() }, []),
    playSuccessArpeggio: useCallback(() => { void playSuccessArpeggio() }, []),
    playFailureSiren:    useCallback(() => { void playFailureSiren() }, []),
    playWarningPulse:    useCallback(() => { void playWarningPulse() }, []),
    isAudioMuted,
  }
}
