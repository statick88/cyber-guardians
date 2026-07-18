'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MetadataIndicator } from '@/types/module5'

interface Props {
  indicators: MetadataIndicator[]
  onScore: (points: number) => void
  onComplete: () => void
}

export default function MetadataAnalyzer({ indicators, onScore, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)

  const currentIndicator = indicators[currentIndex]
  const isLast = currentIndex >= indicators.length - 1

  const handleAnswer = useCallback((answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowFeedback(true)
    
    // Correct answer is always the suspicious value (index 1)
    const isCorrect = answerIndex === 1
    const points = isCorrect ? 4 : 0
    
    setScore(prev => prev + points)
    onScore(points)
  }, [onScore])

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete()
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }
  }, [isLast, onComplete])

  if (!currentIndicator) {
    return null
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Indicador {currentIndex + 1} de {indicators.length}
        </h3>
        
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔍</span>
            <div>
              <h4 className="text-white font-semibold">{currentIndicator.campo}</h4>
              <span className={`text-xs px-2 py-1 rounded ${
                currentIndicator.severidad === 'critica' ? 'bg-red-500/30 text-red-300' :
                currentIndicator.severidad === 'alta' ? 'bg-orange-500/30 text-orange-300' :
                currentIndicator.severidad === 'media' ? 'bg-yellow-500/30 text-yellow-300' :
                'bg-blue-500/30 text-blue-300'
              }`}>
                Severidad: {currentIndicator.severidad.toUpperCase()}
              </span>
            </div>
          </div>
          <p className="text-gray-300 mb-4">{currentIndicator.explicacion}</p>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-400">¿Qué valor es sospechoso?</p>
            <button
              onClick={() => handleAnswer(0)}
              disabled={showFeedback}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedAnswer === 0 
                  ? showFeedback 
                    ? 'border-red-500 bg-red-500/20' 
                    : 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <span className="text-gray-300">Valor Esperado: {currentIndicator.valorEsperado}</span>
            </button>
            <button
              onClick={() => handleAnswer(1)}
              disabled={showFeedback}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedAnswer === 1 
                  ? showFeedback 
                    ? 'border-green-500 bg-green-500/20' 
                    : 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <span className="text-gray-300">Valor Sospechoso: {currentIndicator.valorSospechoso}</span>
            </button>
          </div>
        </div>

        {showFeedback && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
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
