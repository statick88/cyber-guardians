'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onScore: (points: number) => void
  onComplete: () => void
}

interface SearchResult {
  engine: string
  found: boolean
  details: string
}

export default function ReverseImageSearch({ onScore, onComplete }: Props) {
  const [phase, setPhase] = useState<'intro' | 'searching' | 'results' | 'question' | 'feedback'>('intro')
  const [currentEngine, setCurrentEngine] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const searchResults: SearchResult[] = [
    { engine: 'Google Images', found: true, details: 'Imagen encontrada en 15 sitios web diferentes con Contextos variados' },
    { engine: 'TinEye', found: true, details: 'Primera aparición: 2019 en un blog de fotografía stock' },
    { engine: 'Yandex', found: true, details: 'Imagen vinculada a cuenta de estafa en app de citas' }
  ]

  const handleStartSearch = useCallback(() => {
    setPhase('searching')
    setCurrentEngine(0)
  }, [])

  const handleNextEngine = useCallback(() => {
    if (currentEngine < searchResults.length - 1) {
      setCurrentEngine(prev => prev + 1)
    } else {
      setPhase('results')
    }
  }, [currentEngine])

  const handleAnswer = useCallback((answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setPhase('feedback')
    
    const isCorrect = answerIndex === 2 // "La imagen fue robada de otro sitio"
    const points = isCorrect ? 4 : 0
    
    setScore(prev => prev + points)
    onScore(points)
  }, [onScore])

  const handleComplete = useCallback(() => {
    onComplete()
  }, [onComplete])

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Búsqueda Reversa de Imágenes
        </h3>

        {phase === 'intro' && (
          <div className="text-center">
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-gray-300 mb-4">
                Una foto de perfil sospechosa apareció en una app de citas. 
                Vamos a verificar si es real o robada.
              </p>
              <div className="bg-gray-600 rounded-lg p-4">
                <p className="text-white font-semibold"> Foto a verificar</p>
                <p className="text-gray-400 text-sm">Perfil: &quot;María, 22 años, Fotógrafa&quot;</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🔍 Iniciar Búsqueda
            </motion.button>
          </div>
        )}

        {phase === 'searching' && (
          <div>
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-gray-400 text-sm mb-2">Buscando en: {searchResults[currentEngine].engine}</p>
              <div className="w-full bg-gray-600 rounded-full h-2 mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5 }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
              <AnimatePresence mode="wait">
                {currentEngine > 0 && (
                  <motion.div
                    key={currentEngine}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-gray-300"
                  >
                    {searchResults[currentEngine - 1].found ? (
                      <p>✅ {searchResults[currentEngine - 1].details}</p>
                    ) : (
                      <p>❌ No encontrada en {searchResults[currentEngine - 1].engine}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextEngine}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {currentEngine < searchResults.length - 1 ? 'Siguiente Motor →' : 'Ver Resultados'}
            </motion.button>
          </div>
        )}

        {phase === 'results' && (
          <div>
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400 font-bold mb-2">⚠️ ¡Alerta de Estafa!</p>
              <p className="text-gray-300">
                La imagen fue encontrada en múltiples sitios. Primera aparición en 2019 como foto de stock.
                El perfil es falso y fue creado para robar dinero.
              </p>
            </div>
            
            <p className="text-white font-semibold mb-4">¿Qué concluyes?</p>
            <div className="space-y-2">
              <button
                onClick={() => handleAnswer(0)}
                className="w-full text-left p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <span className="text-gray-300">La foto es real pero el perfil es falso</span>
              </button>
              <button
                onClick={() => handleAnswer(1)}
                className="w-full text-left p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <span className="text-gray-300">La foto es de una estafadora conocida</span>
              </button>
              <button
                onClick={() => handleAnswer(2)}
                className="w-full text-left p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <span className="text-gray-300">La imagen fue robada de otro sitio para crear un perfil falso</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                selectedAnswer === 2 
                  ? 'bg-green-500/20 border border-green-500' 
                  : 'bg-red-500/20 border border-red-500'
              }`}
            >
              <p className={`font-bold mb-2 ${
                selectedAnswer === 2 ? 'text-green-400' : 'text-red-400'
              }`}>
                {selectedAnswer === 2 ? '¡Correcto! ✅' : 'Incorrecto ❌'}
              </p>
              <p className="text-gray-300 text-sm mb-4">
                La búsqueda reversa reveló que la imagen fue robada de un sitio de stock y reutilizada 
                para crear un perfil falso. Siempre verifica imágenes de desconocidos.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleComplete}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Siguiente Actividad →
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
