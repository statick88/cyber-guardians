'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import useQuizSound from '@/hooks/useQuizSound'
import type { Escenario } from '@/types/module0'

interface ScenarioCardProps {
  scenario: Escenario
  onAnswer: (puntos: number, categoria: string) => void
}

export default function ScenarioCard({ scenario, onAnswer }: ScenarioCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const { playCorrect, playIncorrect } = useQuizSound()

  // Reset internal state when scenario changes (belt-and-suspenders with key prop)
  useEffect(() => {
    setSelectedOption(null)
    setShowFeedback(false)
  }, [scenario.id])

  const handleSelect = (opcionId: string, puntos: number, esCorrecta: boolean) => {
    if (selectedOption) return
    setSelectedOption(opcionId)
    setShowFeedback(true)
    esCorrecta ? playCorrect() : playIncorrect()
    setTimeout(() => {
      onAnswer(puntos, scenario.categoria)
    }, 2000)
  }

  const getOptionStyle = (opcionId: string, esCorrecta: boolean) => {
    if (!selectedOption) {
      return 'border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5'
    }
    if (selectedOption !== opcionId) {
      return 'border-slate-800 opacity-50'
    }
    if (esCorrecta) {
      return 'border-emerald-500 bg-emerald-500/10 shadow-neon-emerald'
    }
    return 'border-rose-500 bg-rose-500/10 shadow-neon-rose'
  }

  const getFeedbackIcon = (opcionId: string, esCorrecta: boolean) => {
    if (selectedOption !== opcionId) return null
    if (esCorrecta) return <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
    return <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
  }

  const selectedOptionData = scenario.opciones.find(o => o.id === selectedOption)

  return (
    <motion.div
      key={scenario.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto w-full px-4"
    >
      {/* Category Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center mb-6"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
          <span>{scenario.emoji}</span>
          {scenario.categoria}
        </span>
      </motion.div>

      {/* Situation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 sm:p-8 mb-6"
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl flex-shrink-0">{scenario.emoji}</span>
          <div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 code-font">
              Situación
            </h3>
            <p className="text-slate-100 text-base sm:text-lg leading-relaxed break-words">
              {scenario.situacion}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {scenario.opciones.map((opcion, index) => (
          <motion.button
            key={opcion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            onClick={() => handleSelect(opcion.id, opcion.puntos, opcion.esCorrecta)}
            disabled={!!selectedOption}
            className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
              getOptionStyle(opcion.id, opcion.esCorrecta)
            } ${!selectedOption ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : 'cursor-default'}`}
            aria-label={`Opción ${index + 1}: ${opcion.texto}`}
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 code-font">
                {opcion.id.toUpperCase()}
              </span>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed flex-1">
                {opcion.texto}
              </p>
              {getFeedbackIcon(opcion.id, opcion.esCorrecta)}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Feedback Panel */}
      {showFeedback && selectedOptionData && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          transition={{ duration: 0.4 }}
          className={`rounded-xl border-2 p-5 ${
            selectedOptionData.esCorrecta
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-rose-500/30 bg-rose-500/5'
          }`}
        >
          <div className="flex items-start gap-3">
            {selectedOptionData.esCorrecta ? (
              <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : selectedOptionData.puntos > 0 ? (
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold mb-1 ${
                selectedOptionData.esCorrecta
                  ? 'text-emerald-300'
                  : selectedOptionData.puntos > 0
                    ? 'text-amber-300'
                    : 'text-rose-300'
              }`}>
                {selectedOptionData.esCorrecta
                  ? '¡Correcto!'
                  : selectedOptionData.puntos > 0
                    ? '¡Casi!'
                    : 'Incorrecto'}
                {selectedOptionData.puntos > 0 && (
                  <span className="ml-2 text-sm code-font">+{selectedOptionData.puntos} pts</span>
                )}
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedOptionData.retroalimentacion}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
