'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { ActivityType, EducationalLayer } from '@/types/educational'

// ─── ActivityType display labels (Spanish) ────────────────────────────────────

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  email_analysis: 'Análisis de Email',
  url_inspection: 'Inspección de URL',
  phishing_scenario: 'Escenario de Phishing',
  security_quiz: 'Quiz de Seguridad',
  drag_drop_classification: 'Clasificación Drag & Drop',
  micro_activity: 'Micro-actividad',
  password_strength: 'Fortaleza de Contraseña',
  mfa_simulation: 'Simulación MFA',
  social_media_audit: 'Auditoría de Redes Sociales',
  identity_theft_response: 'Respuesta a Robo de Identidad',
  vishing_decoder: 'Decodificador Vishing',
  chat_simulation: 'Simulación de Chat',
  money_mule_analysis: 'Análisis de Mulero',
  extortion_response: 'Respuesta a Extorsión',
  signal_classification: 'Clasificación de Señales',
  code_defuse: 'Desarmar Código',
  crypto_challenge: 'Desafío Cripto',
  hardening_checklist: 'Checklist de Hardening',
  cookie_sweeper: 'Barrido de Cookies',
  metadata_extractor: 'Extracción de Metadata',
  email_deconstructor: 'Desconstructor de Email',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConceptCardProps {
  /** Activity type being introduced */
  activityType: ActivityType
  /** Educational layer with concept data */
  educationalLayer: EducationalLayer
  /** Called when student dismisses or starts activity */
  onDismiss: () => void
  /** Called when student requests worked example */
  onViewExample: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ConceptCard — Introduces a concept before the student's first encounter
 * with each ActivityType.
 *
 * Renders:
 * - Activity type label
 * - Core concept question from `conflictQuestion.question`
 * - Follow-up context from `conflictQuestion.followUp`
 * - Contradicting evidence as teaching material
 * - "Ver ejemplo" button → triggers worked example
 * - "Comenzar" button → dismisses and marks as introduced
 */
export default function ConceptCard({
  activityType,
  educationalLayer,
  onDismiss,
  onViewExample,
}: ConceptCardProps) {
  const { conflictQuestion } = educationalLayer
  const label = ACTIVITY_LABELS[activityType] ?? activityType

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <div className="glass-card rounded-xl p-5 neon-border">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              {label}
            </span>
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

          {/* Core concept question */}
          <h3 className="text-sm font-semibold text-white leading-snug mb-2">
            {conflictQuestion.question}
          </h3>

          {/* Follow-up context */}
          {conflictQuestion.followUp && (
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              {conflictQuestion.followUp}
            </p>
          )}

          {/* Contradicting evidence as teaching material */}
          {conflictQuestion.contradictingEvidence &&
            conflictQuestion.contradictingEvidence.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Señales a observar
                </p>
                <ul className="space-y-1">
                  {conflictQuestion.contradictingEvidence.map((evidence, i) => (
                    <li
                      key={i}
                      className="text-xs text-gray-300 flex items-start gap-1.5"
                    >
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      {evidence}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onViewExample}
              className="flex-1 px-3 py-2 text-xs font-medium text-cyan-300 border border-cyan-700 rounded-lg hover:bg-cyan-900/30 transition-colors"
            >
              Ver ejemplo
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors"
            >
              Comenzar
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
