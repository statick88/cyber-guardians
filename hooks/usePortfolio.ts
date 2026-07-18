'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import type {
  PortfolioEntry,
  SkillCompetencyTag,
  CompetencyScore,
  Portfolio,
} from '@/types/educational'

// ─── Constants ────────────────────────────────────────────────────────────────

const PORTFOLIO_KEY = 'cg_portfolio'
const MAX_ENTRIES = 200

// ─── All SkillCompetencyTags ──────────────────────────────────────────────────

const ALL_SKILL_TAGS: SkillCompetencyTag[] = [
  'email-analysis',
  'url-inspection',
  'phishing-sim',
  'digital-defense',
  'metadata-extraction',
  'cookie-sweeping',
]

// ─── SSR-safe localStorage helpers ────────────────────────────────────────────

function readPortfolio(): PortfolioEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY)
    if (!raw) return []
    const parsed: PortfolioEntry[] = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ENTRIES) : []
  } catch {
    return []
  }
}

function writePortfolio(entries: PortfolioEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // localStorage quota exceeded or unavailable — fail silently
  }
}

// ─── Pure Functions ───────────────────────────────────────────────────────────

/**
 * computeCompetencyScores aggregates portfolio entries into per-tag scores.
 *
 * Each entry contributes its rubricScore (or 0 if absent) to the relevant tag.
 * Score is normalized to 0–100 range.
 *
 * @param entries - Portfolio entries to aggregate
 */
function computeCompetencyScores(entries: PortfolioEntry[]): CompetencyScore[] {
  const tagData = new Map<SkillCompetencyTag, { totalScore: number; count: number; lastUpdated: number }>()

  // Initialize all tags
  for (const tag of ALL_SKILL_TAGS) {
    tagData.set(tag, { totalScore: 0, count: 0, lastUpdated: 0 })
  }

  // Aggregate
  for (const entry of entries) {
    const data = tagData.get(entry.competencyTag)!
    data.totalScore += entry.rubricScore ?? 0
    data.count += 1
    if (entry.timestamp > data.lastUpdated) {
      data.lastUpdated = entry.timestamp
    }
  }

  // Convert to scores (only tags with attempts)
  return ALL_SKILL_TAGS
    .filter((tag) => tagData.get(tag)!.count > 0)
    .map((tag) => {
      const { totalScore, count, lastUpdated } = tagData.get(tag)!
      const avgScore = count > 0 ? Math.round((totalScore / count) * 100) / 100 : 0
      return {
        tag,
        score: Math.min(100, Math.max(0, avgScore)),
        attempts: count,
        lastUpdated,
      }
    })
    .sort((a, b) => b.score - a.score)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UsePortfolioReturn {
  /** Portfolio entries (most recent first) */
  entries: PortfolioEntry[]
  /** Per-competency scores aggregated from entries */
  competencyScores: CompetencyScore[]
  /** Full portfolio object */
  portfolio: Portfolio
  /** Total entries in portfolio */
  totalEntries: number
  /** Overall average rubric score (0–100) */
  overallScore: number
  /** Add a portfolio entry */
  addEntry: (entry: PortfolioEntry) => void
  /** Get entries for a specific competency tag */
  getEntriesForCompetency: (tag: SkillCompetencyTag) => PortfolioEntry[]
  /** Export portfolio as JSON string */
  exportPortfolio: () => string
  /** Clear all portfolio data */
  clearPortfolio: () => void
}

export function usePortfolio(): UsePortfolioReturn {
  const [entries, setEntries] = useState<PortfolioEntry[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    setEntries(readPortfolio())
    setHydrated(true)
  }, [])

  // Persist whenever entries change (after hydration)
  useEffect(() => {
    if (hydrated) {
      writePortfolio(entries)
    }
  }, [entries, hydrated])

  const addEntry = useCallback((entry: PortfolioEntry) => {
    setEntries((prev) => {
      const next = [entry, ...prev]
      return next.slice(0, MAX_ENTRIES)
    })
  }, [])

  const getEntriesForCompetency = useCallback(
    (tag: SkillCompetencyTag): PortfolioEntry[] => {
      return entries.filter((e) => e.competencyTag === tag)
    },
    [entries]
  )

  const exportPortfolio = useCallback((): string => {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        entries,
      },
      null,
      2
    )
  }, [entries])

  const clearPortfolio = useCallback(() => {
    setEntries([])
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(PORTFOLIO_KEY)
      } catch {
        // fail silently
      }
    }
  }, [])

  // Derived values
  const competencyScores = useMemo(
    () => computeCompetencyScores(entries),
    [entries]
  )

  const totalEntries = entries.length

  const overallScore = useMemo(() => {
    if (entries.length === 0) return 0
    const scored = entries.filter((e) => e.rubricScore !== undefined)
    if (scored.length === 0) return 0
    const sum = scored.reduce((acc, e) => acc + (e.rubricScore ?? 0), 0)
    return Math.round((sum / scored.length) * 100) / 100
  }, [entries])

  const portfolio: Portfolio = useMemo(
    () => ({
      competencies: Object.fromEntries(
        competencyScores.map((cs) => [cs.tag, cs])
      ) as Record<SkillCompetencyTag, CompetencyScore>,
      entries,
    }),
    [competencyScores, entries]
  )

  return {
    entries,
    competencyScores,
    portfolio,
    totalEntries,
    overallScore,
    addEntry,
    getEntriesForCompetency,
    exportPortfolio,
    clearPortfolio,
  }
}
