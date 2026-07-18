/**
 * useExplicitInstruction tests
 *
 * Tests the explicit instruction hook: shouldShow, markIntroduced,
 * hasViewedExample, markExampleViewed, resetAll, localStorage round-trip.
 *
 * Requires: vitest, @testing-library/react
 * Run: pnpm test hooks/__tests__/useExplicitInstruction.test.ts
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExplicitInstruction } from '../useExplicitInstruction'
import type { ActivityType } from '@/types/educational'

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
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useExplicitInstruction', () => {
  it('shouldShow returns true for all types before hydration', () => {
    const { result } = renderHook(() => useExplicitInstruction())

    // Before useEffect fires (SSR simulation), shouldShow should return true
    const types: ActivityType[] = ['email_analysis', 'url_inspection', 'phishing_scenario']
    for (const t of types) {
      expect(result.current.shouldShow(t)).toBe(true)
    }
  })

  it('shouldShow returns true for unvisited types after hydration', () => {
    const { result } = renderHook(() => useExplicitInstruction())

    expect(result.current.shouldShow('email_analysis')).toBe(true)
    expect(result.current.shouldShow('url_inspection')).toBe(true)
  })

  it('markIntroduced makes shouldShow return false for that type', () => {
    const { result } = renderHook(() => useExplicitInstruction())

    act(() => {
      result.current.markIntroduced('email_analysis')
    })

    expect(result.current.shouldShow('email_analysis')).toBe(false)
    // Other types still show
    expect(result.current.shouldShow('url_inspection')).toBe(true)
  })

  it('localStorage round-trip: introduced types persist', () => {
    const { result } = renderHook(() => useExplicitInstruction())

    act(() => {
      result.current.markIntroduced('email_analysis')
    })

    act(() => {
      result.current.markIntroduced('phishing_scenario')
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cg_introduced_types',
      expect.stringContaining('email_analysis')
    )

    // Verify JSON is valid — use the last setItem call which reflects final state
    const calls = localStorageMock.setItem.mock.calls.filter(
      (c: [string, string]) => c[0] === 'cg_introduced_types'
    )
    const call = calls[calls.length - 1]
    expect(call).toBeDefined()
    const parsed: ActivityType[] = JSON.parse(call![1])
    expect(parsed).toContain('email_analysis')
    expect(parsed).toContain('phishing_scenario')
  })

  it('hasViewedExample returns false by default', () => {
    const { result } = renderHook(() => useExplicitInstruction())

    expect(result.current.hasViewedExample('email_analysis')).toBe(false)
  })

  it('markExampleViewed makes hasViewedExample return true', () => {
    const { result } = renderHook(() => useExplicitInstruction())

    act(() => {
      result.current.markExampleViewed('email_analysis')
    })

    expect(result.current.hasViewedExample('email_analysis')).toBe(true)
    expect(result.current.hasViewedExample('url_inspection')).toBe(false)
  })

  it('resetAll clears both introduced and viewedExamples', () => {
    const { result } = renderHook(() => useExplicitInstruction())

    act(() => {
      result.current.markIntroduced('email_analysis')
      result.current.markExampleViewed('email_analysis')
    })

    expect(result.current.shouldShow('email_analysis')).toBe(false)
    expect(result.current.hasViewedExample('email_analysis')).toBe(true)

    act(() => {
      result.current.resetAll()
    })

    expect(result.current.shouldShow('email_analysis')).toBe(true)
    expect(result.current.hasViewedExample('email_analysis')).toBe(false)
  })

  it('resetAll clears localStorage', () => {
    const { result } = renderHook(() => useExplicitInstruction())

    act(() => {
      result.current.markIntroduced('email_analysis')
      result.current.resetAll()
    })

    // Should have written empty arrays to localStorage
    const introCall = localStorageMock.setItem.mock.calls.find(
      (c: [string, string]) => c[0] === 'cg_introduced_types'
    )
    expect(introCall).toBeDefined()
    expect(JSON.parse(introCall![1])).toEqual([])
  })

  it('introduced and viewedExamples are independent', () => {
    const { result } = renderHook(() => useExplicitInstruction())

    act(() => {
      result.current.markIntroduced('email_analysis')
    })

    // Introduced but not viewed example
    expect(result.current.shouldShow('email_analysis')).toBe(false)
    expect(result.current.hasViewedExample('email_analysis')).toBe(false)
  })

  it('multiple types can be independently tracked', () => {
    const { result } = renderHook(() => useExplicitInstruction())

    act(() => {
      result.current.markIntroduced('email_analysis')
      result.current.markExampleViewed('url_inspection')
    })

    expect(result.current.shouldShow('email_analysis')).toBe(false)
    expect(result.current.shouldShow('url_inspection')).toBe(true)
    expect(result.current.hasViewedExample('email_analysis')).toBe(false)
    expect(result.current.hasViewedExample('url_inspection')).toBe(true)
  })

  it('SSR guard: returns safe defaults when localStorage has no data', () => {
    // Verify the hook works correctly when localStorage has no introduced/viewed data
    // (simulates SSR or fresh browser where localStorage is empty)
    const { result } = renderHook(() => useExplicitInstruction())

    // With empty localStorage, shouldShow returns true (safe default for SSR)
    expect(result.current.shouldShow('email_analysis')).toBe(true)
    expect(result.current.hasViewedExample('email_analysis')).toBe(false)
  })
})
