'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Cpu, Network, BookOpen } from 'lucide-react'
import { useHUD } from '@/components/HUDProvider'
import { NotebookPanel } from '@/components/mediator/NotebookPanel'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getShieldColor(hp: number): string {
  if (hp > 60) return 'bg-emerald-500'
  if (hp > 30) return 'bg-amber-500'
  return 'bg-red-500'
}

function getShieldGlow(hp: number): string {
  if (hp > 60) return 'shadow-[0_0_8px_rgba(16,185,129,0.5)]'
  if (hp > 30) return 'shadow-[0_0_8px_rgba(245,158,11,0.5)]'
  return 'shadow-[0_0_8px_rgba(239,68,68,0.5)]'
}

function getAutonomyColor(level: string): string {
  switch (level) {
    case 'novice': return 'text-cyan-400 border-cyan-500/40'
    case 'defender': return 'text-pink-400 border-pink-500/40'
    case 'guardian': return 'text-amber-400 border-amber-500/40'
    case 'elite': return 'text-red-400 border-red-500/40'
    default: return 'text-cyan-400 border-cyan-500/40'
  }
}

function getAutonomyLabel(level: string): string {
  switch (level) {
    case 'novice': return 'Novato'
    case 'defender': return 'Defensor'
    case 'guardian': return 'Guardián'
    case 'elite': return 'Élite'
    default: return 'Novato'
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HUD() {
  const { shieldHP, maxShieldHP, autonomyLevel, xp, notebookOpen, toggleNotebook } = useHUD()
  const prevHP = useRef(shieldHP)
  const [showFlash, setShowFlash] = useState(false)

  // Red flash when shield takes damage
  useEffect(() => {
    if (shieldHP < prevHP.current) {
      setShowFlash(true)
      const timer = setTimeout(() => setShowFlash(false), 300)
      prevHP.current = shieldHP
      return () => clearTimeout(timer)
    }
    prevHP.current = shieldHP
  }, [shieldHP])

  const hpPercent = Math.round((shieldHP / maxShieldHP) * 100)

  return (
    <>
      {/* Damage flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-red-500/20 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* HUD Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-9 md:h-12 bg-[#0a0a1a]/90 backdrop-blur border-b border-slate-800/50">
        <div className="h-full max-w-screen-2xl mx-auto px-3 md:px-6 flex items-center gap-3 md:gap-5">
          {/* Shield HP */}
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 shrink-0" />
            <span className="text-[10px] md:text-xs text-slate-400 font-medium hidden sm:inline">
              Escudo
            </span>
            <div className="relative w-16 md:w-24 h-2 md:h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getShieldColor(shieldHP)} ${getShieldGlow(shieldHP)}`}
                initial={false}
                animate={{ width: `${hpPercent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] md:text-xs text-slate-300 font-mono tabular-nums w-8 text-right">
              {hpPercent}%
            </span>
          </div>

          {/* Autonomy Level */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] md:text-xs text-slate-400 font-medium hidden sm:inline">
              Nivel
            </span>
            <span
              className={`text-[10px] md:text-xs font-bold border rounded px-1.5 py-0.5 ${getAutonomyColor(autonomyLevel)}`}
            >
              {getAutonomyLabel(autonomyLevel)}
            </span>
          </div>

          {/* XP Counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] md:text-xs text-slate-400 font-medium hidden sm:inline">
              XP
            </span>
            <motion.span
              key={xp}
              initial={{ scale: 1.3, color: '#06b6d4' }}
              animate={{ scale: 1, color: '#cbd5e1' }}
              transition={{ duration: 0.3 }}
              className="text-[10px] md:text-xs font-mono font-bold tabular-nums"
            >
              {xp.toLocaleString()}
            </motion.span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CPU Visualization (desktop) */}
          <div className="hidden lg:flex items-end gap-[2px] h-4">
            <span className="text-[10px] text-slate-500 mr-1.5 self-center">CPU</span>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-cyan-500/60 rounded-t"
                animate={{
                  height: [4, 8 + Math.random() * 8, 4],
                }}
                transition={{
                  duration: 1 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Network Activity (desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            <Network className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500 mr-1">Red</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-emerald-500/70"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Notebook Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleNotebook}
            className={`text-slate-400 hover:text-cyan-400 ${
              notebookOpen ? 'text-cyan-400' : ''
            }`}
            aria-label={notebookOpen ? "Cerrar cuaderno" : "Abrir cuaderno"}
            title={notebookOpen ? "Cerrar cuaderno" : "Abrir cuaderno"}
          >
            <BookOpen className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <NotebookPanel isOpen={notebookOpen} onClose={toggleNotebook} />
    </>
  )
}
