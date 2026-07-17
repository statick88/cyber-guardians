'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import type { GamePauseContextValue } from '@/types/educational'

const GamePauseContext = createContext<GamePauseContextValue>({
  isPaused: false,
  pauseGame: () => {},
  resumeGame: () => {},
  registerGame: () => {},
  unregisterGame: () => {},
})

type GameRegistration = {
  pause: () => void
  resume: () => void
}

/**
 * GamePauseProvider wraps module games to coordinate pause/resume.
 *
 * Each game registers its own pause/resume functions via `registerGame(id, pause, resume)`.
 * Only one game is active at a time; the last registered game is the target.
 * `pauseGame()` pauses the currently registered game and sets `isPaused = true`.
 * `resumeGame()` resumes it and sets `isPaused = false`.
 */
export function GamePauseProvider({ children }: { children: React.ReactNode }) {
  const [isPaused, setIsPaused] = useState(false)
  const registrations = useRef<Map<string, GameRegistration>>(new Map())

  const registerGame = useCallback((id: string, pause: () => void, resume: () => void) => {
    registrations.current.set(id, { pause, resume })
  }, [])

  const unregisterGame = useCallback((id: string) => {
    registrations.current.delete(id)
  }, [])

  const pauseGame = useCallback(() => {
    // Pause the last registered game (most recently active)
    const keys = Array.from(registrations.current.keys())
    if (keys.length > 0) {
      const last = registrations.current.get(keys[keys.length - 1])
      last?.pause()
    }
    setIsPaused(true)
  }, [])

  const resumeGame = useCallback(() => {
    const keys = Array.from(registrations.current.keys())
    if (keys.length > 0) {
      const last = registrations.current.get(keys[keys.length - 1])
      last?.resume()
    }
    setIsPaused(false)
  }, [])

  return (
    <GamePauseContext.Provider
      value={{ isPaused, pauseGame, resumeGame, registerGame, unregisterGame }}
    >
      {children}
    </GamePauseContext.Provider>
  )
}

export function useGamePause(): GamePauseContextValue {
  return useContext(GamePauseContext)
}
