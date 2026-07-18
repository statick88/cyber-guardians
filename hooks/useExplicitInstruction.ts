'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ActivityType } from '@/types/educational'

const INTRODUCED_KEY = 'cg_introduced_types'
const VIEWED_EXAMPLES_KEY = 'cg_viewed_examples'

// ─── SSR-safe localStorage helpers ────────────────────────────────────────────

function readSet(key: string): Set<ActivityType> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    const arr: ActivityType[] = JSON.parse(raw)
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function writeSet(key: string, value: Set<ActivityType>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(value)))
  } catch {
    // localStorage quota exceeded or unavailable — fail silently
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseExplicitInstructionReturn {
  /** Check if a given activity type has NOT been introduced yet (i.e., should show ConceptCard) */
  shouldShow: (activityType: ActivityType) => boolean
  /** Mark an activity type as introduced */
  markIntroduced: (activityType: ActivityType) => void
  /** Check if worked example has been viewed for this activity type */
  hasViewedExample: (activityType: ActivityType) => boolean
  /** Mark worked example as viewed */
  markExampleViewed: (activityType: ActivityType) => void
  /** Reset all introduction state (for testing) */
  resetAll: () => void
}

export function useExplicitInstruction(): UseExplicitInstructionReturn {
  const [introduced, setIntroduced] = useState<Set<ActivityType>>(new Set())
  const [viewedExamples, setViewedExamples] = useState<Set<ActivityType>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    setIntroduced(readSet(INTRODUCED_KEY))
    setViewedExamples(readSet(VIEWED_EXAMPLES_KEY))
    setHydrated(true)
  }, [])

  const shouldShow = useCallback(
    (activityType: ActivityType): boolean => {
      // Before hydration, show ConceptCard for all (safe default — avoids flicker)
      if (!hydrated) return true
      return !introduced.has(activityType)
    },
    [hydrated, introduced]
  )

  const markIntroduced = useCallback(
    (activityType: ActivityType) => {
      setIntroduced((prev) => {
        const next = new Set(prev)
        next.add(activityType)
        writeSet(INTRODUCED_KEY, next)
        return next
      })
    },
    []
  )

  const hasViewedExample = useCallback(
    (activityType: ActivityType): boolean => {
      if (!hydrated) return false
      return viewedExamples.has(activityType)
    },
    [hydrated, viewedExamples]
  )

  const markExampleViewed = useCallback(
    (activityType: ActivityType) => {
      setViewedExamples((prev) => {
        const next = new Set(prev)
        next.add(activityType)
        writeSet(VIEWED_EXAMPLES_KEY, next)
        return next
      })
    },
    []
  )

  const resetAll = useCallback(() => {
    const empty = new Set<ActivityType>()
    setIntroduced(empty)
    setViewedExamples(empty)
    writeSet(INTRODUCED_KEY, empty)
    writeSet(VIEWED_EXAMPLES_KEY, empty)
  }, [])

  return {
    shouldShow,
    markIntroduced,
    hasViewedExample,
    markExampleViewed,
    resetAll,
  }
}
