'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import useAudioSynth from '@/hooks/useAudioSynth'
import { navigateTo } from '@/lib/navigation'
import type {
  Mission,
  MissionStatus,
  ModuleScore,
  OperatorProfile,
  ConsoleLine,
  ModuleTier,
} from '@/types/mainMenu'

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const SANITIZE_REGEX = /[^\w\sáéíóúñüÁÉÍÓÚÑÜ.\-]/g

const MODULE_DEFS: ReadonlyArray<{
  id: number
  slug: string
  codeName: string
  title: string
  description: string
  tier: ModuleTier
  emoji: string
  totalActivities: number
}> = [
  {
    id: 0,
    slug: 'modulo0',
    codeName: 'Fase de Inducción',
    title: 'Cyber-Diagnóstico',
    description: 'Introducción y diagnóstico inicial de tu nivel de ciberseguridad.',
    tier: 'diagnostic',
    emoji: '🛡️',
    totalActivities: 5,
  },
  {
    id: 1,
    slug: 'modulo1',
    codeName: 'Misión: Shadow Protocol',
    title: 'Privacidad y Huella Digital',
    description: 'Protege tu identidad y rastros digitales en la red.',
    tier: 'recon',
    emoji: '🕵️',
    totalActivities: 4,
  },
  {
    id: 2,
    slug: 'modulo2',
    codeName: 'Misión: Phish Hunter',
    title: 'Ingeniería Social e Identidades',
    description: 'Detecta y neutraliza campañas de phishing y suplantación.',
    tier: 'defense',
    emoji: '🎣',
    totalActivities: 4,
  },
  {
    id: 3,
    slug: 'modulo3',
    codeName: 'Misión: CyberSentry',
    title: 'Escudo contra Engaños y Mafias Digitales',
    description: 'Defiende contra deepfakes, ransomware y engaños avanzados.',
    tier: 'forensics',
    emoji: '👁️',
    totalActivities: 4,
  },
  {
    id: 4,
    slug: 'modulo4',
    codeName: 'Misión: CriptoDefensores',
    title: 'Criptografía y Hardening de Sistemas',
    description: 'Refuerza sistemas con criptografía y técnicas de hardening.',
    tier: 'hardening',
    emoji: '⚙️',
    totalActivities: 4,
  },
] as const

const CONSOLE_LINES: ConsoleLine[] = [
  { tag: 'SYSTEM',  text: 'CyberGuardians Tactical Interface v2.6.1', delayMs: 0 },
  { tag: 'CONECTADO', text: 'Inicializando interfaz táctica...', delayMs: 400 },
  { tag: 'INFO',    text: 'Base de datos de amenazas cargada.', delayMs: 900 },
  { tag: 'INFO',    text: 'Módulos de entrenamiento verificados.', delayMs: 1400 },
  { tag: 'WARNING', text: 'Intrusiones simuladas listas en el sector 4.', delayMs: 2000 },
  { tag: 'CONECTADO', text: 'Canal cifrado establecido. Operador autenticado.', delayMs: 2600 },
  { tag: 'SYSTEM',  text: 'Listo para recibir órdenes.', delayMs: 3200 },
]

const TIER_COLORS: Record<ModuleTier, { bg: string; border: string; text: string; glow: string }> = {
  diagnostic: { bg: 'bg-slate-800/60',  border: 'border-slate-500/40',   text: 'text-slate-300',   glow: 'shadow-slate-500/20' },
  recon:      { bg: 'bg-cyan-950/60',   border: 'border-cyan-500/40',    text: 'text-cyan-300',    glow: 'shadow-cyan-500/20' },
  defense:    { bg: 'bg-emerald-950/60', border: 'border-emerald-500/40', text: 'text-emerald-300', glow: 'shadow-emerald-500/20' },
  forensics:  { bg: 'bg-violet-950/60', border: 'border-violet-500/40',  text: 'text-violet-300',  glow: 'shadow-violet-500/20' },
  hardening:  { bg: 'bg-amber-950/60',  border: 'border-amber-500/40',   text: 'text-amber-300',   glow: 'shadow-amber-500/20' },
}

const STATUS_LABELS: Record<MissionStatus, { label: string; color: string; icon: string }> = {
  completed: { label: 'COMPLETADO', color: 'text-emerald-400', icon: '✓' },
  available: { label: 'DISPONIBLE', color: 'text-cyan-400',    icon: '▸' },
  locked:    { label: 'BLOQUEADO',  color: 'text-slate-500',   icon: '🔒' },
  override:  { label: 'ACCESO MANUAL', color: 'text-amber-400', icon: '⚡' },
}

const TAG_STYLES: Record<string, string> = {
  CONECTADO: 'text-emerald-400',
  INFO:      'text-cyan-400',
  WARNING:   'text-amber-400',
  ERROR:     'text-red-400',
  SYSTEM:    'text-violet-400',
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function readModuleScore(id: number): ModuleScore | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`cg_2026_module${id}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      maxScore: typeof parsed.maxScore === 'number' ? parsed.maxScore : 0,
      currentActivityIndex: typeof parsed.currentActivityIndex === 'number' ? parsed.currentActivityIndex : 0,
      categoryScores: (typeof parsed.categoryScores === 'object' && parsed.categoryScores !== null
        ? parsed.categoryScores as Record<string, number>
        : {}),
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : 0,
    }
  } catch {
    return null
  }
}

function computeProgressPct(score: ModuleScore | null, totalActivities: number): number {
  if (!score || score.maxScore === 0) return 0
  const activityPct = Math.min(score.currentActivityIndex / totalActivities, 1)
  const scorePct = Math.min(score.score / score.maxScore, 1)
  return Math.round(Math.max(activityPct, scorePct) * 100)
}

function getMissionStatus(
  id: number,
  scores: (ModuleScore | null)[],
  override: boolean,
): MissionStatus {
  if (override) return 'override'
  if (id === 0) {
    const s = scores[0]
    return s && s.score > 0 ? 'completed' : 'available'
  }
  // Available if previous module completed or override
  const prev = scores[id - 1]
  if (prev && prev.score > 0) return 'available'
  // Check if any progress exists
  const current = scores[id]
  if (current && current.currentActivityIndex > 0) return 'available'
  return 'locked'
}

function buildMissions(scores: (ModuleScore | null)[], override: boolean): Mission[] {
  return MODULE_DEFS.map((def) => {
    const score = scores[def.id]
    return {
      id: def.id,
      slug: def.slug,
      codeName: def.codeName,
      title: def.title,
      description: def.description,
      tier: def.tier,
      emoji: def.emoji,
      totalActivities: def.totalActivities,
      status: getMissionStatus(def.id, scores, override),
      progressPct: computeProgressPct(score, def.totalActivities),
      score: score?.score ?? 0,
      maxScore: score?.maxScore ?? 0,
    }
  })
}

function getOperatorProfile(scores: (ModuleScore | null)[]): OperatorProfile {
  let totalEarned = 0
  let totalPossible = 0
  let completedCount = 0

  for (let i = 1; i < scores.length; i++) {
    const s = scores[i]
    if (s) {
      totalEarned += s.score
      totalPossible += s.maxScore
      if (s.score > 0) completedCount++
    }
  }

  const overallPct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0
  const level = completedCount + 1
  const ranks = ['Operador Junior', 'Analista de Amenazas', 'Cazador de Phishing', 'Cripto-Defensor', 'Guardián de Código', 'Operador Elite']

  return {
    displayName: 'Operador de Ciberdefensa',
    level,
    rank: ranks[Math.min(level, ranks.length - 1)],
    overallShieldPct: overallPct,
  }
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function MissionCard({
  mission,
  onHover,
  onClick,
}: {
  mission: Mission
  onHover: () => void
  onClick: () => void
}) {
  const tier = TIER_COLORS[mission.tier]
  const status = STATUS_LABELS[mission.status]
  const isLocked = mission.status === 'locked'

  return (
    <motion.button
      type="button"
      disabled={isLocked}
      onMouseEnter={onHover}
      onClick={onClick}
      whileHover={isLocked ? {} : { y: -4, scale: 1.02 }}
      whileTap={isLocked ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        relative group text-left w-full rounded-xl border p-5
        transition-all duration-300 min-h-[44px]
        ${tier.bg} ${tier.border}
        ${isLocked
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-lg hover:shadow-' + mission.tier + '-500/30 hover:border-' + mission.tier + '-400/60'
        }
      `}
      style={
        !isLocked
          ? undefined
          : undefined
      }
    >
      {/* Neon glow on hover */}
      {!isLocked && (
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `0 0 20px 2px var(--tw-shadow-color, rgba(6,182,212,0.15))`,
          }}
        />
      )}

      {/* Header: emoji + status badge */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl" role="img" aria-label={mission.codeName}>
          {mission.emoji}
        </span>
        <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${status.color}`}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Code name */}
      <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
        {mission.codeName}
      </p>

      {/* Title */}
      <h3 className="text-base font-bold text-white mb-2 leading-tight">
        {mission.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-2">
        {mission.description}
      </p>

      {/* Progress bar (HP bar style) */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Escudo del Módulo</span>
          <span className={`text-xs font-bold font-mono ${tier.text}`}>
            {mission.progressPct}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              mission.progressPct >= 80
                ? 'bg-emerald-500'
                : mission.progressPct >= 40
                  ? 'bg-cyan-500'
                  : mission.progressPct > 0
                    ? 'bg-amber-500'
                    : 'bg-slate-700'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${mission.progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        {mission.score > 0 && (
          <p className="text-[10px] font-mono text-slate-600 mt-1">
            {mission.score}/{mission.maxScore} pts
          </p>
        )}
      </div>
    </motion.button>
  )
}

function TerminalPanel({
  lines,
  visibleCount,
  operator,
  overrideMode,
  onToggleOverride,
}: {
  lines: ConsoleLine[]
  visibleCount: number
  operator: OperatorProfile
  overrideMode: boolean
  onToggleOverride: () => void
}) {
  return (
    <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-6 flex flex-col gap-5 h-full">
      {/* Avatar holográfico */}
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🧑‍💻</span>
          {/* Rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-cyan-400/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{operator.displayName}</p>
          <p className="text-[11px] font-mono text-cyan-400">Nivel {operator.level} — {operator.rank}</p>
        </div>
      </div>

      {/* Consola de diagnóstico */}
      <div className="bg-slate-900/80 rounded-lg border border-slate-700/50 p-4 flex-1 min-h-[200px] overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Terminal de Diagnóstico
          </span>
        </div>
        <div className="space-y-1.5">
          <AnimatePresence>
            {lines.slice(0, visibleCount).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="font-mono text-xs leading-relaxed"
              >
                <span className="text-slate-600">[</span>
                <span className={TAG_STYLES[line.tag] ?? 'text-slate-400'}>{line.tag}</span>
                <span className="text-slate-600">]</span>{' '}
                <span className="text-slate-300">{line.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {visibleCount < lines.length && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="inline-block w-2 h-3.5 bg-cyan-400/70"
            />
          )}
        </div>
      </div>

      {/* Shield Gauge global */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Blindaje Total
          </span>
          <span className={`text-lg font-black font-mono ${
            operator.overallShieldPct >= 80
              ? 'text-emerald-400'
              : operator.overallShieldPct >= 40
                ? 'text-cyan-400'
                : 'text-slate-400'
          }`}>
            {operator.overallShieldPct}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <motion.div
            className={`h-full rounded-full ${
              operator.overallShieldPct >= 80
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : operator.overallShieldPct >= 40
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                  : 'bg-gradient-to-r from-slate-600 to-slate-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${operator.overallShieldPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
          />
        </div>
      </div>

      {/* Override toggle */}
      <button
        type="button"
        onClick={onToggleOverride}
        className={`
          w-full py-3 px-4 rounded-lg border font-mono text-xs font-bold uppercase tracking-widest
          transition-all duration-200 min-h-[44px]
          ${overrideMode
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
            : 'bg-slate-800/60 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
          }
        `}
      >
        {overrideMode ? '⚡ MODO OVERRIDE ACTIVO' : '🔒 Activar Acceso Manual'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function Home() {
  const { playHover, playSuccess } = useAudioSynth()

  const [overrideMode, setOverrideMode] = useState(false)
  const [scores, setScores] = useState<(ModuleScore | null)[]>(() => [
    null, null, null, null, null,
  ])
  const [consoleVisible, setConsoleVisible] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Load localStorage scores after mount
  useEffect(() => {
    setMounted(true)
    const loaded: (ModuleScore | null)[] = []
    for (let i = 0; i < 5; i++) {
      loaded.push(readModuleScore(i))
    }
    setScores(loaded)
  }, [])

  // Cascade console lines
  useEffect(() => {
    if (!mounted) return
    const timers: ReturnType<typeof setTimeout>[] = []
    CONSOLE_LINES.forEach((line, i) => {
      const t = setTimeout(() => setConsoleVisible(i + 1), line.delayMs)
      timers.push(t)
    })
    return () => timers.forEach(clearTimeout)
  }, [mounted])

  const missions = useMemo(() => buildMissions(scores, overrideMode), [scores, overrideMode])
  const operator = useMemo(() => getOperatorProfile(scores), [scores])

  const handleCardHover = useCallback(() => { playHover() }, [playHover])
  const handleOverrideToggle = useCallback(() => {
    setOverrideMode((prev) => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* CRT Power-on wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, filter: 'brightness(1.8)' }}
        animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-6xl mx-auto w-full"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 text-center lg:text-left"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            🛡️ CyberGuardians
          </h1>
          <p className="text-sm font-mono text-cyan-400/70 mt-1 uppercase tracking-widest">
            Central de Operaciones — Consola de Selección de Misiones
          </p>
        </motion.header>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: Panel de Selección de Misiones */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-8"
            aria-label="Selección de misiones"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map((m) => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  onHover={handleCardHover}
                  onClick={() => {
                    if (m.status === 'locked') return
                    playSuccess()
                    // Navigate via Next.js Link behavior — trigger programmatically
                    navigateTo(`/${m.slug}`)
                  }}
                />
              ))}
            </div>
          </motion.section>

          {/* RIGHT: Terminal de Estado de Operador */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="lg:col-span-4"
            aria-label="Estado del operador"
          >
            <TerminalPanel
              lines={CONSOLE_LINES}
              visibleCount={consoleVisible}
              operator={operator}
              overrideMode={overrideMode}
              onToggleOverride={handleOverrideToggle}
            />
          </motion.aside>
        </div>
      </motion.div>
    </div>
  )
}
