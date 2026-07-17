'use client'

import { useState, useCallback, useEffect } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NotebookEntry {
  id: string
  scenarioId: string
  moduleName: string
  timestamp: number
  reflection: string
  conflictQuestion: string
  scaffoldingHint: string
  /** Player's self-assessment: 1 (confused) to 5 (mastered) */
  selfAssessment: number
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'cg_notebook_entries'

function loadEntries(): NotebookEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as NotebookEntry[]
  } catch {
    return []
  }
}

function persistEntries(entries: NotebookEntry[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useNotebook manages the Operator Logbook — a localStorage-persisted
 * collection of reflection entries from completed scenarios.
 */
export function useNotebook() {
  const [entries, setEntries] = useState<NotebookEntry[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage after hydration
  useEffect(() => {
    setEntries(loadEntries())
    setHydrated(true)
  }, [])

  // Persist on change (only after hydration)
  useEffect(() => {
    if (!hydrated) return
    persistEntries(entries)
  }, [entries, hydrated])

  const addEntry = useCallback(
    (entry: Omit<NotebookEntry, 'id' | 'timestamp'>) => {
      const newEntry: NotebookEntry = {
        ...entry,
        id: `nb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
      }
      setEntries((prev) => [newEntry, ...prev])
    },
    []
  )

  const getEntries = useCallback(() => entries, [entries])

  const clearEntries = useCallback(() => {
    setEntries([])
  }, [])

  return { entries, addEntry, getEntries, clearEntries }
}
