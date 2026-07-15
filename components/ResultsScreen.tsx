'use client'

import { motion } from 'framer-motion'
import { Trophy, RotateCcw, ChevronRight, Star, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { ModuloData, Categoria } from '@/types/module0'

interface ResultsScreenProps {
  score: number
  maxScore: number
  categoryScores: Record<string, number>
  categorias: Categoria[]
  modulo: ModuloData['modulo']
  onRetry: () => void
  onContinue: () => void
  isNavigating?: boolean
  continueLabel?: string
}

function ConfettiPiece({ index }: { index: number }) {
  const colors = ['#22d3ee', '#34d399', '#a855f7', '#fbbf24', '#f43f5e']
  const color = colors[index % colors.length]
  const left = Math.random() * 100
  const delay = Math.random() * 0.5
  const duration = 2 + Math.random() * 2
  const size = 6 + Math.random() * 8
  const rotation = Math.random() * 360

  return (
    <motion.div
      initial={{ y: -20, opacity: 1, rotate: 0, x: 0 }}
      animate={{
        y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
        opacity: [1, 1, 0],
        rotate: rotation + 720,
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{ duration, delay, ease: 'easeIn' }}
      className="absolute pointer-events-none"
      style={{
        left: `${left}%`,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
    />
  )
}

export default function ResultsScreen({
  score,
  maxScore,
  categoryScores,
  categorias,
  modulo,
  onRetry,
  onContinue,
  isNavigating = false,
  continueLabel = 'Continuar',
}: ResultsScreenProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const passed = percentage >= modulo.umbralAprobacion

  useEffect(() => {
    if (passed) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [passed])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full mx-auto"
      >
        {/* Score Card */}
        <div className={`glass-card rounded-2xl p-6 sm:p-8 mb-6 text-center ${
          passed ? 'neon-border-emerald' : 'neon-border-amber'
        }`}>
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${
              passed
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : 'bg-amber-500/10 border border-amber-500/30'
            }`}>
              <span className="text-4xl">{passed ? '🛡️' : '⚠️'}</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-2xl sm:text-3xl font-bold mb-2 ${
              passed ? 'text-emerald-300' : 'text-amber-300'
            }`}
          >
            {passed ? '¡Cyber-Guardián Iniciado!' : 'Nivelación Necesaria'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 mb-6"
          >
            {passed ? 'Estás listo para la misión' : 'Necesitas reforzar tus defensas'}
          </motion.p>

          {/* Score Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="mb-6"
          >
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${
              passed
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-amber-500 bg-amber-500/5'
            }`}>
              <div>
                <p className={`text-3xl font-bold code-font ${
                  passed ? 'text-emerald-300' : 'text-amber-300'
                }`}>
                  {percentage}%
                </p>
                <p className="text-slate-400 text-xs code-font">
                  {score}/{maxScore} pts
                </p>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto text-balance"
          >
            {passed
              ? '¡Felicidades! Demuestras un nivel sólido de conciencia digital. Tienes las bases para convertirte en un verdadero Cyber-Guardián. ¡Prepárate para el Módulo 1!'
              : 'No te preocupes, ¡todos aprendemos! Algunos conceptos básicos necesitan refuerzo antes de avanzar. Completa estas micro-actividades para ponerte al día.'}
          </motion.p>
        </div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card rounded-2xl p-5 sm:p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider code-font">
              Desglose por Categoría
            </h3>
          </div>
          <div className="space-y-3">
            {categorias.map((cat) => {
              const catScore = categoryScores[cat.nombre] || 0
              const maxCatScore = 20
              const catPercentage = maxCatScore > 0 ? Math.round((catScore / maxCatScore) * 100) : 0
              return (
                <div key={cat.id} className="flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400 truncate">{cat.nombre}</span>
                      <span className="text-xs text-slate-400 code-font ml-2">
                        {catScore}/{maxCatScore}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${catPercentage}%` }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                        className={`h-full rounded-full ${
                          catPercentage >= 70 ? 'bg-emerald-500' : catPercentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                  {catPercentage >= 70 ? (
                    <Star className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" />
                  ) : (
                    <span className="w-4 h-4 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          {passed ? (
            <button
              onClick={onContinue}
              disabled={isNavigating}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all duration-300 shadow-neon-emerald focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={continueLabel}
            >
              <Trophy className="w-5 h-5" />
              {isNavigating ? (
                <>
                  <span>Cargando...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent" />
                </>
              ) : (
                <>
                  {continueLabel}
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onRetry}
              disabled={isNavigating}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all duration-300 shadow-neon focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Reintentar el diagnóstico"
            >
              <RotateCcw className="w-5 h-5" />
              Reintentar Diagnóstico
            </button>
          )}
          <button
            onClick={onRetry}
            disabled={isNavigating}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Volver a empezar"
          >
            <RotateCcw className="w-4 h-4" />
            Empezar de Nuevo
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
