'use client'

import type { ScaffoldingLevel, ScaffoldingTip } from '@/types/educational'

// ─── Scaffolding Progression Rules ───────────────────────────────────────────

/**
 * Scaffolding level order: explicit → guided → implicit → withdrawn
 *
 * Levels decrease (more help) as errors accumulate,
 * and increase (less help) as the player demonstrates mastery.
 */
const LEVEL_ORDER: readonly ScaffoldingLevel[] = [
  'explicit',
  'guided',
  'implicit',
  'withdrawn',
] as const

interface ScaffoldingConfig {
  /** Error threshold to move to 'explicit' (most help) */
  explicitThreshold: number
  /** Error threshold to move to 'guided' */
  guidedThreshold: number
  /** Correct streak to move to 'implicit' */
  implicitStreak: number
  /** Correct streak to move to 'withdrawn' (least help) */
  withdrawnStreak: number
}

const DEFAULT_CONFIG: ScaffoldingConfig = {
  explicitThreshold: 3,
  guidedThreshold: 1,
  implicitStreak: 2,
  withdrawnStreak: 4,
}

// ─── Scaffolding Tips by Level ───────────────────────────────────────────────

const TIPS: Record<ScaffoldingLevel, ScaffoldingTip> = {
  explicit: {
    level: 'explicit',
    hint: 'Take a moment to look at all the options carefully. What stands out as different or unusual?',
  },
  guided: {
    level: 'guided',
    hint: 'Think about what you learned before. How does this connect to what you already know?',
  },
  implicit: {
    level: 'implicit',
    hint: 'Trust your analysis — you have the tools to figure this out.',
  },
  withdrawn: {
    level: 'withdrawn',
    hint: '',
  },
}

// ─── Pure Function ───────────────────────────────────────────────────────────

/**
 * determineLevel computes the scaffolding level from error count and correct streak.
 */
function determineLevel(
  errorCount: number,
  correctStreak: number,
  config: ScaffoldingConfig = DEFAULT_CONFIG
): ScaffoldingLevel {
  if (errorCount >= config.explicitThreshold) return 'explicit'
  if (errorCount >= config.guidedThreshold) return 'guided'
  if (correctStreak >= config.withdrawnStreak) return 'withdrawn'
  if (correctStreak >= config.implicitStreak) return 'implicit'
  return 'guided' // default
}

/**
 * getCurrentTip returns the appropriate scaffolding tip for the given state.
 *
 * @param errorCount - Number of errors the player has made in this scenario type
 * @param correctStreak - Number of consecutive correct answers
 * @param tipOverrides - Optional per-level tip overrides from EducationalLayer
 */
export function getCurrentTip(
  errorCount: number,
  correctStreak: number,
  tipOverrides?: Partial<Record<ScaffoldingLevel, string>>
): ScaffoldingTip {
  const level = determineLevel(errorCount, correctStreak)
  const baseTip = TIPS[level]

  // Allow scenario-specific overrides for the hint text
  const hint = tipOverrides?.[level] ?? baseTip.hint

  return {
    ...baseTip,
    hint,
  }
}
