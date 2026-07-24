'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pyramid, AlertTriangle, TrendingDown, Users, DollarSign } from 'lucide-react'
import useQuizSound from '@/hooks/useQuizSound'
import type { PyramidScheme } from '@/types/module6'
import type { MIAEmotionCallback } from '@/types/mia'

interface Props {
  scenarios: PyramidScheme[]
  onComplete: (score: number) => void
  onScore: (points: number) => void
  onMIAEmotion?: MIAEmotionCallback
}

export default function PyramidDetector({ scenarios, onComplete, onScore, onMIAEmotion }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedWarnings, setSelectedWarnings] = useState<Set<string>>(new Set())
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const { playCorrect, playIncorrect } = useQuizSound()

  const currentScenario = scenarios[currentIndex]
  const isLast = currentIndex >= scenarios.length - 1

  const toggleWarning = useCallback((warning: string) => {
    setSelectedWarnings(prev => {
      const next = new Set(prev)
      if (next.has(warning)) {
        next.delete(warning)
      } else {
        next.add(warning)
      }
      return next
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!currentScenario) return

    const correctWarnings = new Set(currentScenario.senalesAdvertencia)
    let correctSelections = 0
    let incorrectSelections = 0

    selectedWarnings.forEach(w => {
      if (correctWarnings.has(w)) {
        correctSelections++
      } else {
        incorrectSelections++
      }
    })

    const totalCorrect = correctWarnings.size
    const accuracy = totalCorrect > 0 ? correctSelections / totalCorrect : 0
    const penalty = incorrectSelections * 0.5
    const scenarioScore = Math.max(0, Math.round((accuracy - penalty) * 4))

    scenarioScore > 0 ? playCorrect() : playIncorrect()
    setScore(prev => prev + scenarioScore)
    onScore(scenarioScore)
    onMIAEmotion?.(scenarioScore > 0 ? 'CORRECT' : 'INCORRECT', 6)
    setShowFeedback(true)
  }, [currentScenario, selectedWarnings, onMIAEmotion])

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(score)
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedWarnings(new Set())
      setShowFeedback(false)
    }
  }, [isLast, onComplete, score])

  if (!currentScenario) {
    return null
  }

  const riskColors = {
    alto: 'text-red-400 bg-red-500/20',
    medio: 'text-yellow-400 bg-yellow-500/20',
    bajo: 'text-green-400 bg-green-500/20',
  }

  const tipoLabels: Record<string, string> = {
    trading_piramide: 'Pirámide de Trading',
    MLM_falso: 'MLM Fraudulento',
    inversion_fraudulenta: 'Inversión Fraudulenta',
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Pyramid className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">
            Escenario {currentIndex + 1} de {scenarios.length}
          </h3>
          <span className={`ml-auto text-xs px-2 py-1 rounded-full ${riskColors[currentScenario.nivelRiesgo]}`}>
            Riesgo: {currentScenario.nivelRiesgo.toUpperCase()}
          </span>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-2">{currentScenario.titulo}</h4>
          <p className="text-gray-300 text-sm mb-3">{currentScenario.descripcion}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-400 text-xs font-medium">{tipoLabels[currentScenario.tipo]}</span>
          </div>
          <div className="bg-gray-600/50 rounded-lg p-3 mt-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-semibold">ESTRUCTURA DEL ESQUEMA</span>
            </div>
            <p className="text-gray-300 text-xs">{currentScenario.estructura}</p>
          </div>
        </div>

        {!showFeedback ? (
          <>
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Identifica las señales de advertencia en este esquema:
              </p>
              <div className="space-y-2">
                {currentScenario.senalesAdvertencia.map((senal, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => toggleWarning(senal)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                      selectedWarnings.has(senal)
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-gray-600/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="mt-0.5">
                      {selectedWarnings.has(senal) ? (
                        <AlertTriangle className="w-4 h-4 text-purple-400" />
                      ) : (
                        <span className="w-4 h-4 block rounded border border-gray-500" />
                      )}
                    </span>
                    <span className="text-sm">{senal}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={selectedWarnings.size === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Verificar Señales ({selectedWarnings.size} seleccionadas)
            </motion.button>
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h4 className="text-white font-semibold">Análisis del Esquema Piramidal</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Los esquemas piramidales dependen del reclutamiento constante de nuevos miembros.
                Cuando el reclutamiento se detiene, el esquema colapsa y la mayoría pierde su dinero.
              </p>
              <p className="text-gray-400 text-xs mb-4">Fuente: {currentScenario.fuente}</p>

              <div className="mb-4">
                <p className="text-gray-400 text-xs mb-2">Todas las señales de advertencia:</p>
                <div className="flex flex-wrap gap-1">
                  {currentScenario.senalesAdvertencia.map((senal, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded ${
                        selectedWarnings.has(senal)
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {selectedWarnings.has(senal) ? '✓' : '✗'} {senal}
                    </span>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {isLast ? 'Ver Resultados' : 'Siguiente →'}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
