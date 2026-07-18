'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type {
  DebriefPrompt,
  DebriefDialogProps,
  AssessmentRubric,
  RubricCriterion,
} from '@/types/educational'

// ─── Rubric Evaluation (Pure Function) ────────────────────────────────────────

export interface RubricResult {
  /** Total points earned */
  score: number
  /** Maximum possible score */
  maxScore: number
  /** Percentage (0–100) */
  percentage: number
  /** Per-criterion match results */
  criteria: Array<RubricCriterion & { matched: boolean }>
  /** Overall feedback message */
  feedback: string
}

/**
 * evaluateRubric performs keyword matching against rubric criteria.
 *
 * Pure function — deterministic, zero latency, no AI.
 *
 * @param response - Student's text response
 * @param rubric - Assessment rubric with criteria
 */
export function evaluateRubric(
  response: string,
  rubric: AssessmentRubric
): RubricResult {
  const lowerResponse = response.toLowerCase()

  const criteriaResults = rubric.criteria.map((criterion) => {
    const matched = lowerResponse.includes(criterion.keyword.toLowerCase())
    return { ...criterion, matched }
  })

  const score = criteriaResults
    .filter((c) => c.matched)
    .reduce((sum, c) => sum + c.points, 0)

  const maxScore = rubric.criteria.reduce((sum, c) => sum + c.points, 0)
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

  return {
    score,
    maxScore,
    percentage,
    criteria: criteriaResults,
    feedback: rubric.feedbackTemplate,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DebriefDialog — modal overlay shown after module completion.
 *
 * Renders each DebriefPrompt with the appropriate input:
 * - slider: range input with min/max labels
 * - micro-decision: button group
 * - open-reflection: textarea
 * - open-ended-with-rubric: textarea with live keyword matching
 *
 * Persists responses to localStorage and calls onComplete with all responses.
 */
export default function DebriefDialog({
  prompts,
  onComplete,
  onSkip,
  moduleName,
  rubrics,
}: DebriefDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, unknown>>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [rubricResults, setRubricResults] = useState<
    Record<string, RubricResult>
  >({})

  const currentPrompt = prompts[currentIndex]
  const isLast = currentIndex === prompts.length - 1

  // Auto-focus textarea for open-reflection and open-ended-with-rubric
  useEffect(() => {
    if (
      currentPrompt?.type === 'open-reflection' ||
      currentPrompt?.type === 'open-ended-with-rubric'
    ) {
      const textarea = document.querySelector<HTMLTextAreaElement>(
        `textarea[data-prompt="${currentPrompt.storageKey}"]`
      )
      textarea?.focus()
    }
  }, [currentPrompt])

  const handleSliderChange = useCallback(
    (value: number) => {
      if (!currentPrompt) return
      setResponses((prev) => ({ ...prev, [currentPrompt.storageKey]: value }))
    },
    [currentPrompt]
  )

  const handleMicroDecision = useCallback(
    (option: string) => {
      if (!currentPrompt) return
      setResponses((prev) => ({ ...prev, [currentPrompt.storageKey]: option }))
      // Auto-advance after micro-decision
      setTimeout(() => handleNext(), 300)
    },
    [currentPrompt]
  )

  const handleOpenReflection = useCallback(
    (text: string) => {
      if (!currentPrompt) return
      setResponses((prev) => ({ ...prev, [currentPrompt.storageKey]: text }))
    },
    [currentPrompt]
  )

  const handleRubricResponse = useCallback(
    (text: string) => {
      if (!currentPrompt) return
      setResponses((prev) => ({ ...prev, [currentPrompt.storageKey]: text }))

      // Live rubric evaluation
      const rubric = rubrics?.[currentPrompt.storageKey]
      if (rubric && text.trim().length > 0) {
        const result = evaluateRubric(text, rubric)
        setRubricResults((prev) => ({ ...prev, [currentPrompt.storageKey]: result }))
      } else {
        setRubricResults((prev) => {
          const next = { ...prev }
          delete next[currentPrompt.storageKey]
          return next
        })
      }
    },
    [currentPrompt, rubrics]
  )

  const handleNext = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)

    setTimeout(() => {
      if (isLast) {
        onComplete(responses)
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
      setIsAnimating(false)
    }, 200)
  }, [isLast, responses, onComplete, isAnimating])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip()
      } else if (e.key === 'Enter' && e.metaKey) {
        handleNext()
      }
    },
    [onSkip, handleNext]
  )

  if (!currentPrompt) return null

  const currentRubric = rubrics?.[currentPrompt.storageKey]
  const currentRubricResult = rubricResults[currentPrompt.storageKey]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onSkip}
        onKeyDown={handleKeyDown}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="glass-card neon-border mx-4 w-full max-w-lg rounded-xl p-6 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-cyan-300">
                Reflexión — {moduleName}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Pregunta {currentIndex + 1} de {prompts.length}
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Saltar reflexión"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 5l10 10M15 5l-10 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-6 h-1 overflow-hidden rounded-full bg-gray-800">
            <motion.div
              className="h-full bg-cyan-500"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / prompts.length) * 100}%`,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Prompt content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPrompt.storageKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-sm leading-relaxed text-gray-200">
                {currentPrompt.prompt}
              </p>

              {/* Slider */}
              {currentPrompt.type === 'slider' && (
                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={
                      (responses[currentPrompt.storageKey] as number) ?? 50
                    }
                    onChange={(e) =>
                      handleSliderChange(Number(e.target.value))
                    }
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {currentPrompt.sliderLabels?.min ?? '0'}
                    </span>
                    <span className="text-cyan-400 font-mono">
                      {(responses[currentPrompt.storageKey] as number) ?? 50}
                    </span>
                    <span>
                      {currentPrompt.sliderLabels?.max ?? '100'}
                    </span>
                  </div>
                </div>
              )}

              {/* Micro-decision */}
              {currentPrompt.type === 'micro-decision' &&
                currentPrompt.options && (
                  <div className="flex flex-wrap gap-2">
                    {currentPrompt.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleMicroDecision(option.id)}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          responses[currentPrompt.storageKey] === option.id
                            ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                            : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

              {/* Open reflection */}
              {currentPrompt.type === 'open-reflection' && (
                <textarea
                  data-prompt={currentPrompt.storageKey}
                  value={
                    (responses[currentPrompt.storageKey] as string) ?? ''
                  }
                  onChange={(e) => handleOpenReflection(e.target.value)}
                  placeholder="Escribe tu reflexión aquí..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
              )}

              {/* Open-ended with rubric */}
              {currentPrompt.type === 'open-ended-with-rubric' && (
                <div className="space-y-3">
                  {/* Reflection guide if present */}
                  {currentPrompt.reflectionGuide && (
                    <p className="text-xs text-gray-500 italic">
                      {currentPrompt.reflectionGuide}
                    </p>
                  )}

                  {/* Textarea */}
                  <textarea
                    data-prompt={currentPrompt.storageKey}
                    value={
                      (responses[currentPrompt.storageKey] as string) ?? ''
                    }
                    onChange={(e) => handleRubricResponse(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />

                  {/* Rubric criteria checklist */}
                  {currentRubric && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Criterios de evaluación
                      </p>
                      <div className="space-y-1">
                        {currentRubric.criteria.map((criterion, i) => {
                          const matched =
                            currentRubricResult?.criteria[i]?.matched ?? false
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                                matched ? 'text-emerald-400' : 'text-gray-500'
                              }`}
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${
                                  matched
                                    ? 'border-emerald-500 bg-emerald-500/20'
                                    : 'border-gray-700 bg-gray-800/50'
                                }`}
                              >
                                {matched && (
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 10 10"
                                    fill="none"
                                  >
                                    <path
                                      d="M2 5l2 2 4-4"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </span>
                              <span>{criterion.feedback}</span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Score display */}
                      {currentRubricResult &&
                        (responses[currentPrompt.storageKey] as string)
                          ?.trim() && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 rounded-lg border border-gray-700 bg-gray-800/30 p-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                Puntuación
                              </span>
                              <span
                                className={`text-sm font-bold ${
                                  currentRubricResult.percentage >= 70
                                    ? 'text-emerald-400'
                                    : currentRubricResult.percentage >= 40
                                      ? 'text-yellow-400'
                                      : 'text-orange-400'
                                }`}
                              >
                                {currentRubricResult.score} /{' '}
                                {currentRubricResult.maxScore}
                              </span>
                            </div>
                            <p className="mt-1 text-[10px] text-gray-500">
                              {currentRubricResult.feedback}
                            </p>
                          </motion.div>
                        )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Saltar todo
            </button>
            <button
              onClick={handleNext}
              disabled={isAnimating}
              className="rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-500/30 disabled:opacity-50"
            >
              {isLast ? 'Finalizar' : 'Siguiente'}
              <span className="ml-1 opacity-50">⌘↵</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
