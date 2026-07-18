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
import { renderHook } from '@testing-library/react'
import { useAdaptivePath } from '../useAdaptivePath'
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
  vi.stubGlobal('localStorage', localStorageMock)
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

function seedPortfolio(entries: PortfolioEntry[]): void {
  localStorageMock.setItem('cg_portfolio', JSON.stringify(entries))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAdaptivePath', () => {
  it('returns empty recommendations for empty portfolio', () => {
    const { result } = renderHook(() => useAdaptivePath())

    expect(result.current.getRecommendations()).toEqual([])
    expect(result.current.getWeakestCompetency()).toBeNull()
  })

  it('returns weakest competency first', () => {
    seedPortfolio([
      makeEntry({ competencyTag: 'email-analysis', rubricScore: 90 }),
      makeEntry({ competencyTag: 'url-inspection', rubricScore: 30 }),
      makeEntry({ competencyTag: 'phishing-sim', rubricScore: 60 }),
    ])

    const { result } = renderHook(() => useAdaptivePath())

    const recs = result.current.getRecommendations()
    expect(recs).toHaveLength(3)
    // Weakest first (url-inspection: 30)
    expect(recs[0].tag).toBe('url-inspection')
    expect(recs[0].gap).toBe(70) // 100 - 30
    expect(recs[1].tag).toBe('phishing-sim')
    expect(recs[2].tag).toBe('email-analysis')
  })

  it('getWeakestCompetency returns the tag with lowest score', () => {
    seedPortfolio([
      makeEntry({ competencyTag: 'email-analysis', rubricScore: 85 }),
      makeEntry({ competencyTag: 'digital-defense', rubricScore: 40 }),
    ])

    const { result } = renderHook(() => useAdaptivePath())

    expect(result.current.getWeakestCompetency()).toBe('digital-defense')
  })

  it('respects count parameter in getRecommendations', () => {
    seedPortfolio([
      makeEntry({ competencyTag: 'email-analysis', rubricScore: 90 }),
      makeEntry({ competencyTag: 'url-inspection', rubricScore: 30 }),
      makeEntry({ competencyTag: 'phishing-sim', rubricScore: 60 }),
    ])

    const { result } = renderHook(() => useAdaptivePath())

    const recs = result.current.getRecommendations(2)
    expect(recs).toHaveLength(2)
    expect(recs[0].tag).toBe('url-inspection')
    expect(recs[1].tag).toBe('phishing-sim')
  })

  it('generates appropriate recommendation reasons', () => {
    seedPortfolio([
      makeEntry({ competencyTag: 'email-analysis', rubricScore: 10 }),
    ])

    const { result } = renderHook(() => useAdaptivePath())

    const recs = result.current.getRecommendations()
    expect(recs[0].reason).toContain('bajo')
  })

  it('returns entry with score 0 when rubric score is undefined', () => {
    seedPortfolio([makeEntry({ rubricScore: undefined })])

    const { result } = renderHook(() => useAdaptivePath())

    const recs = result.current.getRecommendations()
    expect(recs).toHaveLength(1)
    expect(recs[0].score).toBe(0)
    expect(recs[0].gap).toBe(100)
  })
})
