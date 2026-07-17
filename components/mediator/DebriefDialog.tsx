'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DebriefPrompt, DebriefDialogProps } from '@/types/educational'

/**
 * DebriefDialog — modal overlay shown after module completion.
 *
 * Renders each DebriefPrompt with the appropriate input:
 * - slider: range input with min/max labels
 * - micro-decision: button group
 * - open-reflection: textarea
 *
 * Persists responses to localStorage and calls onComplete with all responses.
 */
export default function DebriefDialog({
  prompts,
  onComplete,
  onSkip,
  moduleName,
}: DebriefDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, unknown>>({})
  const [isAnimating, setIsAnimating] = useState(false)

  const currentPrompt = prompts[currentIndex]
  const isLast = currentIndex === prompts.length - 1

  // Auto-focus textarea for open-reflection
  useEffect(() => {
    if (currentPrompt?.type === 'open-reflection') {
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
          className="glass-card neon-border mx-4 w-full max-w-lg rounded-xl p-6"
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
