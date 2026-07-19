'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { CompetencyScore, SkillCompetencyTag } from '@/types/educational'

// ─── Competency display labels (Spanish) ──────────────────────────────────────

const COMPETENCY_LABELS: Record<SkillCompetencyTag, string> = {
  'email-analysis': 'Análisis de Email',
  'url-inspection': 'Inspección de URL',
  'phishing-sim': 'Simulación Phishing',
  'digital-defense': 'Defensa Digital',
  'metadata-extraction': 'Extracción de Metadata',
  'cookie-sweeping': 'Barrido de Cookies',
}

// ─── Score color helper ───────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return '#34d399'
  if (score >= 60) return '#22d3ee'
  if (score >= 40) return '#facc15'
  return '#fb923c'
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FormativeFeedbackProps {
  /** Competency scores to display */
  competencyScores: CompetencyScore[]
  /** Overall score (0–100) */
  overallScore: number
  /** Optional message to show above the scores */
  message?: string
  /** Called when student dismisses the feedback */
  onDismiss: () => void
  /** Auto-dismiss delay in ms (0 = manual only) */
  autoDismissMs?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FormativeFeedback — Renders competency scores as a toast notification.
 *
 * Instead of a fixed overlay, triggers a sonner toast with the score summary
 * and calls onDismiss when the toast closes.
 */
export default function FormativeFeedback({
  competencyScores,
  overallScore,
  message,
  onDismiss,
  autoDismissMs = 8000,
}: FormativeFeedbackProps) {
  const dismissCalled = useRef(false)

  useEffect(() => {
    if (dismissCalled.current) return
    dismissCalled.current = true

    const scoreLines = competencyScores
      .map(
        (cs) =>
          `• ${COMPETENCY_LABELS[cs.tag] ?? cs.tag}: <span style="color:${getScoreColor(cs.score)}">${Math.round(cs.score)}</span>`
      )
      .join('\n')

    const body = [
      `<strong style="font-size:1.1em;color:${getScoreColor(overallScore)}">${Math.round(overallScore)} / 100</strong>`,
      message ? `<br/><span style="opacity:0.7">${message}</span>` : '',
      scoreLines ? `<br/><br/>${scoreLines}` : '',
    ]
      .filter(Boolean)
      .join('')

    const id = toast(null, {
      duration: autoDismissMs,
      onDismiss: () => onDismiss(),
    })

    // Render custom HTML content via the description
    toast.dismiss(id)
    toast(
      <div
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: body }}
        className="text-sm leading-relaxed"
      />,
      {
        duration: autoDismissMs,
        onDismiss: () => onDismiss(),
        className: 'glass-card neon-border',
      }
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
