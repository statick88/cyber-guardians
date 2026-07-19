'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, AlertTriangle, DollarSign, Clock, Shield } from 'lucide-react'
import useQuizSound from '@/hooks/useQuizSound'
import type { EmploymentScam } from '@/types/module6'

interface Props {
  scenarios: EmploymentScam[]
  onComplete: (score: number) => void
  onScore: (points: number) => void
}

export default function EmploymentScamAlert({ scenarios, onComplete, onScore }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decision, setDecision] = useState<'legitimo' | 'estafa' | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const { playCorrect, playIncorrect } = useQuizSound()

  const currentScenario = scenarios[currentIndex]
  const isLast = currentIndex >= scenarios.length - 1

  const handleDecide = useCallback((choice: 'legitimo' | 'estafa') => {
    setDecision(choice)
    setShowFeedback(true)

    const isCorrect = choice === 'estafa'
    const points = isCorrect ? 4 : 0

    isCorrect ? playCorrect() : playIncorrect()
    setScore(prev => prev + points)
    onScore(points)
  }, [playCorrect, playIncorrect, onScore])

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(score)
    } else {
      setCurrentIndex(prev => prev + 1)
      setDecision(null)
      setShowFeedback(false)
    }
  }, [isLast, onComplete, score])

  if (!currentScenario) {
    return null
  }

  const tipoLabels: Record<string, string> = {
    tareas_falsas: 'Tareas Falsas',
    trabajo_remoto_fraudulento: 'Trabajo Remoto Fraudulento',
    pago_adelantado: 'Pago por Adelantado',
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-bold text-white">
            Escenario {currentIndex + 1} de {scenarios.length}
          </h3>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-2">{currentScenario.titulo}</h4>
          <p className="text-gray-300 text-sm mb-3">{currentScenario.descripcion}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-orange-400 text-xs font-medium">{tipoLabels[currentScenario.tipo]}</span>
            <span className="flex items-center gap-1 text-green-400 text-xs">
              <DollarSign className="w-3 h-3" />
              Pérdida estimada: {currentScenario.montoEstimado}
            </span>
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
          <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Señales de riesgo presentes:
          </p>
          <div className="flex flex-wrap gap-1">
            {currentScenario.senalesRiesgo.map((senal, i) => (
              <span key={i} className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded">
                {senal}
              </span>
            ))}
          </div>
        </div>

        {!showFeedback ? (
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDecide('legitimo')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              LEGÍTIMO
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDecide('estafa')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              ESTAFA
            </motion.button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                decision === 'estafa'
                  ? 'bg-green-500/20 border border-green-500'
                  : 'bg-red-500/20 border border-red-500'
              }`}
            >
              <p className={`font-bold mb-2 ${
                decision === 'estafa' ? 'text-green-400' : 'text-red-400'
              }`}>
                {decision === 'estafa' ? '¡Correcto! Es una ESTAFA ✅' : 'Incorrecto — Esto es una ESTAFA ❌'}
              </p>
              <p className="text-gray-300 text-sm mb-2">
                <strong>Señales clave:</strong>
              </p>
              <ul className="text-gray-300 text-sm mb-3 space-y-1">
                {currentScenario.senalesRiesgo.map((senal, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{senal}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-400 text-xs mb-1">
                <Clock className="w-3 h-3 inline mr-1" />
                Pérdida estimada: {currentScenario.montoEstimado}
              </p>
              <p className="text-gray-400 text-xs">Fuente: {currentScenario.fuente}</p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
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
