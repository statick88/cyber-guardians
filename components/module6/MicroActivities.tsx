'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Twitter, MessageCircle, Copy, CheckCircle } from 'lucide-react'

interface Props {
  onComplete: (score: number) => void
}

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    pregunta: '¿Cuánto aumentaron las estafas con código QR desde 2022 según el FTC?',
    opciones: ['2 veces', '3 veces', '5 veces', '10 veces'],
    respuestaCorrecta: 1,
    explicacion: 'El FTC reportó que las estafas con QR se triplicaron desde 2022.',
  },
  {
    id: 'q2',
    pregunta: '¿Cuánto costaron las estafas de empleo globalmente en 2023 según el FBI IC3?',
    opciones: ['$100 millones', '$500 millones', '$1.1 mil millones', '$5 mil millones'],
    respuestaCorrecta: 2,
    explicacion: 'El FBI IC3 reportó que las estafas de empleo costaron $1.1 mil millones en 2023.',
  },
  {
    id: 'q3',
    pregunta: '¿Qué porcentaje de phishing por QR afecta a usuarios móviles según ScamAdviser?',
    opciones: ['30%', '50%', '70%', '90%'],
    respuestaCorrecta: 2,
    explicacion: 'ScamAdviser 2024 reporta que el 70% de phishing por QR afecta a usuarios móviles.',
  },
]

export default function MicroActivities({ onComplete }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [copied, setCopied] = useState(false)

  const quiz = QUIZ_QUESTIONS[currentQuestion]
  const isQuizLast = currentQuestion >= QUIZ_QUESTIONS.length - 1

  const handleAnswer = useCallback((index: number) => {
    setSelectedAnswer(index)
    setShowFeedback(true)
    if (index === quiz.respuestaCorrecta) {
      setScore(prev => prev + 3)
    }
  }, [quiz])

  const handleNextQuiz = useCallback(() => {
    if (isQuizLast) {
      onComplete(score)
    } else {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }
  }, [isQuizLast, onComplete, score])

  const handleCopyShare = useCallback(() => {
    const text = '🛡️ Acabo de completar el módulo Crypto-Scam Shield en CyberGuardians. Aprendí a detectar estafas QR, esquemas piramidales y fraudes de empleo. ¡Protege tu dinero! 💰'
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Social Sharing */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-cyan-400" />
          Comparte lo que aprendiste
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          Comparte con tus amigos para que también aprendan a protegerse de estafas financieras.
        </p>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyShare}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado!' : 'Copiar mensaje'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('🛡️ Acabo de completar Crypto-Scam Shield en CyberGuardians. Aprendí a detectar estafas QR, pirámides y fraudes laborales. ¡Protege tu dinero! 💰'), '_blank')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Twitter className="w-4 h-4" />
            Compartir
          </motion.button>
        </div>
      </div>

      {/* Quick Quiz */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            Quiz Rápido
          </h3>
          <span className="bg-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded-full">
            {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
          </span>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <p className="text-white font-medium">{quiz.pregunta}</p>
        </div>

        <div className="space-y-2 mb-4">
          {quiz.opciones.map((opcion, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => !showFeedback && handleAnswer(i)}
              disabled={showFeedback}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedAnswer === i
                  ? showFeedback
                    ? i === quiz.respuestaCorrecta
                      ? 'bg-green-600/30 border-green-500 text-green-300'
                      : 'bg-red-600/30 border-red-500 text-red-300'
                    : 'bg-purple-600/30 border-purple-500 text-purple-300'
                  : showFeedback && i === quiz.respuestaCorrecta
                    ? 'bg-green-600/20 border-green-500 text-green-300'
                    : 'bg-gray-600/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <span className="text-sm">{opcion}</span>
            </motion.button>
          ))}
        </div>

        {showFeedback && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                selectedAnswer === quiz.respuestaCorrecta
                  ? 'bg-green-500/20 border border-green-500'
                  : 'bg-red-500/20 border border-red-500'
              }`}
            >
              <p className={`font-bold mb-2 ${
                selectedAnswer === quiz.respuestaCorrecta ? 'text-green-400' : 'text-red-400'
              }`}>
                {selectedAnswer === quiz.respuestaCorrecta ? '¡Correcto! ✅' : 'Incorrecto ❌'}
              </p>
              <p className="text-gray-300 text-sm mb-4">{quiz.explicacion}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuiz}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {isQuizLast ? 'Ver Resultados' : 'Siguiente →'}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
