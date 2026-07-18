'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DeepfakeArtifact } from '@/types/module5'

interface Props {
  artifacts: DeepfakeArtifact[]
  explicacion: string
  fuente: string
  onScore: (points: number) => void
  onComplete: () => void
}

type Classification = 'real' | 'deepfake' | null

export default function DeepfakeDetector({ artifacts, explicacion, fuente, onScore, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [classification, setClassification] = useState<Classification>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)

  const currentArtifact = artifacts[currentIndex]
  const isLast = currentIndex >= artifacts.length - 1

  const handleClassify = useCallback((type: Classification) => {
    setClassification(type)
    setShowFeedback(true)
    
    // All artifacts in this module are deepfakes for learning purposes
    const isCorrect = type === 'deepfake'
    const points = isCorrect ? 4 : 0
    
    setScore(prev => prev + points)
    onScore(points)
  }, [onScore])

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete()
    } else {
      setCurrentIndex(prev => prev + 1)
      setClassification(null)
      setShowFeedback(false)
    }
  }, [isLast, onComplete])

  if (!currentArtifact) {
    return null
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Artefacto {currentIndex + 1} de {artifacts.length}
        </h3>
        
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">
              {currentArtifact.tipo === 'video' ? '🎬' : 
               currentArtifact.tipo === 'audio' ? '🎤' : '🖼️'}
            </span>
            <div>
              <h4 className="text-white font-semibold">{currentArtifact.titulo}</h4>
              <span className="text-gray-400 text-sm">{currentArtifact.tipo.toUpperCase()}</span>
            </div>
          </div>
          <p className="text-gray-300">{currentArtifact.descripcion}</p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {currentArtifact.senales.map((senal, i) => (
              <span key={i} className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded">
                ⚠️ {senal}
              </span>
            ))}
          </div>
        </div>

        {!showFeedback ? (
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClassify('real')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              ✅ REAL
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClassify('deepfake')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🚨 DEEPFAKE
            </motion.button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                classification === 'deepfake' 
                  ? 'bg-green-500/20 border border-green-500' 
                  : 'bg-red-500/20 border border-red-500'
              }`}
            >
              <p className={`font-bold mb-2 ${
                classification === 'deepfake' ? 'text-green-400' : 'text-red-400'
              }`}>
                {classification === 'deepfake' ? '¡Correcto! ✅' : 'Incorrecto ❌'}
              </p>
              <p className="text-gray-300 text-sm mb-4">{explicacion}</p>
              <p className="text-gray-400 text-xs">Fuente: {fuente}</p>
              
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
