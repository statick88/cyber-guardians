'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, User, RotateCcw, Shield } from 'lucide-react'
import { navigateTo } from '@/lib/navigation'

interface GraduationDiplomaProps {
  totalScore: number
  moduleScores: Record<string, number>
  completionDate: string
  unlockedBadges: string[]
}

const MODULE_NAMES: Record<string, string> = {
  module0: 'Cyber-Diagnóstico',
  module1: 'Caza-Phishing',
  module2: 'Guardianes de Identidad',
  module3: 'Escudo Anti-Reclutamiento',
  module4: 'Tu Código, Tu Escudo',
  module5: 'Deepfake Defender',
  module6: 'Crypto-Scam Shield',
}

const BADGE_DATA: Record<string, { title: string; icon: string }> = {
  'badge-0': { title: 'Iniciado Digital', icon: '🛡️' },
  'badge-1': { title: 'Cazador de Phishing', icon: '🔍' },
  'badge-2': { title: 'Cripto-Defensor', icon: '🔐' },
  'badge-3': { title: 'Analista Forense IA', icon: '👁️' },
  'badge-4': { title: 'Guardián de Código', icon: '⚙️' },
  'badge-5': { title: 'Defensor Deepfake', icon: '🎭' },
  'badge-6': { title: 'Escudo Crypto', icon: '🛡️' },
}

const SANITIZE_REGEX = /[^\w\sáéíóúñüÁÉÍÓÚÑÜ.\-]/g

function sanitizeName(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(SANITIZE_REGEX, '')
    .slice(0, 50)
}

/* ------------------------------------------------------------------ */
/*  Fireworks canvas                                                   */
/* ------------------------------------------------------------------ */
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

function spawnBurst(
  particles: Particle[],
  cx: number,
  cy: number,
  palette: string[],
) {
  const count = 40 + Math.floor(Math.random() * 30)
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
    const speed = 2 + Math.random() * 4
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 50 + Math.floor(Math.random() * 40),
      color: palette[Math.floor(Math.random() * palette.length)],
      size: 1.5 + Math.random() * 2,
    })
  }
}

function runFireworks(canvas: HTMLCanvasElement, durationMs: number) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = canvas.width
  const H = canvas.height
  const particles: Particle[] = []
  const palettes = [
    ['#22d3ee', '#06b6d4', '#67e8f9'],
    ['#a855f7', '#c084fc', '#d8b4fe'],
    ['#f43f5e', '#fb7185', '#fda4af'],
    ['#34d399', '#6ee7b7', '#a7f3d0'],
    ['#fbbf24', '#fcd34d', '#fde68a'],
  ]

  let frame = 0
  const interval = setInterval(() => {
    frame++
    // Spawn a new burst every ~18 frames
    if (frame % 18 === 0) {
      const palette = palettes[Math.floor(Math.random() * palettes.length)]
      spawnBurst(particles, 100 + Math.random() * (W - 200), 100 + Math.random() * (H - 300), palette)
    }

    ctx.fillStyle = 'rgba(10, 14, 26, 0.25)'
    ctx.fillRect(0, 0, W, H)

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.04 // gravity
      p.vx *= 0.99
      p.life++

      const alpha = 1 - p.life / p.maxLife
      if (alpha <= 0) {
        particles.splice(i, 1)
        continue
      }
      ctx.globalAlpha = alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }, 33)

  setTimeout(() => {
    clearInterval(interval)
    // Final fade-out
    ctx.clearRect(0, 0, W, H)
  }, durationMs)

  return () => clearInterval(interval)
}

/* ------------------------------------------------------------------ */
/*  Canvas certificate drawing                                         */
/* ------------------------------------------------------------------ */
function drawCorner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  corner: 'tl' | 'tr' | 'bl' | 'br',
) {
  ctx.beginPath()
  switch (corner) {
    case 'tl':
      ctx.moveTo(x, y + size)
      ctx.lineTo(x, y)
      ctx.lineTo(x + size, y)
      break
    case 'tr':
      ctx.moveTo(x - size, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y + size)
      break
    case 'bl':
      ctx.moveTo(x, y - size)
      ctx.lineTo(x, y)
      ctx.lineTo(x + size, y)
      break
    case 'br':
      ctx.moveTo(x - size, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y - size)
      break
  }
  ctx.stroke()
}

function drawCertificate(
  canvas: HTMLCanvasElement,
  opts: {
    studentName: string
    percentage: number
    moduleScores: Record<string, number>
    completionDate: string
    unlockedBadges: string[]
  },
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = 1200
  canvas.height = 800

  // Background
  ctx.fillStyle = '#0a0e1a'
  ctx.fillRect(0, 0, 1200, 800)

  // Gradient border
  const gradient = ctx.createLinearGradient(0, 0, 1200, 800)
  gradient.addColorStop(0, 'rgba(34,211,238,0.5)')
  gradient.addColorStop(0.5, 'rgba(168,85,247,0.5)')
  gradient.addColorStop(1, 'rgba(244,63,94,0.5)')
  ctx.strokeStyle = gradient
  ctx.lineWidth = 3
  ctx.strokeRect(20, 20, 1160, 760)

  // Corner accents
  const cornerSize = 40
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(34,211,238,0.6)'
  drawCorner(ctx, 25, 25, cornerSize, 'tl')
  ctx.strokeStyle = 'rgba(168,85,247,0.6)'
  drawCorner(ctx, 1175, 25, cornerSize, 'tr')
  ctx.strokeStyle = 'rgba(52,211,153,0.6)'
  drawCorner(ctx, 25, 775, cornerSize, 'bl')
  ctx.strokeStyle = 'rgba(244,63,94,0.6)'
  drawCorner(ctx, 1175, 775, cornerSize, 'br')

  // Glow circles
  const glow1 = ctx.createRadialGradient(300, 100, 0, 300, 100, 200)
  glow1.addColorStop(0, 'rgba(34,211,238,0.08)')
  glow1.addColorStop(1, 'transparent')
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, 1200, 800)

  const glow2 = ctx.createRadialGradient(900, 700, 0, 900, 700, 200)
  glow2.addColorStop(0, 'rgba(168,85,247,0.08)')
  glow2.addColorStop(1, 'transparent')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, 1200, 800)

  // Title
  ctx.textAlign = 'center'
  ctx.fillStyle = '#22d3ee'
  ctx.font = 'bold 42px "JetBrains Mono", monospace, system-ui'
  ctx.shadowColor = 'rgba(34,211,238,0.5)'
  ctx.shadowBlur = 20
  ctx.fillText('CyberGuardians', 600, 90)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#a855f7'
  ctx.font = '24px "JetBrains Mono", monospace, system-ui'
  ctx.fillText('Academy 2026', 600, 125)

  // Divider
  const divGrad = ctx.createLinearGradient(300, 150, 900, 150)
  divGrad.addColorStop(0, 'transparent')
  divGrad.addColorStop(0.5, 'rgba(34,211,238,0.4)')
  divGrad.addColorStop(1, 'transparent')
  ctx.strokeStyle = divGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(300, 155)
  ctx.lineTo(900, 155)
  ctx.stroke()

  // Credential label
  ctx.fillStyle = '#94a3b8'
  ctx.font = '16px system-ui, sans-serif'
  ctx.fillText('CREDENCIAL DE OPERADOR DE RED CERTIFICADO', 600, 190)

  // Student name
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 36px "JetBrains Mono", monospace, system-ui'
  ctx.shadowColor = 'rgba(168,85,247,0.4)'
  ctx.shadowBlur = 15
  ctx.fillText(opts.studentName, 600, 250)
  ctx.shadowBlur = 0

  // Score
  ctx.fillStyle = '#22d3ee'
  ctx.font = 'bold 60px "JetBrains Mono", monospace, system-ui'
  ctx.shadowColor = 'rgba(34,211,238,0.5)'
  ctx.shadowBlur = 25
  ctx.fillText(`${opts.percentage}%`, 600, 330)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#64748b'
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillText('PUNTUACIÓN GLOBAL', 600, 355)

  // Module scores
  const modules = Object.entries(opts.moduleScores)
  const moduleStartY = 395
  ctx.textAlign = 'left'
  modules.forEach(([key, score], idx) => {
    const y = moduleStartY + idx * 30
    const name = MODULE_NAMES[key] || key
    ctx.fillStyle = '#94a3b8'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText(name, 100, y)
    ctx.textAlign = 'right'
    const color = score >= 70 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f43f5e'
    ctx.fillStyle = color
    ctx.font = 'bold 14px "JetBrains Mono", monospace, system-ui'
    ctx.fillText(`${score}%`, 1100, y)
    ctx.textAlign = 'left'
  })

  // Badges
  const badgeY = 590
  ctx.textAlign = 'center'
  const badgeIds = Object.keys(BADGE_DATA)
  const badgeSpacing = 180
  const badgeStartX = 600 - ((badgeIds.length - 1) * badgeSpacing) / 2

  badgeIds.forEach((id, idx) => {
    const x = badgeStartX + idx * badgeSpacing
    const isUnlocked = opts.unlockedBadges.includes(id)
    const badge = BADGE_DATA[id]

    ctx.globalAlpha = isUnlocked ? 1 : 0.3
    ctx.font = '30px system-ui'
    ctx.fillText(badge.icon, x, badgeY)
    ctx.font = '10px system-ui, sans-serif'
    ctx.fillStyle = isUnlocked ? '#94a3b8' : '#475569'
    ctx.fillText(badge.title, x, badgeY + 20)
    ctx.globalAlpha = 1
  })

  // Signature
  ctx.textAlign = 'center'
  ctx.fillStyle = '#475569'
  ctx.font = '12px system-ui, sans-serif'
  ctx.fillText(`Completado: ${opts.completionDate}`, 600, 720)

  ctx.fillStyle = '#a855f7'
  ctx.font = 'bold 14px "JetBrains Mono", monospace, system-ui'
  ctx.shadowColor = 'rgba(168,85,247,0.3)'
  ctx.shadowBlur = 10
  ctx.fillText('CyberGuardians Academy', 600, 750)
  ctx.shadowBlur = 0
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function GraduationDiploma({
  totalScore,
  moduleScores,
  completionDate,
  unlockedBadges,
}: GraduationDiplomaProps) {
  const [studentName, setStudentName] = useState('')
  const [showCertificate, setShowCertificate] = useState(false)
  const [showRestartModal, setShowRestartModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fireworksRef = useRef<HTMLCanvasElement>(null)
  const fireworksCleanupRef = useRef<(() => void) | null>(null)

  const percentage = Math.round(totalScore)

  /* Fireworks on certificate reveal */
  useEffect(() => {
    if (!showCertificate || !fireworksRef.current) return
    fireworksCleanupRef.current = runFireworks(fireworksRef.current, 4000) ?? null
    return () => {
      fireworksCleanupRef.current?.()
    }
  }, [showCertificate])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentName(sanitizeName(e.target.value))
  }

  const handleGenerate = () => {
    if (studentName.trim().length >= 2) {
      setShowCertificate(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGenerate()
  }

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return
    setIsDownloading(true)

    requestAnimationFrame(() => {
      drawCertificate(canvasRef.current!, {
        studentName,
        percentage,
        moduleScores,
        completionDate,
        unlockedBadges,
      })
      const dataUrl = canvasRef.current!.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `cyberguardians-${studentName.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = dataUrl
      link.click()
      setIsDownloading(false)
    })
  }, [studentName, percentage, moduleScores, completionDate, unlockedBadges])

  const handleRestart = useCallback(() => {
    localStorage.removeItem('cg_2026_hud_state')
    localStorage.removeItem('cg_2026_unlocked_badges')
    for (let i = 0; i <= 4; i++) {
      localStorage.removeItem(`cg_2026_module${i}`)
    }
    navigateTo('/')
  }, [])

  return (
    <div className="space-y-8">
      {/* Hidden canvas for download */}
      <canvas ref={canvasRef} className="hidden" width={1200} height={800} />

      {/* Fireworks overlay */}
      <AnimatePresence>
        {showCertificate && (
          <motion.canvas
            ref={fireworksRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ width: '100vw', height: '100vh' }}
          />
        )}
      </AnimatePresence>

      {/* ─── Input Phase ─── */}
      {!showCertificate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="relative bg-slate-900/95 rounded-2xl border border-cyan-500/30 p-8 overflow-hidden shadow-neon">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />

            <div className="relative space-y-6">
              <div className="text-center">
                <User className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white font-mono">
                  Ingresa tu nombre
                </h3>
                <p className="text-sm text-slate-400">
                  Aparecerá en tu credencial de certificación
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={studentName}
                  onChange={handleNameChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Tu nombre completo"
                  maxLength={50}
                  className="w-full bg-slate-800/80 border border-slate-600/50 rounded-lg px-4 py-3 text-white text-center font-mono text-lg placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                  {studentName.length}/50
                </div>
              </div>

              {studentName.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                >
                  <p className="text-xs text-slate-500 mb-1 font-mono">
                    Vista previa:
                  </p>
                  <p className="text-xl font-bold font-mono text-center bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
                    {studentName}
                  </p>
                </motion.div>
              )}

              <button
                onClick={handleGenerate}
                disabled={studentName.trim().length < 2}
                className="w-full py-3 min-h-[44px] rounded-lg font-bold font-mono text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-neon"
              >
                Generar Credencial
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Certificate Display ─── */}
      {showCertificate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Certificate card */}
          <div className="relative bg-[#0a0e1a] rounded-2xl border-2 border-cyan-500/30 overflow-hidden shadow-neon-strong">
            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-purple-500/40 rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-rose-500/40 rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-emerald-500/40 rounded-br-lg" />

            {/* Glow effects */}
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="relative p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                <h2 className="text-3xl md:text-4xl font-bold font-mono bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
                  CyberGuardians
                </h2>
                <p className="text-purple-400 font-mono text-sm mt-1">
                  Academy 2026
                </p>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-8" />

              <p className="text-center text-slate-500 text-sm tracking-widest mb-2 font-mono">
                CREDENCIAL DE OPERADOR DE RED CERTIFICADO
              </p>

              {/* Student Name */}
              <h1 className="text-3xl md:text-4xl font-bold font-mono text-center text-white mb-6">
                {studentName}
              </h1>

              {/* Score */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold font-mono text-cyan-400 neon-text-strong">
                  {percentage}%
                </div>
                <p className="text-slate-500 text-xs tracking-widest mt-1 font-mono">
                  PUNTUACIÓN GLOBAL
                </p>
              </div>

              {/* Module Scores */}
              <div className="space-y-2 mb-8 max-w-lg mx-auto">
                {Object.entries(moduleScores).map(([key, score]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-slate-800/40 rounded-lg px-4 py-2 border border-slate-700/30"
                  >
                    <span className="text-sm text-slate-400">
                      {MODULE_NAMES[key] || key}
                    </span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        score >= 70
                          ? 'text-emerald-400'
                          : score >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Badges */}
              <div className="flex justify-center gap-4 md:gap-6 mb-8 flex-wrap">
                {Object.entries(BADGE_DATA).map(([id, badge]) => {
                  const isUnlocked = unlockedBadges.includes(id)
                  return (
                    <div
                      key={id}
                      className={`text-center ${isUnlocked ? '' : 'opacity-30 grayscale'}`}
                    >
                      <div className="text-3xl">{badge.icon}</div>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">
                        {badge.title}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-4" />
              <p className="text-center text-xs text-slate-400 font-mono">
                Completado: {completionDate}
              </p>
              <p className="text-center text-sm font-bold font-mono text-purple-400 mt-2">
                CyberGuardians Academy
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-lg font-bold font-mono text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 transition-all shadow-neon-purple"
            >
              <Download className="w-5 h-5" />
              {isDownloading ? 'Generando...' : 'Descargar Credencial (PNG)'}
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={() => setShowRestartModal(true)}
              className="flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-lg font-bold font-mono text-slate-300 border border-slate-600/50 hover:border-cyan-500/40 hover:text-white transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Reiniciar Sistema
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ─── Restart Confirmation Modal ─── */}
      <AnimatePresence>
        {showRestartModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setShowRestartModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-8 max-w-sm w-full shadow-neon-strong space-y-6"
            >
              <div className="text-center">
                <RotateCcw className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white font-mono">
                  ¿Reiniciar Sistema?
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Se borrarán todos tus progresos, insignias y puntuaciones.
                  Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRestartModal(false)}
                  className="flex-1 py-3 min-h-[44px] rounded-lg font-bold font-mono text-slate-300 border border-slate-600/50 hover:border-slate-500 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 min-h-[44px] rounded-lg font-bold font-mono text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 transition-all"
                >
                  Reiniciar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
