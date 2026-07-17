'use client'

/**
 * CookieSweeper — "Destructor de Rastreadores"
 * Module 1 minigame: intercept tracking cookies before they breach the privacy shield.
 *
 * @module components/module1/CookieSweeper
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHUD } from '@/components/HUDProvider'
import useAudioSynth from '@/hooks/useAudioSynth'
import type {
  FallingCookie,
  ShieldPaddle,
  CookieSweeperState,
  CookieSweeperConfig,
  CookieKind,
} from '@/types/module1'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GAME_HEIGHT = 500
const HP_BAR_HEIGHT = 28
const PADDLE_Y = GAME_HEIGHT - 50
const COOKIE_RADIUS = 14

const DEFAULT_CONFIG: CookieSweeperConfig = {
  cookiesPerWave: 8,
  baseSpeed: 1.5,
  damagePerLeak: 8,
  xpPerDestroy: 15,
  paddleWidth: 120,
  tickMs: 16, // ~60fps
}

const TOTAL_WAVES = 5

const COOKIE_META: Record<CookieKind, { color: string; glow: string; icon: string; label: string }> = {
  tracking:    { color: '#ef4444', glow: '0 0 12px #ef4444', icon: '💀', label: 'Cookie de Rastreo' },
  telemetry:   { color: '#f59e0b', glow: '0 0 12px #f59e0b', icon: '📡', label: 'Script de Telemetría' },
  pixel:       { color: '#a855f7', glow: '0 0 12px #a855f7', icon: '👁', label: 'Píxel de Rastreo' },
  fingerprint: { color: '#06b6d4', glow: '0 0 12px #06b6d4', icon: '🔒', label: 'Fingerprinter' },
}

const COOKIE_KINDS: CookieKind[] = ['tracking', 'telemetry', 'pixel', 'fingerprint']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let nextId = 0
function uid(): string {
  return `ck-${++nextId}`
}

function randomKind(): CookieKind {
  return COOKIE_KINDS[Math.floor(Math.random() * COOKIE_KINDS.length)]
}

function spawnCookie(speed: number, containerWidth: number): FallingCookie {
  const kind = randomKind()
  const meta = COOKIE_META[kind]
  return {
    id: uid(),
    kind,
    label: meta.label,
    x: Math.random() * (containerWidth - 40) + 20,
    y: -COOKIE_RADIUS * 2,
    speed,
    destroyed: false,
    leaked: false,
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

// ---------------------------------------------------------------------------
// Particle burst helper
// ---------------------------------------------------------------------------

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CookieSweeperProps {
  onComplete: (score: number, xpEarned: number) => void
  config?: Partial<CookieSweeperConfig>
}

export default function CookieSweeper({ onComplete, config: configOverride }: CookieSweeperProps) {
  const cfg: CookieSweeperConfig = { ...DEFAULT_CONFIG, ...configOverride }

  const { damageShield, addXP } = useHUD()
  const { playClick, playSuccess, playAlarm, playFailureSiren, playSuccessArpeggio } = useAudioSynth()

  // -----------------------------------------------------------------------
  // Render state (updated each frame from the ref-based game loop)
  // -----------------------------------------------------------------------
  const [renderState, setRenderState] = useState<CookieSweeperState>({
    cookies: [],
    paddle: { x: 0, width: cfg.paddleWidth },
    shieldHP: 100,
    maxShieldHP: 100,
    destroyedCount: 0,
    leakedCount: 0,
    xpEarned: 0,
    isGameOver: false,
    isVictory: false,
    wave: 1,
    totalWaves: TOTAL_WAVES,
    difficulty: 'normal',
  })

  const [particles, setParticles] = useState<Particle[]>([])
  const [scorePopup, setScorePopup] = useState<{ id: string; x: number; y: number; amount: number } | null>(null)

  // -----------------------------------------------------------------------
  // Game loop state (refs — no re-renders)
  // -----------------------------------------------------------------------
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidthRef = useRef(600)

  const gameRef = useRef({
    cookies: [] as FallingCookie[],
    paddle: { x: 0, width: cfg.paddleWidth } as ShieldPaddle,
    shieldHP: 100,
    destroyedCount: 0,
    leakedCount: 0,
    xpEarned: 0,
    wave: 1,
    spawnedThisWave: 0,
    destroyedThisWave: 0,
    leakedThisWave: 0,
    keys: { left: false, right: false },
    mouseX: null as number | null,
    isGameOver: false,
    isVictory: false,
    rafId: 0,
    lastTick: 0,
    started: false,
  })

  // -----------------------------------------------------------------------
  // Initialise
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return
    containerWidthRef.current = containerRef.current.clientWidth
    const g = gameRef.current
    g.paddle = { x: containerWidthRef.current / 2, width: cfg.paddleWidth }
    g.started = true
    setRenderState((s) => ({ ...s, paddle: { ...g.paddle } }))
  }, [cfg.paddleWidth])

  // -----------------------------------------------------------------------
  // Keyboard controls
  // -----------------------------------------------------------------------
  useEffect(() => {
    const g = gameRef.current

    const onKeyDown = (e: KeyboardEvent) => {
      if (g.isGameOver) return
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        g.keys.left = true
        playClick()
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        g.keys.right = true
        playClick()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') g.keys.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') g.keys.right = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [playClick])

  // -----------------------------------------------------------------------
  // Mouse / touch controls
  // -----------------------------------------------------------------------
  useEffect(() => {
    const g = gameRef.current
    const container = containerRef.current
    if (!container) return

    const getRelativeX = (clientX: number) => {
      const rect = container.getBoundingClientRect()
      return clientX - rect.left
    }

    const onMouseMove = (e: MouseEvent) => {
      if (g.isGameOver) return
      g.mouseX = getRelativeX(e.clientX)
    }
    const onMouseLeave = () => { g.mouseX = null }
    const onTouchMove = (e: TouchEvent) => {
      if (g.isGameOver) return
      e.preventDefault()
      g.mouseX = getRelativeX(e.touches[0].clientX)
    }

    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
      container.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  // -----------------------------------------------------------------------
  // Resize observer
  // -----------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidthRef.current = entry.contentRect.width
      }
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // -----------------------------------------------------------------------
  // Game loop
  // -----------------------------------------------------------------------
  const tick = useCallback(
    (timestamp: number) => {
      const g = gameRef.current
      if (g.isGameOver) return

      // Frame pacing
      if (timestamp - g.lastTick < cfg.tickMs) {
        g.rafId = requestAnimationFrame(tick)
        return
      }
      g.lastTick = timestamp

      const W = containerWidthRef.current
      const speedScale = 1 + (g.wave - 1) * 0.18

      // -- Paddle movement --
      if (g.mouseX !== null) {
        g.paddle.x = clamp(g.mouseX, g.paddle.width / 2, W - g.paddle.width / 2)
      } else {
        const paddleSpeed = 8
        if (g.keys.left) g.paddle.x = clamp(g.paddle.x - paddleSpeed, g.paddle.width / 2, W - g.paddle.width / 2)
        if (g.keys.right) g.paddle.x = clamp(g.paddle.x + paddleSpeed, g.paddle.width / 2, W - g.paddle.width / 2)
      }

      // -- Spawn cookies --
      const needed = cfg.cookiesPerWave
      if (g.spawnedThisWave < needed) {
        const speed = cfg.baseSpeed * speedScale * (0.85 + Math.random() * 0.3)
        g.cookies.push(spawnCookie(speed, W))
        g.spawnedThisWave++
      }

      // -- Update cookies --
      for (const ck of g.cookies) {
        if (ck.destroyed || ck.leaked) continue

        ck.y += ck.speed

        // Collision with paddle
        const paddleLeft = g.paddle.x - g.paddle.width / 2
        const paddleRight = g.paddle.x + g.paddle.width / 2
        const paddleTop = PADDLE_Y - 8

        if (
          ck.y + COOKIE_RADIUS >= paddleTop &&
          ck.y - COOKIE_RADIUS <= paddleTop + 16 &&
          ck.x + COOKIE_RADIUS >= paddleLeft &&
          ck.x - COOKIE_RADIUS <= paddleRight
        ) {
          ck.destroyed = true
          g.destroyedCount++
          g.destroyedThisWave++
          g.xpEarned += cfg.xpPerDestroy
          addXP(cfg.xpPerDestroy)
          playSuccess()

          // Particles
          const meta = COOKIE_META[ck.kind]
          const newParticles: Particle[] = Array.from({ length: 6 }, (_, i) => ({
            id: `p-${Date.now()}-${i}`,
            x: ck.x,
            y: ck.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6 - 2,
            color: meta.color,
            life: 1,
          }))
          setParticles((prev) => [...prev, ...newParticles])

          // Score popup
          setScorePopup({ id: uid(), x: ck.x, y: ck.y, amount: cfg.xpPerDestroy })
          setTimeout(() => setScorePopup(null), 600)
          continue
        }

        // Leaked through
        if (ck.y - COOKIE_RADIUS > GAME_HEIGHT) {
          ck.leaked = true
          g.leakedCount++
          g.leakedThisWave++
          g.shieldHP = Math.max(0, g.shieldHP - cfg.damagePerLeak)
          damageShield(cfg.damagePerLeak)
          playAlarm()
        }
      }

      // -- Clean up finished cookies, but keep recently destroyed ones briefly for visual effect --
      g.cookies = g.cookies.filter((ck) => {
        if (ck.destroyed) return false // removed immediately (particles handle visual)
        if (ck.leaked) return false
        return true
      })

      // -- Wave completion check --
      const allSpawned = g.spawnedThisWave >= needed
      const allResolved = g.cookies.length === 0
      if (allSpawned && allResolved) {
        if (g.wave < TOTAL_WAVES) {
          g.wave++
          g.spawnedThisWave = 0
          g.destroyedThisWave = 0
          g.leakedThisWave = 0
        } else {
          // Victory!
          g.isGameOver = true
          g.isVictory = true
          playSuccessArpeggio()
        }
      }

      // -- Defeat check --
      if (g.shieldHP <= 0) {
        g.isGameOver = true
        g.isVictory = false
        playFailureSiren()
      }

      // -- Sync render state --
      setRenderState({
        cookies: g.cookies.map((c) => ({ ...c })),
        paddle: { ...g.paddle },
        shieldHP: g.shieldHP,
        maxShieldHP: 100,
        destroyedCount: g.destroyedCount,
        leakedCount: g.leakedCount,
        xpEarned: g.xpEarned,
        isGameOver: g.isGameOver,
        isVictory: g.isVictory,
        wave: g.wave,
        totalWaves: TOTAL_WAVES,
        difficulty: g.wave <= 2 ? 'normal' : g.wave <= 4 ? 'hard' : 'elite',
      })

      // -- Continue loop --
      if (!g.isGameOver) {
        g.rafId = requestAnimationFrame(tick)
      }
    },
    [cfg, addXP, playSuccess, playAlarm, playFailureSiren, playSuccessArpeggio, damageShield],
  )

  // Start game loop
  useEffect(() => {
    const g = gameRef.current
    if (!g.started) return
    g.rafId = requestAnimationFrame(tick)
    return () => {
      if (g.rafId) cancelAnimationFrame(g.rafId)
    }
  }, [tick])

  // -- Particle decay --
  useEffect(() => {
    if (particles.length === 0) return
    const timer = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.04 }))
          .filter((p) => p.life > 0),
      )
    }, 16)
    return () => clearInterval(timer)
  }, [particles.length > 0])

  // -- Game over effect --
  useEffect(() => {
    if (!renderState.isGameOver) return
    const finalScore = renderState.destroyedCount * cfg.xpPerDestroy
    // Persist results
    if (typeof window !== 'undefined') {
      try {
        const existing = localStorage.getItem('cg_2026_module1')
        const data: Record<string, unknown> = existing ? JSON.parse(existing) as Record<string, unknown> : {}
        data.cookieSweeper = {
          score: finalScore,
          xpEarned: renderState.xpEarned,
          destroyed: renderState.destroyedCount,
          leaked: renderState.leakedCount,
          wavesCompleted: renderState.wave,
          victory: renderState.isVictory,
        }
        localStorage.setItem('cg_2026_module1', JSON.stringify(data))
      } catch {
        // SSR or parse error — silently ignore
      }
    }
    // Delayed callback so player sees the overlay
    const timer = setTimeout(() => {
      onComplete(finalScore, renderState.xpEarned)
    }, 2500)
    return () => clearTimeout(timer)
  }, [renderState.isGameOver, renderState, cfg.xpPerDestroy, onComplete])

  // -----------------------------------------------------------------------
  // Derived values
  // -----------------------------------------------------------------------
  const hpPercent = (renderState.shieldHP / renderState.maxShieldHP) * 100
  const hpColor =
    hpPercent > 60 ? '#06b6d4' : hpPercent > 30 ? '#f59e0b' : '#ef4444'

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="relative w-full select-none" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
      {/* ---- Container ---- */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border border-cyan-900/40"
        style={{
          height: GAME_HEIGHT,
          background: '#0a0a1a',
          backgroundImage:
            'linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        {/* ---- Scanline overlay ---- */}
        <div
          className="pointer-events-none absolute inset-0 z-50"
          style={{
            background:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)',
          }}
        />

        {/* ---- HUD Bar (top) ---- */}
        <div className="absolute left-0 top-0 z-40 flex w-full items-center gap-3 px-3" style={{ height: HP_BAR_HEIGHT }}>
          {/* HP Bar */}
          <div className="relative flex-1">
            <div className="h-3 w-full rounded-full bg-slate-800/80 border border-slate-700/50 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${hpPercent}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(90deg, ${hpColor}, ${hpColor}cc)`,
                  boxShadow: `0 0 8px ${hpColor}80`,
                }}
              />
            </div>
            <span
              className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wider"
              style={{ color: hpColor, textShadow: `0 0 4px ${hpColor}` }}
            >
              PRIVACIDAD {renderState.shieldHP}/{renderState.maxShieldHP}
            </span>
          </div>

          {/* Wave indicator */}
          <div className="flex items-center gap-1.5 text-[11px] tracking-widest text-cyan-400/80">
            <span className="text-cyan-500/50">WAVE</span>
            <span className="font-bold text-cyan-300">{renderState.wave}</span>
            <span className="text-cyan-600">/</span>
            <span>{renderState.totalWaves}</span>
          </div>

          {/* XP counter */}
          <div className="flex items-center gap-1 text-[11px] tracking-wider text-amber-400">
            <span className="text-amber-500/60">XP</span>
            <span className="font-bold">{renderState.xpEarned}</span>
          </div>
        </div>

        {/* ---- Paddle / Shield ---- */}
        <motion.div
          className="absolute z-30"
          animate={{ x: renderState.paddle.x - renderState.paddle.width / 2 }}
          transition={{ type: 'tween', duration: 0.05, ease: 'linear' }}
          style={{
            top: PADDLE_Y - 8,
            width: renderState.paddle.width,
            height: 16,
            borderRadius: 8,
          }}
        >
          <div
            className="h-full w-full rounded-lg"
            style={{
              background: 'linear-gradient(180deg, #06b6d4, #0891b2)',
              boxShadow: '0 0 16px #06b6d480, 0 0 32px #06b6d420, inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          />
          {/* Paddle glow trail */}
          <div
            className="absolute inset-x-0 -bottom-1 h-1 rounded-full opacity-40"
            style={{ background: '#06b6d4', filter: 'blur(4px)' }}
          />
        </motion.div>

        {/* ---- Falling cookies ---- */}
        <AnimatePresence>
          {renderState.cookies.map((ck) => {
            const meta = COOKIE_META[ck.kind]
            return (
              <motion.div
                key={ck.id}
                className="absolute z-20 flex items-center justify-center"
                animate={{ top: ck.y - COOKIE_RADIUS, left: ck.x - COOKIE_RADIUS }}
                transition={{ type: 'tween', duration: 0.05, ease: 'linear' }}
                style={{ width: COOKIE_RADIUS * 2, height: COOKIE_RADIUS * 2 }}
              >
                <div
                  className="flex h-full w-full items-center justify-center rounded-full border text-sm"
                  style={{
                    background: `${meta.color}22`,
                    borderColor: `${meta.color}66`,
                    boxShadow: meta.glow,
                  }}
                >
                  <span className="text-xs leading-none">{meta.icon}</span>
                </div>
                {/* Bottom glow ring */}
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{ boxShadow: `0 0 20px ${meta.color}` }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* ---- Destruction particles ---- */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="pointer-events-none absolute z-30 h-1.5 w-1.5 rounded-full"
            style={{
              left: p.x,
              top: p.y,
              backgroundColor: p.color,
              opacity: p.life,
              boxShadow: `0 0 6px ${p.color}`,
              transform: `scale(${p.life})`,
            }}
          />
        ))}

        {/* ---- Score popup ---- */}
        <AnimatePresence>
          {scorePopup && (
            <motion.div
              key={scorePopup.id}
              className="pointer-events-none absolute z-40 text-sm font-bold text-amber-400"
              initial={{ opacity: 1, y: scorePopup.y, x: scorePopup.x }}
              animate={{ opacity: 0, y: scorePopup.y - 30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ textShadow: '0 0 8px #f59e0b' }}
            >
              +{scorePopup.amount} XP
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Bottom danger zone line ---- */}
        <div
          className="absolute left-0 z-10 w-full"
          style={{
            top: GAME_HEIGHT - 2,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #ef444433, transparent)',
          }}
        />

        {/* ---- Game Over overlay ---- */}
        <AnimatePresence>
          {renderState.isGameOver && (
            <motion.div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                background: renderState.isVictory
                  ? 'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, rgba(10,10,26,0.95) 100%)'
                  : 'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, rgba(10,10,26,0.95) 100%)',
              }}
            >
              {/* Title */}
              <motion.h2
                className="mb-2 text-3xl font-black tracking-widest uppercase"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{
                  color: renderState.isVictory ? '#06b6d4' : '#ef4444',
                  textShadow: renderState.isVictory
                    ? '0 0 20px #06b6d4, 0 0 40px #06b6d450'
                    : '0 0 20px #ef4444, 0 0 40px #ef444450',
                }}
              >
                {renderState.isVictory ? '✓ ESCUDO PROTÉGIDO' : '✗ ESCUDO COMPROMETIDO'}
              </motion.h2>

              <motion.p
                className="mb-6 text-sm tracking-wider text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {renderState.isVictory
                  ? 'Todos los rastreadores fueron neutralizados'
                  : 'Los rastreadores superaron tu defenses'}
              </motion.p>

              {/* Stats grid */}
              <motion.div
                className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-700/50 bg-slate-900/60 px-8 py-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <StatCell label="Destruidos" value={renderState.destroyedCount} color="#06b6d4" />
                <StatCell label="Filtrados" value={renderState.leakedCount} color="#ef4444" />
                <StatCell label="XP Total" value={renderState.xpEarned} color="#f59e0b" />
                <StatCell label="Oleadas" value={`${renderState.wave}/${renderState.totalWaves}`} color="#a855f7" />
              </motion.div>

              {/* Victory badge */}
              {renderState.isVictory && (
                <motion.div
                  className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs tracking-widest text-cyan-300 uppercase"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                >
                  ★ Misión Cumplida ★
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Bottom label ---- */}
      <div className="mt-2 flex items-center justify-between px-1">
        <span className="text-[10px] tracking-widest text-cyan-600/50 uppercase">
          ← → o arrastra para mover el escudo
        </span>
        <span className="text-[10px] tracking-widest text-slate-600">
          {renderState.destroyedCount} destruidos · {renderState.leakedCount} filtrados
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat cell sub-component
// ---------------------------------------------------------------------------

function StatCell({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] tracking-widest uppercase" style={{ color: `${color}88` }}>
        {label}
      </span>
      <span
        className="text-xl font-black"
        style={{ color, textShadow: `0 0 8px ${color}40` }}
      >
        {value}
      </span>
    </div>
  )
}
