'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, ChevronRight } from 'lucide-react'
import { initAudio } from '@/lib/soundEffects'

interface WelcomeScreenProps {
  onStart: () => void
  moduleTitle?: string
  moduleSubtitle?: string
  moduleDescription?: string
  stats?: string
  moduleNumber?: number
  isLoading?: boolean
}

export default function WelcomeScreen({
  onStart,
  moduleTitle = "Cyber-Diagnóstico",
  moduleSubtitle = "Elige tu propia aventura digital",
  moduleDescription = "Antes de convertirte en un Cyber-Guardián, necesitamos conocer tu nivel de defensa digital.",
  stats = "10 escenarios · 5-8 minutos · Umbral: 70%",
  moduleNumber = 0,
  isLoading = false,
}: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-void aurora-bg">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-4xl mx-auto relative z-10"
      >
        {/* Floating Shield Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 shadow-neon-cyan">
            <Shield className="w-12 h-12 text-neon-cyan" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight font-display">
            <span className="text-neon-cyan neon-text">Cyber</span>
            <span className="text-white">Guardians</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 mb-6">
            <Zap className="w-4 h-4 text-neon-cyan" />
            <span className="text-neon-cyan text-sm font-medium font-mono uppercase tracking-widest">Módulo {moduleNumber}</span>
          </div>
        </motion.div>

        {/* Module Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-2xl sm:text-3xl font-bold text-white mb-3 font-display"
        >
          {moduleTitle}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-lg text-neon-magenta/80 mb-6 font-mono"
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
          className="text-slate-500 text-sm mb-10 font-mono"
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
            onClick={() => {
              initAudio()
              onStart()
            }}
            disabled={isLoading}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-neon-cyan hover:brightness-110 text-void font-bold text-lg rounded-xl transition-all duration-300 animate-glow-pulse focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-void disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={`Iniciar ${moduleTitle}`}
          >
            <Shield className="w-5 h-5" />
            {isLoading ? (
              <>
                <span>Cargando Misión...</span>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-void border-t-transparent" />
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
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      </motion.div>
    </div>
  )
}
