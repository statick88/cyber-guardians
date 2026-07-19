import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMIA } from '@/hooks/useMIA'

// ── Mock useHUD ──────────────────────────────────────────────────────────────

interface HUDSnapshot {
  shieldHP: number
  xp: number
  currentModule: number | null
  completedChallenges: string[]
}

let hudSnapshot: HUDSnapshot = {
  shieldHP: 100,
  xp: 0,
  currentModule: 0,
  completedChallenges: [],
}

vi.mock('@/components/HUDProvider', () => ({
  useHUD: () => ({
    shieldHP: hudSnapshot.shieldHP,
    maxShieldHP: 100,
    autonomyLevel: 'novice',
    xp: hudSnapshot.xp,
    currentModule: hudSnapshot.currentModule,
    notebookOpen: false,
    challenges: [],
    completedChallenges: hudSnapshot.completedChallenges,
    damageShield: vi.fn(),
    healShield: vi.fn(),
    addXP: vi.fn(),
    setCurrentModule: vi.fn(),
    resetHUD: vi.fn(),
    toggleNotebook: vi.fn(),
    completeChallenge: vi.fn(),
  }),
}))

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Update HUD state and force the hook to re-render.
 * Changing the snapshot alone doesn't trigger React; we must rerender.
 */
function updateHUD(
  patch: Partial<HUDSnapshot>,
  rerender: () => void
): void {
  hudSnapshot = { ...hudSnapshot, ...patch }
  rerender()
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('useMIA', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    hudSnapshot = {
      shieldHP: 100,
      xp: 0,
      currentModule: 0,
      completedChallenges: [],
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts in IDLE state with no dialogue', () => {
    const { result } = renderHook(() => useMIA())

    expect(result.current.emotion).toBe('IDLE')
    expect(result.current.currentDialogue).toBeNull()
    expect(result.current.isVisible).toBe(false)
  })

  it('transitions to SAMPLED_ERROR on shield damage', () => {
    const { result, rerender } = renderHook(() => useMIA())

    act(() => {
      updateHUD({ shieldHP: 80 }, rerender)
    })

    expect(result.current.emotion).toBe('SAMPLED_ERROR')
    expect(result.current.currentDialogue).not.toBeNull()
    expect(result.current.currentDialogue?.emotion).toBe('SAMPLED_ERROR')
    expect(result.current.isVisible).toBe(true)
  })

  it('transitions to EXCITED on XP gain', () => {
    const { result, rerender } = renderHook(() => useMIA())

    // First trigger: shield damage
    act(() => {
      updateHUD({ shieldHP: 80 }, rerender)
    })
    expect(result.current.emotion).toBe('SAMPLED_ERROR')

    // Advance past cooldown
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    // Second trigger: XP gain
    act(() => {
      updateHUD({ xp: 50 }, rerender)
    })
    expect(result.current.emotion).toBe('EXCITED')
    expect(result.current.currentDialogue?.emotion).toBe('EXCITED')
  })

  it('cooldown prevents rapid state changes', () => {
    const { result, rerender } = renderHook(() => useMIA())

    // First trigger
    act(() => {
      updateHUD({ shieldHP: 80 }, rerender)
    })
    expect(result.current.emotion).toBe('SAMPLED_ERROR')

    // Immediately try another trigger (within 3s cooldown)
    act(() => {
      updateHUD({ xp: 50 }, rerender)
    })
    // Should NOT have changed — cooldown blocks it
    expect(result.current.emotion).toBe('SAMPLED_ERROR')

    // Advance past cooldown
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    // Now trigger again
    act(() => {
      updateHUD({ shieldHP: 60 }, rerender)
    })
    // Should have changed (different emotion or same emotion re-triggered won't happen,
    // but shield damage → SAMPLED_ERROR is same, so try a different path)
    // Actually, same emotion won't retrigger. Let's test cooldown properly:
    // After cooldown, change XP to trigger EXCITED
    act(() => {
      vi.advanceTimersByTime(3100)
    })
    act(() => {
      updateHUD({ xp: 100 }, rerender)
    })
    expect(result.current.emotion).toBe('EXCITED')
  })

  it('dialogue deduplication excludes recently shown entries', () => {
    const { result, rerender } = renderHook(() => useMIA())

    // Trigger SAMPLED_ERROR (shield damage)
    act(() => {
      updateHUD({ shieldHP: 80 }, rerender)
    })
    const firstId = result.current.currentDialogue?.id
    expect(firstId).toBeDefined()

    // Advance past cooldown, then trigger EXCITED (XP gain) to change emotion
    act(() => {
      vi.advanceTimersByTime(3100)
    })
    act(() => {
      updateHUD({ xp: 50 }, rerender)
    })
    expect(result.current.emotion).toBe('EXCITED')

    // Advance past cooldown again, then trigger SAMPLED_ERROR once more
    act(() => {
      vi.advanceTimersByTime(3100)
    })
    act(() => {
      updateHUD({ shieldHP: 60 }, rerender)
    })
    expect(result.current.emotion).toBe('SAMPLED_ERROR')

    const secondId = result.current.currentDialogue?.id
    expect(secondId).toBeDefined()
    // The first SAMPLED_ERROR dialogue should be excluded by dedup
    expect(secondId).not.toBe(firstId)
  })

  it('manual triggerMIA sets emotion and dialogue', () => {
    const { result } = renderHook(() => useMIA())

    act(() => {
      result.current.triggerMIA('MISSION_BRIEF', 1)
    })

    expect(result.current.emotion).toBe('MISSION_BRIEF')
    expect(result.current.currentDialogue).not.toBeNull()
    expect(result.current.currentDialogue?.emotion).toBe('MISSION_BRIEF')
    expect(result.current.isVisible).toBe(true)
  })

  it('manual triggerMIA respects cooldown', () => {
    const { result, rerender } = renderHook(() => useMIA())

    // First auto-trigger
    act(() => {
      updateHUD({ shieldHP: 80 }, rerender)
    })
    expect(result.current.emotion).toBe('SAMPLED_ERROR')

    // Immediately manual trigger — cooldown should block it
    act(() => {
      result.current.triggerMIA('PROVIDING_CLUE', 2)
    })
    expect(result.current.emotion).toBe('SAMPLED_ERROR') // still the same

    // Advance past cooldown, then manual trigger works
    act(() => {
      vi.advanceTimersByTime(3100)
    })
    act(() => {
      result.current.triggerMIA('PROVIDING_CLUE', 2)
    })
    expect(result.current.emotion).toBe('PROVIDING_CLUE')
    expect(result.current.currentDialogue?.emotion).toBe('PROVIDING_CLUE')
  })

  it('cleanup on unmount does not throw', () => {
    const { unmount, rerender } = renderHook(() => useMIA())

    act(() => {
      updateHUD({ shieldHP: 80 }, rerender)
    })

    expect(() => unmount()).not.toThrow()
  })

  it('manual triggerMIA uses fallback chain (module 0 → IDLE)', () => {
    const { result } = renderHook(() => useMIA())

    // Trigger with a module that has no PROVIDING_CLUE entries
    // All modules have PROVIDING_CLUE, so test with a non-existent module
    act(() => {
      result.current.triggerMIA('PROVIDING_CLUE', 99)
    })

    // Should fallback to moduleId 0 or IDLE
    expect(result.current.currentDialogue).not.toBeNull()
    expect(result.current.currentDialogue?.emotion).toBe('PROVIDING_CLUE')
  })
})
