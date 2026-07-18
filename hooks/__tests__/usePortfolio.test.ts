/**
 * usePortfolio tests
 *
 * Tests the portfolio aggregation hook: addEntry, getEntriesForCompetency,
 * exportPortfolio, clearPortfolio, competencyScores, overallScore.
 *
 * Requires: vitest, @testing-library/react, @testing-library/jest-dom
 * Run: pnpm test hooks/__tests__/usePortfolio.test.ts
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePortfolio } from '../usePortfolio'
import type { PortfolioEntry, SkillCompetencyTag, CompetencyScore } from '@/types/educational'

// ─── Mock localStorage ────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
})()

beforeEach(() => {
  localStorageMock.clear()
  vi.stubGlobal('window', { localStorage: localStorageMock })
})

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeEntry(
  overrides: Partial<PortfolioEntry> = {}
): PortfolioEntry {
  return {
    scenarioId: 'scenario-1',
    moduleName: 'Módulo 1',
    competencyTag: 'email-analysis',
    responses: { q1: 'test' },
    rubricScore: 80,
    timestamp: Date.now(),
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usePortfolio', () => {
  it('should initialize with empty entries', () => {
    const { result } = renderHook(() => usePortfolio())

    expect(result.current.entries).toEqual([])
    expect(result.current.totalEntries).toBe(0)
    expect(result.current.overallScore).toBe(0)
    expect(result.current.competencyScores).toEqual([])
  })

  it('should add an entry', () => {
    const { result } = renderHook(() => usePortfolio())
    const entry = makeEntry()

    act(() => {
      result.current.addEntry(entry)
    })

    expect(result.current.entries).toHaveLength(1)
    expect(result.current.totalEntries).toBe(1)
    expect(result.current.entries[0].scenarioId).toBe('scenario-1')
  })

  it('should add entries at the beginning (most recent first)', () => {
    const { result } = renderHook(() => usePortfolio())
    const entry1 = makeEntry({ scenarioId: 's1', timestamp: 100 })
    const entry2 = makeEntry({ scenarioId: 's2', timestamp: 200 })

    act(() => {
      result.current.addEntry(entry1)
    })
    act(() => {
      result.current.addEntry(entry2)
    })

    expect(result.current.entries[0].scenarioId).toBe('s2')
    expect(result.current.entries[1].scenarioId).toBe('s1')
  })

  it('should cap entries at 200', () => {
    const { result } = renderHook(() => usePortfolio())

    act(() => {
      for (let i = 0; i < 210; i++) {
        result.current.addEntry(makeEntry({ scenarioId: `s${i}` }))
      }
    })

    expect(result.current.entries).toHaveLength(200)
    // Most recent (s209) should be first
    expect(result.current.entries[0].scenarioId).toBe('s209')
  })

  it('should get entries for a specific competency', () => {
    const { result } = renderHook(() => usePortfolio())

    act(() => {
      result.current.addEntry(makeEntry({ competencyTag: 'email-analysis' }))
      result.current.addEntry(makeEntry({ competencyTag: 'url-inspection' }))
      result.current.addEntry(makeEntry({ competencyTag: 'email-analysis' }))
    })

    const emailEntries = result.current.getEntriesForCompetency('email-analysis')
    expect(emailEntries).toHaveLength(2)

    const urlEntries = result.current.getEntriesForCompetency('url-inspection')
    expect(urlEntries).toHaveLength(1)
  })

  it('should compute competency scores', () => {
    const { result } = renderHook(() => usePortfolio())

    act(() => {
      result.current.addEntry(makeEntry({ competencyTag: 'email-analysis', rubricScore: 80 }))
      result.current.addEntry(makeEntry({ competencyTag: 'email-analysis', rubricScore: 90 }))
      result.current.addEntry(makeEntry({ competencyTag: 'url-inspection', rubricScore: 70 }))
    })

    const scores = result.current.competencyScores
    expect(scores).toHaveLength(2)

    const emailScore = scores.find((s: CompetencyScore) => s.tag === 'email-analysis')
    expect(emailScore).toBeDefined()
    expect(emailScore!.score).toBe(85) // average of 80 and 90
    expect(emailScore!.attempts).toBe(2)

    const urlScore = scores.find((s: CompetencyScore) => s.tag === 'url-inspection')
    expect(urlScore).toBeDefined()
    expect(urlScore!.score).toBe(70)
    expect(urlScore!.attempts).toBe(1)
  })

  it('should compute overall score as average of all rubricScore entries', () => {
    const { result } = renderHook(() => usePortfolio())

    act(() => {
      result.current.addEntry(makeEntry({ rubricScore: 80 }))
      result.current.addEntry(makeEntry({ rubricScore: 60 }))
    })

    expect(result.current.overallScore).toBe(70)
  })

  it('should handle entries without rubricScore', () => {
    const { result } = renderHook(() => usePortfolio())

    act(() => {
      result.current.addEntry(makeEntry({ rubricScore: undefined }))
      result.current.addEntry(makeEntry({ rubricScore: 80 }))
    })

    // Overall: only scored entries count
    expect(result.current.overallScore).toBe(80)
  })

  it('should export portfolio as JSON', () => {
    const { result } = renderHook(() => usePortfolio())

    act(() => {
      result.current.addEntry(makeEntry())
    })

    const exported = JSON.parse(result.current.exportPortfolio())
    expect(exported.version).toBe(1)
    expect(exported.entries).toHaveLength(1)
    expect(exported.exportedAt).toBeDefined()
  })

  it('should clear portfolio', () => {
    const { result } = renderHook(() => usePortfolio())

    act(() => {
      result.current.addEntry(makeEntry())
      result.current.addEntry(makeEntry({ scenarioId: 's2' }))
    })

    expect(result.current.totalEntries).toBe(2)

    act(() => {
      result.current.clearPortfolio()
    })

    expect(result.current.totalEntries).toBe(0)
    expect(result.current.entries).toEqual([])
    expect(result.current.competencyScores).toEqual([])
  })

  it('should build portfolio object with competencies keyed by tag', () => {
    const { result } = renderHook(() => usePortfolio())

    act(() => {
      result.current.addEntry(makeEntry({ competencyTag: 'email-analysis', rubricScore: 85 }))
    })

    const portfolio = result.current.portfolio
    expect(portfolio.entries).toHaveLength(1)
    expect(portfolio.competencies['email-analysis']).toBeDefined()
    expect(portfolio.competencies['email-analysis'].score).toBe(85)
  })
})
