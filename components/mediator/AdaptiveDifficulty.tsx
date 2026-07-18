'use client'

import type { ScaffoldingLevel, ActivityType } from '@/types/educational'
import { getScaffoldingAdaptation } from '@/hooks/useScaffolding'

interface AdaptiveDifficultyProps {
  /** Current scaffolding level */
  level: ScaffoldingLevel
  /** Activity type for adaptation rules */
  activityType: ActivityType
  /** Children to adapt */
  children: React.ReactNode
}

const INDICATOR_LABELS: Record<ScaffoldingLevel, { label: string; icon: string }> = {
  explicit:   { label: 'Modo guiado',         icon: '💡' },
  guided:     { label: 'Dificultad adaptativa', icon: '📊' },
  implicit:   { label: '',                     icon: ''   },
  withdrawn:  { label: 'Modo desafío',        icon: '🏆' },
}

/**
 * AdaptiveDifficulty — Wrapper applying CSS class modifiers
 * based on scaffolding level.
 *
 * Does NOT modify content or options — only presentation.
 * Shows difficulty indicator badge when adaptation is active.
 */
export default function AdaptiveDifficulty({
  level,
  activityType: _activityType,
  children,
}: AdaptiveDifficultyProps) {
  const adaptation = getScaffoldingAdaptation(level)
  const indicator = INDICATOR_LABELS[level]

  return (
    <div className="relative">
      {/* Difficulty indicator badge */}
      {adaptation.showDifficultyIndicator && indicator.label && (
        <div className="absolute top-2 right-2 z-10">
          <span
            className={`
              inline-flex items-center gap-1
              px-2.5 py-1
              text-xs font-medium
              rounded-full
              bg-white/80 dark:bg-gray-800/80
              text-gray-600 dark:text-gray-300
              shadow-sm
              backdrop-blur-sm
            `}
          >
            <span>{indicator.icon}</span>
            <span>{indicator.label}</span>
          </span>
        </div>
      )}

      {/* Adapted content wrapper */}
      <div
        className={`
          ${adaptation.simplifyOptions ? 'simplify-options' : ''}
          ${adaptation.challengeMode ? 'challenge-mode' : ''}
          ${level === 'explicit' ? 'opacity-90' : ''}
        `}
      >
        {children}
      </div>
    </div>
  )
}
