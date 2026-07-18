'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { HUDContextValue, AutonomyLevel } from '@/lib/gameTypes'

const HUD_STORAGE_KEY = 'cg_2026_hud_state' as const

const defaultState = {
  shieldHP: 100,
  maxShieldHP: 100,
  autonomyLevel: 'novice' as AutonomyLevel,
  xp: 0,
  currentModule: null as number | null,
  notebookOpen: false,
  challenges: [] as import('@/lib/gameTypes').Challenge[],
  completedChallenges: [] as string[],
}

const HUDContext = createContext<HUDContextValue>({
  ...defaultState,
  damageShield: () => {},
  healShield: () => {},
  addXP: () => {},
  setCurrentModule: () => {},
  resetHUD: () => {},
  toggleNotebook: () => {},
  completeChallenge: () => {},
})

function loadHUDState(): typeof defaultState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(HUD_STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<typeof defaultState>
    return { ...defaultState, ...parsed }
  } catch {
    return defaultState
  }
}

export default function HUDProvider({ children }: { children: React.ReactNode }) {
  // Always start with defaultState on both server and client to avoid
  // hydration mismatch.  localStorage is read in the first useEffect.
  const [state, setState] = useState(defaultState)
  const [hydrated, setHydrated] = useState(false)

  // On first client render, load persisted state from localStorage.
  useEffect(() => {
    setState(loadHUDState())
    setHydrated(true)
  }, [])

  // Persist to localStorage on change (only after hydration)
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(HUD_STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const damageShield = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      shieldHP: Math.max(0, prev.shieldHP - amount),
    }))
  }, [])

  const healShield = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      shieldHP: Math.min(prev.maxShieldHP, prev.shieldHP + amount),
    }))
  }, [])

  const addXP = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, xp: prev.xp + amount }))
  }, [])

  const setCurrentModule = useCallback((id: number | null) => {
    setState((prev) => ({ ...prev, currentModule: id }))
  }, [])

  const resetHUD = useCallback(() => {
    setState(defaultState)
  }, [])

  const toggleNotebook = useCallback(() => {
    setState((prev) => ({ ...prev, notebookOpen: !prev.notebookOpen }))
  }, [])

  const completeChallenge = useCallback((challengeId: string) => {
    setState((prev) => ({
      ...prev,
      completedChallenges: [...prev.completedChallenges, challengeId],
    }))
  }, [])

  return (
    <HUDContext.Provider
      value={{
        ...state,
        damageShield,
        healShield,
        addXP,
        setCurrentModule,
        resetHUD,
        toggleNotebook,
        completeChallenge,
      }}
    >
      {children}
    </HUDContext.Provider>
  )
}

export function useHUD(): HUDContextValue {
  return useContext(HUDContext)
}
