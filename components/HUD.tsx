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
  if (hp > 60) return 'bg-neon-emerald'
  if (hp > 30) return 'bg-neon-amber'
  return 'bg-neon-rose'
}

function getShieldGlow(hp: number): string {
  if (hp > 60) return 'shadow-[0_0_8px_rgba(0,230,118,0.5)]'
  if (hp > 30) return 'shadow-[0_0_8px_rgba(255,179,0,0.5)]'
  return 'shadow-[0_0_8px_rgba(255,64,129,0.5)]'
}

function getAutonomyColor(level: string): string {
  switch (level) {
    case 'novice': return 'text-neon-cyan border-neon-cyan/40'
    case 'defender': return 'text-neon-magenta border-neon-magenta/40'
    case 'guardian': return 'text-neon-amber border-neon-amber/40'
    case 'elite': return 'text-neon-rose border-neon-rose/40'
    default: return 'text-neon-cyan border-neon-cyan/40'
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
  const { shieldHP, maxShieldHP, autonomyLevel, xp, notebookOpen, toggleNotebook, completedChallenges } = useHUD()
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
            className="fixed inset-0 z-50 bg-neon-rose/20 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* HUD Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-9 md:h-12 bg-void/85 backdrop-blur-md border-b border-white/5">
        <div className="h-full max-w-screen-2xl mx-auto px-3 md:px-6 flex items-center gap-3 md:gap-5">
          {/* Shield HP */}
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 shrink-0" />
            <span className="text-[10px] md:text-xs text-slate-400 font-medium hidden sm:inline">
              Escudo
            </span>
            <div className="relative w-16 md:w-24 h-2 md:h-2.5 bg-white/5 rounded-full overflow-hidden">
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
              initial={{ scale: 1.3, color: '#00e5ff' }}
              animate={{ scale: 1, color: '#cbd5e1' }}
              transition={{ duration: 0.3 }}
              className="text-[10px] md:text-xs font-mono font-bold tabular-nums"
            >
              {xp.toLocaleString()}
            </motion.span>
          </div>

          {/* Challenge Progress */}
          {completedChallenges.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] md:text-xs text-slate-400 font-medium hidden sm:inline">
                Retos
              </span>
              <span className="text-[10px] md:text-xs font-mono font-bold text-neon-amber">
                {completedChallenges.length}
              </span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* CPU Visualization (desktop) */}
          <div className="hidden lg:flex items-end gap-[2px] h-4">
            <span className="text-[10px] text-slate-500 mr-1.5 self-center">CPU</span>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-neon-cyan/60 rounded-t"
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
                className="w-1.5 h-1.5 rounded-full bg-neon-emerald/70"
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
            className={`text-slate-400 hover:text-neon-cyan ${
              notebookOpen ? 'text-neon-cyan' : ''
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
