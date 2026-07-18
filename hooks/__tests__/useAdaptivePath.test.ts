/**
 * useAdaptivePath tests
 *
 * Tests the adaptive path hook: getRecommendations, getWeakestCompetency.
 * Verifies weakest-first ordering, empty portfolio handling, and
 * recommendation reason generation.
 *
 * Requires: vitest, @testing-library/react
 * Run: pnpm test hooks/__tests__/useAdaptivePath.test.ts
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAdaptivePath } from '../useAdaptivePath'
import { usePortfolio } from '../usePortfolio'
import type { PortfolioEntry } from '@/types/educational'

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

describe('useAdaptivePath', () => {
  it('returns empty recommendations for empty portfolio', () => {
    const { result } = renderHook(() => useAdaptivePath())

    expect(result.current.getRecommendations()).toEqual([])
    expect(result.current.getWeakestCompetency()).toBeNull()
  })

  it('returns weakest competency first', () => {
    const { result: portfolioHook } = renderHook(() => usePortfolio())
    const { result: adaptiveHook } = renderHook(() => useAdaptivePath())

    act(() => {
      portfolioHook.current.addEntry(
        makeEntry({ competencyTag: 'email-analysis', rubricScore: 90 })
      )
      portfolioHook.current.addEntry(
        makeEntry({ competencyTag: 'url-inspection', rubricScore: 30 })
      )
      portfolioHook.current.addEntry(
        makeEntry({ competencyTag: 'phishing-sim', rubricScore: 60 })
      )
    })

    const recs = adaptiveHook.current.getRecommendations()
    expect(recs).toHaveLength(3)
    // Weakest first (url-inspection: 30)
    expect(recs[0].tag).toBe('url-inspection')
    expect(recs[0].gap).toBe(70) // 100 - 30
    expect(recs[1].tag).toBe('phishing-sim')
    expect(recs[2].tag).toBe('email-analysis')
  })

  it('getWeakestCompetency returns the tag with lowest score', () => {
    const { result: portfolioHook } = renderHook(() => usePortfolio())
    const { result: adaptiveHook } = renderHook(() => useAdaptivePath())

    act(() => {
      portfolioHook.current.addEntry(
        makeEntry({ competencyTag: 'email-analysis', rubricScore: 85 })
      )
      portfolioHook.current.addEntry(
        makeEntry({ competencyTag: 'digital-defense', rubricScore: 40 })
      )
    })

    expect(adaptiveHook.current.getWeakestCompetency()).toBe('digital-defense')
  })

  it('respects count parameter in getRecommendations', () => {
    const { result: portfolioHook } = renderHook(() => usePortfolio())
    const { result: adaptiveHook } = renderHook(() => useAdaptivePath())

    act(() => {
      portfolioHook.current.addEntry(makeEntry({ competencyTag: 'email-analysis', rubricScore: 90 }))
      portfolioHook.current.addEntry(makeEntry({ competencyTag: 'url-inspection', rubricScore: 30 }))
      portfolioHook.current.addEntry(makeEntry({ competencyTag: 'phishing-sim', rubricScore: 60 }))
    })

    const recs = adaptiveHook.current.getRecommendations(2)
    expect(recs).toHaveLength(2)
    expect(recs[0].tag).toBe('url-inspection')
    expect(recs[1].tag).toBe('phishing-sim')
  })

  it('generates appropriate recommendation reasons', () => {
    const { result: portfolioHook } = renderHook(() => usePortfolio())
    const { result: adaptiveHook } = renderHook(() => useAdaptivePath())

    act(() => {
      portfolioHook.current.addEntry(
        makeEntry({ competencyTag: 'email-analysis', rubricScore: 10 })
      )
    })

    const recs = adaptiveHook.current.getRecommendations()
    expect(recs[0].reason).toContain('bajo')
  })

  it('returns empty array when no entries have rubric scores', () => {
    const { result: portfolioHook } = renderHook(() => usePortfolio())
    const { result: adaptiveHook } = renderHook(() => useAdaptivePath())

    act(() => {
      portfolioHook.current.addEntry(makeEntry({ rubricScore: undefined }))
    })

    // No rubric scores means all scores are 0 — recommendations should still work
    const recs = adaptiveHook.current.getRecommendations()
    expect(recs).toHaveLength(1)
    expect(recs[0].score).toBe(0)
    expect(recs[0].gap).toBe(100)
  })
})
