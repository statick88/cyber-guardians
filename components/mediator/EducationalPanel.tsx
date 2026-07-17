'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type {
  MediatorState,
  EducationalLayer,
  ScaffoldingProgress,
} from '@/types/educational'
import { getCurrentTip } from '@/hooks/useScaffolding'
import TipBadge from './TipBadge'

interface EducationalPanelProps {
  state: MediatorState
  educationalLayer?: EducationalLayer
  scaffoldingProgress?: ScaffoldingProgress
  onDismiss: () => void
}

/**
 * EducationalPanel — fixed overlay panel (bottom-right, max-w-sm).
 *
 * Renders:
 * - onTipRequested: ScaffoldingTip via TipBadge
 * - onErrorConstructive: CognitiveConflict question + follow-up
 * - onIntro / onMetaReflection: handled by parent (DebriefDialog)
 */
export default function EducationalPanel({
  state,
  educationalLayer,
  scaffoldingProgress,
  onDismiss,
}: EducationalPanelProps) {
  const isVisible =
    state === 'onTipRequested' ||
    state === 'onErrorConstructive' ||
    state === 'onIntro'

  const tip =
    educationalLayer && scaffoldingProgress
      ? getCurrentTip(
          scaffoldingProgress.errorCount,
          scaffoldingProgress.correctStreak
        )
      : null

  return (
    <AnimatePresence>
      {isVisible && educationalLayer && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="glass-card rounded-xl p-4 neon-border">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
                {state === 'onErrorConstructive'
                  ? 'Pensamiento Crítico'
                  : state === 'onTipRequested'
                    ? 'Guía'
                    : 'Información'}
              </h3>
              <button
                onClick={onDismiss}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Cerrar"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            {state === 'onErrorConstructive' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {educationalLayer.conflictQuestion.question}
                </p>
                <p className="text-xs text-gray-500 italic">
                  {educationalLayer.conflictQuestion.followUp}
                </p>
              </div>
            )}

            {state === 'onTipRequested' && tip && (
              <TipBadge tip={tip} />
            )}

            {state === 'onIntro' && (
              <p className="text-sm text-gray-300">
                Bienvenido al modo guiado. Te ayudaré a reflexionar sobre tus decisiones.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
