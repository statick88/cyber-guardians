'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useQuizSound from '@/hooks/useQuizSound'
import { useQuizShuffle } from '@/hooks/useQuizShuffle'
import type { DeepfakeArtifact } from '@/types/module5'

interface Props {
  artifacts: DeepfakeArtifact[]
  explicacion: string
  fuente: string
  pregunta: string
  opciones: string[]
  respuestaCorrecta: number
  onScore: (points: number) => void
  onComplete: () => void
}

type Classification = 'real' | 'deepfake' | null

export default function DeepfakeDetector({ artifacts, explicacion, fuente, pregunta, opciones, respuestaCorrecta, onScore, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [classification, setClassification] = useState<Classification>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [phase, setPhase] = useState<'classify' | 'mc'>('classify')
  const [selectedMcOption, setSelectedMcOption] = useState<number | null>(null)
  const [showMcFeedback, setShowMcFeedback] = useState(false)
  const [score, setScore] = useState(0)

  const currentArtifact = artifacts[currentIndex]
  const isLast = currentIndex >= artifacts.length - 1
  const { playCorrect, playIncorrect } = useQuizSound()

  // Pair each option with its original index before shuffling
  const pairedOptions = useMemo(() => {
    return opciones.map((text, originalIndex) => ({ text, originalIndex }))
  }, [opciones])

  const shuffledPairs = useQuizShuffle(pairedOptions, `deepfake-mc-${currentIndex}`)

  const handleClassify = useCallback((type: Classification) => {
    setClassification(type)
    setShowFeedback(true)
    
    // All artifacts in this module are deepfakes for learning purposes
    const isCorrect = type === 'deepfake'
    const points = isCorrect ? 4 : 0
    isCorrect ? playCorrect() : playIncorrect()
    
    setScore(prev => prev + points)
    onScore(points)
  }, [onScore, playCorrect, playIncorrect])

  const handleClassificationNext = useCallback(() => {
    setPhase('mc')
    setShowFeedback(false)
  }, [])

  const handleMcAnswer = useCallback((selectedIndex: number) => {
    if (selectedMcOption !== null) return
    setSelectedMcOption(selectedIndex)
    setShowMcFeedback(true)
    
    const isCorrect = selectedIndex === respuestaCorrecta
    const points = isCorrect ? 4 : 0
    isCorrect ? playCorrect() : playIncorrect()
    
    setScore(prev => prev + points)
    onScore(points)
  }, [selectedMcOption, respuestaCorrecta, onScore, playCorrect, playIncorrect])

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete()
    } else {
      setCurrentIndex(prev => prev + 1)
      setClassification(null)
      setShowFeedback(false)
      setPhase('classify')
      setSelectedMcOption(null)
      setShowMcFeedback(false)
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

        {!showFeedback && phase === 'classify' ? (
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
        ) : showFeedback && phase === 'classify' ? (
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
                onClick={handleClassificationNext}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Siguiente Pregunta →
              </motion.button>
            </motion.div>
          </AnimatePresence>
        ) : phase === 'mc' ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h4 className="text-white font-semibold text-lg">{pregunta}</h4>
              
              <div className="space-y-3">
                {shuffledPairs.map((pair, displayIndex) => {
                  const isSelected = selectedMcOption === pair.originalIndex
                  const isCorrect = pair.originalIndex === respuestaCorrecta
                  const showResult = showMcFeedback

                  let optionStyle = 'border-gray-600 hover:border-blue-500 hover:bg-blue-500/10'
                  if (showResult) {
                    if (isCorrect) {
                      optionStyle = 'border-green-500 bg-green-500/20'
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-red-500 bg-red-500/20'
                    } else {
                      optionStyle = 'border-gray-700 opacity-50'
                    }
                  }

                  return (
                    <motion.button
                      key={`${currentIndex}-mc-${displayIndex}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: displayIndex * 0.1 }}
                      onClick={() => handleMcAnswer(pair.originalIndex)}
                      disabled={showMcFeedback}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        optionStyle
                      } ${!showMcFeedback ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
                          {String.fromCharCode(65 + displayIndex)}
                        </span>
                        <span className="text-gray-200">{pair.text}</span>
                        {showResult && isCorrect && (
                          <span className="ml-auto text-green-400">✓</span>
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <span className="ml-auto text-red-400">✗</span>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {showMcFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${
                    selectedMcOption === respuestaCorrecta
                      ? 'bg-green-500/20 border border-green-500'
                      : 'bg-red-500/20 border border-red-500'
                  }`}
                >
                  <p className={`font-bold mb-2 ${
                    selectedMcOption === respuestaCorrecta ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedMcOption === respuestaCorrecta ? '¡Correcto! +4 pts ✅' : 'Incorrecto ❌'}
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
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  )
}
