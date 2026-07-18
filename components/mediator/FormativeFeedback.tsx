'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-cyan-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-orange-400'
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-cyan-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-orange-500'
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
 * FormativeFeedback — Inline mastery feedback with progress visualization.
 *
 * Renders:
 * - Overall score with color coding
 * - Per-competency progress bars
 * - Optional contextual message
 * - Dismissible with framer-motion animation
 */
export default function FormativeFeedback({
  competencyScores,
  overallScore,
  message,
  onDismiss,
  autoDismissMs = 0,
}: FormativeFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    // Wait for exit animation before calling onDismiss
    setTimeout(onDismiss, 250)
  }

  // Auto-dismiss if configured
  if (autoDismissMs > 0) {
    setTimeout(handleDismiss, autoDismissMs)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="glass-card rounded-xl p-4 neon-border">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Progreso
              </span>
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Cerrar"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Overall score */}
            <div className="mb-3 flex items-center gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {Math.round(overallScore)}
              </span>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>

            {/* Optional message */}
            {message && (
              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {message}
              </p>
            )}

            {/* Per-competency progress bars */}
            {competencyScores.length > 0 && (
              <div className="space-y-2">
                {competencyScores.map((cs) => (
                  <div key={cs.tag}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-gray-400">
                        {COMPETENCY_LABELS[cs.tag] ?? cs.tag}
                      </span>
                      <span className={`text-[10px] font-medium ${getScoreColor(cs.score)}`}>
                        {Math.round(cs.score)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, cs.score)}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                        className={`h-full rounded-full ${getScoreBarColor(cs.score)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="mt-3 w-full px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors"
            >
              Continuar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
