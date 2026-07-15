'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, ChevronRight } from 'lucide-react'

interface WelcomeScreenProps {
  onStart: () => void
  moduleTitle?: string
  moduleSubtitle?: string
  moduleDescription?: string
  moduleIcon?: string
  stats?: string
  moduleNumber?: number
  isLoading?: boolean
}

export default function WelcomeScreen({ 
  onStart, 
  moduleTitle = "Cyber-Diagnóstico",
  moduleSubtitle = "Elige tu propia aventura digital",
  moduleDescription = "Antes de convertirte en un Cyber-Guardián, necesitamos conocer tu nivel de defensa digital.",
  moduleIcon = "🛡️",
  stats = "10 escenarios · 5-8 minutos · Umbral: 70%",
  moduleNumber = 0,
  isLoading = false,
}: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-2xl mx-auto"
      >
        {/* Floating Shield Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 shadow-neon">
            <Shield className="w-12 h-12 text-cyan-400" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            <span className="text-cyan-400 neon-text-strong">Cyber</span>
            <span className="text-slate-100">Guardians</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium code-font">MÓDULO {moduleNumber}</span>
          </div>
        </motion.div>

        {/* Module Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3"
        >
          {moduleTitle}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-lg text-cyan-300/80 mb-6 code-font"
        >
          {moduleSubtitle}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-slate-400 text-base sm:text-lg leading-relaxed mb-4 max-w-xl mx-auto text-balance"
        >
          {moduleDescription}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="text-slate-500 text-sm mb-10 code-font"
        >
          {stats}
        </motion.p>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <button
            onClick={onStart}
            disabled={isLoading}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-lg rounded-xl transition-all duration-300 animate-pulse-neon focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={`Iniciar ${moduleTitle}`}
          >
            <Shield className="w-5 h-5" />
            {isLoading ? (
              <>
                <span>Cargando Misión...</span>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
              </>
            ) : (
              <>
                Iniciar Misión
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </motion.div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      </motion.div>
    </div>
  )
}