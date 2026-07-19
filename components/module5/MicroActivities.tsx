'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useQuizSound from '@/hooks/useQuizSound'

interface MicroActivity {
  id: string
  tipo: 'verdadero-falso' | 'completar-codigo' | 'ordenar-pasos'
  pregunta: string
  respuestaCorrecta: string | number | string[]
  puntos: number
  explicacion: string
  codigo?: string
  pasos?: Array<{ id: string; texto: string; ordenCorrecto: number }>
  categoria: string
}

interface Props {
  actividades: MicroActivity[]
  onScore: (points: number, category?: string) => void
  onComplete: () => void
}

export function MicroActivities({ actividades, onScore, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const { playCorrect, playIncorrect } = useQuizSound()

  const currentActivity = actividades[currentIndex]
  const isLast = currentIndex >= actividades.length - 1

  const handleAnswer = useCallback((answer: string | number) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)
    
    const isCorrect = answer === currentActivity.respuestaCorrecta
    const points = isCorrect ? currentActivity.puntos : 0
    isCorrect ? playCorrect() : playIncorrect()
    
    setScore(prev => prev + points)
    onScore(points, currentActivity.categoria)
  }, [currentActivity, onScore, playCorrect, playIncorrect])

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete()
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }
  }, [isLast, onComplete])

  if (!currentActivity) {
    return null
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">
            Micro-Actividad {currentIndex + 1} de {actividades.length}
          </h3>
          <span className="bg-blue-500/20 text-blue-300 text-sm px-3 py-1 rounded-full">
            +{currentActivity.puntos} pts
          </span>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-gray-300">{currentActivity.pregunta}</p>
        </div>

        {currentActivity.tipo === 'verdadero-falso' && (
          <div className="flex gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer('verdadero')}
              disabled={showFeedback}
              className={`flex-1 py-3 px-6 rounded-lg font-bold transition-colors ${
                selectedAnswer === 'verdadero'
                  ? showFeedback
                    ? currentActivity.respuestaCorrecta === 'verdadero'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              ✅ Verdadero
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer('falso')}
              disabled={showFeedback}
              className={`flex-1 py-3 px-6 rounded-lg font-bold transition-colors ${
                selectedAnswer === 'falso'
                  ? showFeedback
                    ? currentActivity.respuestaCorrecta === 'falso'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              ❌ Falso
            </motion.button>
          </div>
        )}

        {showFeedback && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                selectedAnswer === currentActivity.respuestaCorrecta
                  ? 'bg-green-500/20 border border-green-500'
                  : 'bg-red-500/20 border border-red-500'
              }`}
            >
              <p className={`font-bold mb-2 ${
                selectedAnswer === currentActivity.respuestaCorrecta
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}>
                {selectedAnswer === currentActivity.respuestaCorrecta
                  ? '¡Correcto! ✅'
                  : 'Incorrecto ❌'}
              </p>
              <p className="text-gray-300 text-sm mb-4">{currentActivity.explicacion}</p>
              
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
