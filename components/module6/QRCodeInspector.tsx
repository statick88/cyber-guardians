'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react'
import type { QRCodeScam } from '@/types/module6'

interface Props {
  scenarios: QRCodeScam[]
  onComplete: (score: number) => void
}

export default function QRCodeInspector({ scenarios, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedFlags, setSelectedFlags] = useState<Set<string>>(new Set())
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)

  const currentScenario = scenarios[currentIndex]
  const isLast = currentIndex >= scenarios.length - 1

  const toggleFlag = useCallback((flag: string) => {
    setSelectedFlags(prev => {
      const next = new Set(prev)
      if (next.has(flag)) {
        next.delete(flag)
      } else {
        next.add(flag)
      }
      return next
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!currentScenario) return

    const correctFlags = new Set(currentScenario.senalesRiesgo)
    let correctSelections = 0
    let incorrectSelections = 0

    selectedFlags.forEach(flag => {
      if (correctFlags.has(flag)) {
        correctSelections++
      } else {
        incorrectSelections++
      }
    })

    const totalCorrect = correctFlags.size
    const accuracy = totalCorrect > 0 ? correctSelections / totalCorrect : 0
    const penalty = incorrectSelections * 0.5
    const scenarioScore = Math.max(0, Math.round((accuracy - penalty) * 4))

    setScore(prev => prev + scenarioScore)
    setShowFeedback(true)
  }, [currentScenario, selectedFlags])

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(score)
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedFlags(new Set())
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
    estafado_QR_pix: 'QR PIX Fraudulento',
    QR_phishing: 'QR Phishing',
    QR_malicioso: 'QR Malicioso',
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <QrCode className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">
            Escenario {currentIndex + 1} de {scenarios.length}
          </h3>
          <span className={`ml-auto text-xs px-2 py-1 rounded-full ${riskColors[currentScenario.nivelRiesgo]}`}>
            Riesgo: {currentScenario.nivelRiesgo.toUpperCase()}
          </span>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-2">{currentScenario.titulo}</h4>
          <p className="text-gray-300 text-sm">{currentScenario.descripcion}</p>
          <div className="mt-2">
            <span className="text-cyan-400 text-xs font-medium">{tipoLabels[currentScenario.tipo]}</span>
          </div>
        </div>

        {!showFeedback ? (
          <>
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Selecciona las señales de riesgo que identifiques:
              </p>
              <div className="space-y-2">
                {currentScenario.senalesRiesgo.map((senal, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => toggleFlag(senal)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                      selectedFlags.has(senal)
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-gray-600/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="mt-0.5">
                      {selectedFlags.has(senal) ? (
                        <CheckCircle className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-500" />
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
              disabled={selectedFlags.size === 0}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Verificar Señales ({selectedFlags.size} seleccionadas)
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
                <h4 className="text-white font-semibold">Análisis del Escenario</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">{currentScenario.explicacion}</p>
              <p className="text-gray-400 text-xs mb-4">Fuente: {currentScenario.fuente}</p>

              <div className="mb-4">
                <p className="text-gray-400 text-xs mb-2">Todas las señales de riesgo:</p>
                <div className="flex flex-wrap gap-1">
                  {currentScenario.senalesRiesgo.map((senal, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded ${
                        selectedFlags.has(senal)
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {selectedFlags.has(senal) ? '✓' : '✗'} {senal}
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
