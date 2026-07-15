'use client'

import { motion } from 'framer-motion'
import { STORAGE_KEYS } from '@/lib/storage-keys'

interface BadgeItem {
  id: string
  moduleId: string
  title: string
  icon: string
  neonColor: string
  description: string
}

const BADGES: BadgeItem[] = [
  { id: 'badge-0', moduleId: 'module0', title: 'Iniciado Digital', icon: '🛡️', neonColor: 'purple', description: 'Completó el diagnóstico' },
  { id: 'badge-1', moduleId: 'module1', title: 'Cazador de Phishing', icon: '🔍', neonColor: 'cyan', description: 'Detectó phishing' },
  { id: 'badge-2', moduleId: 'module2', title: 'Cripto-Defensor', icon: '🔐', neonColor: 'emerald', description: 'Defendió contraseñas' },
  { id: 'badge-3', moduleId: 'module3', title: 'Analista Forense IA', icon: '👁️', neonColor: 'amber', description: 'Detectó deepfakes' },
  { id: 'badge-4', moduleId: 'module4', title: 'Guardián de Código', icon: '⚙️', neonColor: 'rose', description: 'Escribió código seguro' },
]

const NEON_CLASSES: Record<string, { border: string; shadow: string; text: string; glow: string }> = {
  cyan: { border: 'border-cyan-500/50', shadow: 'shadow-neon', text: 'text-cyan-400', glow: 'rgba(34,211,238,0.4)' },
  purple: { border: 'border-purple-500/50', shadow: 'shadow-neon-purple', text: 'text-purple-400', glow: 'rgba(168,85,247,0.4)' },
  emerald: { border: 'border-emerald-500/50', shadow: 'shadow-neon-emerald', text: 'text-emerald-400', glow: 'rgba(52,211,153,0.4)' },
  amber: { border: 'border-amber-500/50', shadow: 'shadow-neon-amber', text: 'text-amber-400', glow: 'rgba(251,191,36,0.4)' },
  rose: { border: 'border-rose-500/50', shadow: 'shadow-neon-rose', text: 'text-rose-400', glow: 'rgba(244,63,94,0.4)' },
}

interface BadgesGridProps {
  unlockedBadges: string[]
}

export default function BadgesGrid({ unlockedBadges }: BadgesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {BADGES.map((badge, index) => {
        const isUnlocked = unlockedBadges.includes(badge.id)
        const neon = NEON_CLASSES[badge.neonColor] ?? NEON_CLASSES.cyan

        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className={`relative rounded-xl border p-5 text-center transition-all duration-300 ${
              isUnlocked
                ? `bg-slate-900/90 ${neon.border} ${neon.shadow}`
                : 'bg-slate-900/60 border-slate-700/40 opacity-50'
            }`}
            style={
              isUnlocked
                ? { filter: undefined }
                : { filter: 'grayscale(1)' }
            }
          >
            {isUnlocked && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{
                  boxShadow: [
                    `0 0 10px ${neon.glow}, 0 0 30px ${neon.glow.replace('0.4', '0.1')}`,
                    `0 0 20px ${neon.glow}, 0 0 50px ${neon.glow.replace('0.4', '0.2')}`,
                    `0 0 10px ${neon.glow}, 0 0 30px ${neon.glow.replace('0.4', '0.1')}`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            <div className="relative z-10">
              <motion.div
                className="text-5xl mb-3"
                animate={isUnlocked ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: 3, ease: 'easeInOut' }}
              >
                {badge.icon}
              </motion.div>

              <h3 className={`text-sm font-bold mb-1 ${isUnlocked ? neon.text : 'text-slate-400'}`}>
                {badge.title}
              </h3>

              <p className={`text-xs ${isUnlocked ? 'text-slate-400' : 'text-slate-500'}`}>
                {badge.description}
              </p>

              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl opacity-60">🔒</span>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
