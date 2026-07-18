'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Eye, Crosshair, ScanEye, Lock,
  CheckCircle2, Play, Zap, User,
} from 'lucide-react'
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
  totalActivities: number
}> = [
  {
    id: 0,
    slug: 'modulo0',
    codeName: 'Fase de Inducción',
    title: 'Cyber-Diagnóstico',
    description: 'Introducción y diagnóstico inicial de tu nivel de ciberseguridad.',
    tier: 'diagnostic',
    totalActivities: 5,
  },
  {
    id: 1,
    slug: 'modulo1',
    codeName: 'Misión: Shadow Protocol',
    title: 'Privacidad y Huella Digital',
    description: 'Protege tu identidad y rastros digitales en la red.',
    tier: 'recon',
    totalActivities: 4,
  },
  {
    id: 2,
    slug: 'modulo2',
    codeName: 'Misión: Phish Hunter',
    title: 'Ingeniería Social e Identidades',
    description: 'Detecta y neutraliza campañas de phishing y suplantación.',
    tier: 'defense',
    totalActivities: 4,
  },
  {
    id: 3,
    slug: 'modulo3',
    codeName: 'Misión: CyberSentry',
    title: 'Escudo contra Engaños y Mafias Digitales',
    description: 'Defiende contra deepfakes, ransomware y engaños avanzados.',
    tier: 'forensics',
    totalActivities: 4,
  },
  {
    id: 4,
    slug: 'modulo4',
    codeName: 'Misión: CriptoDefensores',
    title: 'Criptografía y Hardening de Sistemas',
    description: 'Refuerza sistemas con criptografía y técnicas de hardening.',
    tier: 'hardening',
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

const TIER_ICONS: Record<ModuleTier, React.ReactNode> = {
  diagnostic: <Shield className="w-5 h-5" />,
  recon:      <Eye className="w-5 h-5" />,
  defense:    <Crosshair className="w-5 h-5" />,
  forensics:  <ScanEye className="w-5 h-5" />,
  hardening:  <Lock className="w-5 h-5" />,
}

const TIER_COLORS: Record<ModuleTier, { card: string; icon: string; bar: string }> = {
  diagnostic: { card: 'border-white/10 hover:border-white/20',  icon: 'text-slate-300',   bar: 'bg-slate-400' },
  recon:      { card: 'border-neon-cyan/20 hover:border-neon-cyan/40',    icon: 'text-neon-cyan',    bar: 'bg-neon-cyan' },
  defense:    { card: 'border-neon-emerald/20 hover:border-neon-emerald/40', icon: 'text-neon-emerald', bar: 'bg-neon-emerald' },
  forensics:  { card: 'border-neon-magenta/20 hover:border-neon-magenta/40', icon: 'text-neon-magenta', bar: 'bg-neon-magenta' },
  hardening:  { card: 'border-neon-amber/20 hover:border-neon-amber/40',   icon: 'text-neon-amber',   bar: 'bg-neon-amber' },
}

const STATUS_LABELS: Record<MissionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  completed: { label: 'COMPLETADO', color: 'text-neon-emerald', icon: <CheckCircle2 className="w-3 h-3" /> },
  available: { label: 'DISPONIBLE', color: 'text-neon-cyan',    icon: <Play className="w-3 h-3" /> },
  locked:    { label: 'BLOQUEADO',  color: 'text-slate-500',    icon: <Lock className="w-3 h-3" /> },
  override:  { label: 'ACCESO MANUAL', color: 'text-neon-amber', icon: <Zap className="w-3 h-3" /> },
}

const TAG_STYLES: Record<string, string> = {
  CONECTADO: 'text-neon-emerald',
  INFO:      'text-neon-cyan',
  WARNING:   'text-neon-amber',
  ERROR:     'text-neon-rose',
  SYSTEM:    'text-neon-magenta',
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
  const prev = scores[id - 1]
  if (prev && prev.score > 0) return 'available'
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
        glass-card transition-all duration-300 min-h-[44px]
        ${tier.card}
        ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Header: icon + status badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-white/5 ${tier.icon}`}>
          {TIER_ICONS[mission.tier]}
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest uppercase ${status.color}`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Code name */}
      <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
        {mission.codeName}
      </p>

      {/* Title */}
      <h3 className="text-base font-bold text-white mb-2 leading-tight font-display">
        {mission.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-2">
        {mission.description}
      </p>

      {/* Progress bar */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Escudo del Módulo</span>
          <span className={`text-xs font-bold font-mono ${tier.icon}`}>
            {mission.progressPct}%
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${tier.bar}`}
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
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-5 h-full">
      {/* Avatar holográfico */}
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/30 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-neon-cyan" />
          {/* Rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-neon-cyan/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate font-display">{operator.displayName}</p>
          <p className="text-[11px] font-mono text-neon-cyan">Nivel {operator.level} — {operator.rank}</p>
        </div>
      </div>

      {/* Consola de diagnóstico */}
      <div className="bg-void/60 rounded-lg border border-white/5 p-4 flex-1 min-h-[200px] overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-neon-emerald animate-pulse" />
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
              className="inline-block w-2 h-3.5 bg-neon-cyan/70"
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
              ? 'text-neon-emerald'
              : operator.overallShieldPct >= 40
                ? 'text-neon-cyan'
                : 'text-slate-400'
          }`}>
            {operator.overallShieldPct}%
          </span>
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className={`h-full rounded-full ${
              operator.overallShieldPct >= 80
                ? 'bg-gradient-to-r from-neon-emerald to-neon-cyan'
                : operator.overallShieldPct >= 40
                  ? 'bg-gradient-to-r from-neon-cyan to-neon-magenta'
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
            ? 'bg-neon-amber/20 border-neon-amber/50 text-neon-amber hover:bg-neon-amber/30'
            : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
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
    <div className="min-h-screen bg-void aurora-bg p-6 lg:p-8">
      {/* CRT Power-on wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, filter: 'brightness(1.8)' }}
        animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-6xl mx-auto w-full relative z-10"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 text-center lg:text-left"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
            <span className="text-neon-cyan neon-text">Cyber</span>
            <span className="text-white">Guardians</span>
          </h1>
          <p className="text-sm font-mono text-neon-magenta/70 mt-1 uppercase tracking-widest">
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
