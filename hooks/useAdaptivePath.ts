'use client'

import { useCallback, useMemo } from 'react'
import type { SkillCompetencyTag } from '@/types/educational'
import { usePortfolio } from './usePortfolio'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Recommendation {
  tag: SkillCompetencyTag
  score: number
  attempts: number
  gap: number
  reason: string
}

export interface UseAdaptivePathReturn {
  /** Get top N weakest competency recommendations */
  getRecommendations: (count?: number) => Recommendation[]
  /** Weakest single competency tag, or null if empty portfolio */
  getWeakestCompetency: () => SkillCompetencyTag | null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdaptivePath(): UseAdaptivePathReturn {
  const { competencyScores } = usePortfolio()

  const getRecommendations = useCallback(
    (count: number = 3): Recommendation[] => {
      if (competencyScores.length === 0) return []

      const sorted = [...competencyScores].sort((a, b) => a.score - b.score)

      return sorted.slice(0, count).map((cs) => ({
        tag: cs.tag,
        score: cs.score,
        attempts: cs.attempts,
        gap: 100 - cs.score,
        reason: buildRecommendationReason(cs.tag, cs.score, cs.attempts),
      }))
    },
    [competencyScores]
  )

  const getWeakestCompetency = useCallback((): SkillCompetencyTag | null => {
    if (competencyScores.length === 0) return null
    const sorted = [...competencyScores].sort((a, b) => a.score - b.score)
    return sorted[0].tag
  }, [competencyScores])

  return useMemo(
    () => ({ getRecommendations, getWeakestCompetency }),
    [getRecommendations, getWeakestCompetency]
  )
}

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

function buildRecommendationReason(
  tag: SkillCompetencyTag,
  score: number,
  attempts: number
): string {
  if (attempts === 0) {
    return `Aún no has practicado ${tagLabel(tag)}. ¡Es un buen momento para empezar!`
  }
  if (score < 30) {
    return `Tu puntaje en ${tagLabel(tag)} es bajo (${score}/100). Repasa los conceptos clave.`
  }
  if (score < 60) {
    return `Estás mejorando en ${tagLabel(tag)} (${score}/100). Un poco más de práctica te ayudará.`
  }
  if (score < 80) {
    return `Buen progreso en ${tagLabel(tag)} (${score}/100). Refuerza los detalles.`
  }
  return `Dominas ${tagLabel(tag)} (${score}/100). ¡Sigue así!`
}

function tagLabel(tag: SkillCompetencyTag): string {
  const labels: Record<SkillCompetencyTag, string> = {
    'email-analysis': 'análisis de emails',
    'url-inspection': 'inspección de URLs',
    'phishing-sim': 'simulación de phishing',
    'digital-defense': 'defensa digital',
    'metadata-extraction': 'extracción de metadatos',
    'cookie-sweeping': 'revisión de cookies',
  }
  return labels[tag]
}
