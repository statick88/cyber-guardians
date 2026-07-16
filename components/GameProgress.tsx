'use client'

import { motion } from 'framer-motion'
import { Shield, Zap } from 'lucide-react'
import type { Categoria } from '@/types/module0'

interface GameProgressProps<TCategory extends string> {
  currentIndex: number
  total: number
  score: number
  maxScore: number
  categorias: Categoria[]
  categoryScores: Record<TCategory, number>
}

export default function GameProgress<TCategory extends string>({
  currentIndex,
  total,
  score,
  maxScore,
  categorias,
  categoryScores,
}: GameProgressProps<TCategory>) {
  const progress = ((currentIndex) / total) * 100
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-6">
      {/* Top Bar: Progress + Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-slate-400 code-font">
            {currentIndex + 1} / {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <motion.span
            key={score}
            initial={{ scale: 1.3, color: '#fbbf24' }}
            animate={{ scale: 1, color: '#94a3b8' }}
            transition={{ duration: 0.3 }}
            className="text-sm code-font"
          >
            {score} pts
          </motion.span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
        />
      </div>

      {/* Category Mini-Badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categorias.map((cat) => {
          const catScore = (categoryScores as Record<string, number>)[cat.nombre] || 0
          const hasScored = catScore > 0
          return (
            <span
              key={cat.id}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs code-font transition-all duration-300 ${
                hasScored
                  ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-500'
              }`}
              aria-label={`${cat.nombre}: ${catScore} puntos`}
            >
              <span>{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.nombre}</span>
              {hasScored && <span className="text-cyan-400">✓</span>}
            </span>
          )
        })}
      </div>
    </div>
  )
}