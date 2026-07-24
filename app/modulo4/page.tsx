'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import WelcomeScreen from '@/components/WelcomeScreen'
import GameProgress from '@/components/GameProgress'
import ResultsScreen from '@/components/ResultsScreen'
import GraduationDiploma from '@/components/GraduationDiploma'
import BadgesGrid from '@/components/BadgesGrid'
import { CodeDefuseSandbox } from '@/components/module4/CodeDefuseSandbox'
import { MicroActivities } from '@/components/module4/MicroActivities'
import { Module4Category, ALL_MODULE4_CATEGORIES, GameProgressModule4 } from '@/types/module4'
import module4Data from '@/data/module4Data.json'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import type { Modulo4Data } from '@/types/module4'
import { useMIA } from '@/hooks/useMIA'
import { MEDIATOR_ENABLED } from '@/lib/featureFlags'
import { useEducationalMediator } from '@/hooks/useEducationalMediator'
import { EducationalPanel } from '@/components/mediator'
import DebriefDialog from '@/components/mediator/DebriefDialog'
import { DEFAULT_DEBRIEF_PROMPTS } from '@/data/debriefPrompts'
import type { EducationalLayer } from '@/types/educational'

const typedModule4Data = module4Data as Modulo4Data

const moduloForResults = {
  id: 'module4',
  titulo: typedModule4Data.modulo.nombre,
  subtitulo: typedModule4Data.modulo.descripcion,
  descripcion: typedModule4Data.modulo.descripcion,
  umbralAprobacion: typedModule4Data.modulo.umbralAprobacion,
  tiempoEstimado: typedModule4Data.modulo.tiempoEstimado,
  totalPuntosPosibles: 200,
  icono: typedModule4Data.modulo.icono,
}

const STORAGE_KEY = STORAGE_KEYS.MODULE4
const BADGES_KEY = STORAGE_KEYS.BADGES
const STALE_MS = 24 * 60 * 60 * 1000

type GamePhase = 'WELCOME' | 'ACTIVITIES' | 'RESULTS' | 'GRADUATION'

const ACTIVITIES = [
  { key: 'code-defuse', component: 'code-defuse' as const },
  { key: 'sanitization', component: 'sanitization' as const },
  { key: 'auth', component: 'auth' as const },
  { key: 'defense', component: 'defense' as const },
  { key: 'micro', component: 'micro' as const },
]

function loadProgress(): GameProgressModule4 | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    if (
      typeof parsed.currentActivityIndex !== 'number' ||
      typeof parsed.score !== 'number' ||
      !parsed.categoryScores ||
      typeof parsed.timestamp !== 'number'
    ) {
      return null
    }
    if (Date.now() - parsed.timestamp > STALE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed as GameProgressModule4
  } catch {
    return null
  }
}

function saveProgress(progress: GameProgressModule4) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // localStorage unavailable
  }
}

function clearProgress() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

function hashScore(score: number): string {
  return btoa(score.toString()).slice(0, 8)
}

function readModuleScores(): Record<string, number> {
  const scores: Record<string, number> = {}
  const moduleMap: Record<string, string> = {
    module0: STORAGE_KEYS.MODULE0,
    module1: STORAGE_KEYS.MODULE1,
    module2: STORAGE_KEYS.MODULE2,
    module3: STORAGE_KEYS.MODULE3,
    module4: STORAGE_KEYS.MODULE4,
  }
  for (const [mod, key] of Object.entries(moduleMap)) {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) continue
      const parsed = JSON.parse(stored)
      // Handle both field names: score (modules 1-4) and totalScore (module 0)
      const score = typeof parsed.score === 'number' ? parsed.score :
                    typeof parsed.totalScore === 'number' ? parsed.totalScore : null
      const maxScore = typeof parsed.maxScore === 'number' ? parsed.maxScore : 100
      if (score !== null && maxScore > 0) {
        scores[mod] = Math.round((score / maxScore) * 100)
      }
    } catch {
      // invalid data, skip
    }
  }
  return scores
}

function updateUnlockedBadges(currentScores: Record<string, number>): string[] {
  const badgeMap: Record<string, string> = {
    module0: 'badge-0',
    module1: 'badge-1',
    module2: 'badge-2',
    module3: 'badge-3',
    module4: 'badge-4',
  }

  let existing: string[] = []
  try {
    const stored = localStorage.getItem(BADGES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) existing = parsed
    }
  } catch {
    // ignore
  }

  const unlocked = new Set(existing)
  for (const [mod, score] of Object.entries(currentScores)) {
    if (score >= 70 && badgeMap[mod]) {
      unlocked.add(badgeMap[mod])
    }
  }

  const result = Array.from(unlocked)
  try {
    localStorage.setItem(BADGES_KEY, JSON.stringify(result))
  } catch {
    // ignore
  }

  return result
}

export default function Modulo4Page() {
  const [savedProgress] = useState(() => loadProgress())
  const { triggerMIA } = useMIA()
  const mediator = useEducationalMediator()

  const [gamePhase, setGamePhase] = useState<GamePhase>(
    savedProgress ? 'ACTIVITIES' : 'WELCOME'
  )
  const [currentActivityIndex, setCurrentActivityIndex] = useState(
    savedProgress?.currentActivityIndex ?? 0
  )
  const [score, setScore] = useState(savedProgress?.score ?? 0)
  const [maxScore] = useState(200)
  const [categoryScores, setCategoryScores] = useState<Record<Module4Category, number>>(() => {
    const base = Object.fromEntries(
      ALL_MODULE4_CATEGORIES.map((k) => [k, 0])
    ) as Record<Module4Category, number>
    if (savedProgress?.categoryScores) {
      for (const [key, val] of Object.entries(savedProgress.categoryScores)) {
        if (key in base) base[key as Module4Category] = val
      }
    }
    return base
  })
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
  const [moduleScores, setModuleScores] = useState<Record<string, number>>({})

  const handleStart = useCallback(() => {
    setGamePhase('ACTIVITIES')
    setCurrentActivityIndex(0)
    setScore(0)
    setCategoryScores(
      Object.fromEntries(ALL_MODULE4_CATEGORIES.map((k) => [k, 0])) as Record<Module4Category, number>
    )
  }, [])

  const handleActivityScore = useCallback((points: number, category: Module4Category) => {
    if (MEDIATOR_ENABLED && points === 0) {
      mediator.triggerMediator('onError', typedModule4Data.modulo as unknown as EducationalLayer)
    }
    setScore((prev) => {
      const next = prev + points
      setCategoryScores((prevCat) => {
        const updated = category
          ? { ...prevCat, [category]: (prevCat[category] || 0) + points }
          : prevCat
        saveProgress({
          currentActivityIndex,
          score: next,
          categoryScores: updated,
          timestamp: Date.now(),
        })
        return updated
      })
      return next
    })
  }, [currentActivityIndex])

  const handleActivityComplete = useCallback(() => {
    if (currentActivityIndex + 1 < ACTIVITIES.length) {
      setCurrentActivityIndex((prev) => prev + 1)
    } else {
      if (MEDIATOR_ENABLED) {
        mediator.triggerMediator('onModuleComplete', typedModule4Data.modulo as unknown as EducationalLayer)
      }
      setGamePhase('RESULTS')
    }
  }, [currentActivityIndex, mediator])

  useEffect(() => {
    if (gamePhase === 'RESULTS') clearProgress()
  }, [gamePhase])

  const handleRetry = useCallback(() => {
    clearProgress()
    setGamePhase('WELCOME')
    setCurrentActivityIndex(0)
    setScore(0)
    setCategoryScores(
      Object.fromEntries(ALL_MODULE4_CATEGORIES.map((k) => [k, 0])) as Record<Module4Category, number>
    )
  }, [])

  const handleContinue = useCallback(() => {
    const scores = readModuleScores()
    setModuleScores(scores)
    const badges = updateUnlockedBadges(scores)
    setUnlockedBadges(badges)
    // Compute accumulated percentage across all modules (scores are already 0-100 percentages)
    const moduleValues = Object.values(scores)
    const accumulated = moduleValues.length > 0
      ? Math.round(moduleValues.reduce((a, b) => a + b, 0) / moduleValues.length)
      : 0
    setScore(accumulated)
    setGamePhase('GRADUATION')
  }, [score, maxScore])

  const renderCurrentActivity = () => {
    const activity = ACTIVITIES[currentActivityIndex]
    if (!activity) return null

    const onScore = (points: number, category: Module4Category) =>
      handleActivityScore(points, category)
    const onComplete = handleActivityComplete

    switch (activity.component) {
      case 'code-defuse':
        return (
          <CodeDefuseSandbox
            challenges={typedModule4Data.codeChallenges}
            onScore={(p) => onScore(p, 'vulnerabilidades')}
            onComplete={onComplete}
          />
        )
      case 'sanitization':
        return (
          <CodeDefuseSandbox
            challenges={typedModule4Data.codeChallenges.slice(0, 3)}
            onScore={(p) => onScore(p, 'sanitizacion')}
            onComplete={onComplete}
          />
        )
      case 'auth':
        return (
          <CodeDefuseSandbox
            challenges={typedModule4Data.codeChallenges.slice(2, 5)}
            onScore={(p) => onScore(p, 'autenticacion')}
            onComplete={onComplete}
          />
        )
      case 'defense':
        return (
          <CodeDefuseSandbox
            challenges={typedModule4Data.codeChallenges.slice(4, 6)}
            onScore={(p) => onScore(p, 'defensa-activa')}
            onComplete={onComplete}
          />
        )
      case 'micro':
        return (
          <MicroActivities
            actividades={typedModule4Data.microActividades}
            onScore={(p) => onScore(p, 'micro-actividades')}
            onComplete={onComplete}
            onMIAEmotion={triggerMIA}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-void aurora-bg">
      <AnimatePresence mode="wait">
        {gamePhase === 'WELCOME' && (
          <WelcomeScreen
            key="welcome"
            onStart={handleStart}
            moduleTitle="Tu Código, Tu Escudo"
            moduleSubtitle="Aprende a escribir código seguro"
            moduleDescription="Detecta vulnerabilidades, sanitiza entradas, implementa autenticación segura y aplica patrones defensivos"
            stats="5 actividades · 15-20 min · Umbral: 70%"
            moduleNumber={4}
          />
        )}

        {gamePhase === 'ACTIVITIES' && (
          <div key="activities" className="min-h-screen flex flex-col items-center pt-6 pb-12">
            <GameProgress
              currentIndex={currentActivityIndex}
              total={ACTIVITIES.length}
              score={score}
              maxScore={maxScore}
              categorias={typedModule4Data.categorias}
              categoryScores={categoryScores}
            />
            <div className="flex-1 flex items-center w-full">
              {renderCurrentActivity()}
            </div>
            {MEDIATOR_ENABLED && (
              <EducationalPanel
                state={mediator.state}
                educationalLayer={mediator.currentLayer ?? undefined}
                onDismiss={mediator.dismissMediator}
              />
            )}
          </div>
        )}

        {gamePhase === 'RESULTS' && (
          <div key="results">
            <ResultsScreen
              score={score}
              maxScore={maxScore}
              categoryScores={categoryScores}
              categorias={typedModule4Data.categorias}
              modulo={moduloForResults}
              onRetry={handleRetry}
              onContinue={handleContinue}
            />
            {MEDIATOR_ENABLED && mediator.state === 'onMetaReflection' && (
              <DebriefDialog
                prompts={DEFAULT_DEBRIEF_PROMPTS}
                moduleName="Módulo 4"
                onComplete={(responses: Record<string, unknown>) => {
                  mediator.completeDebrief()
                  void responses
                }}
                onSkip={mediator.dismissMediator}
              />
            )}
          </div>
        )}

        {gamePhase === 'GRADUATION' && (
          <div key="graduation" className="min-h-screen bg-void aurora-bg">
            <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-3xl font-bold text-center text-white mb-2">🎓 ¡Graduación!</h2>
                <p className="text-center text-slate-400">Has completado CyberGuardians</p>
              </motion.div>

              <BadgesGrid unlockedBadges={unlockedBadges} />

              <GraduationDiploma
                totalScore={score}
                moduleScores={moduleScores}
                completionDate={new Date().toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                unlockedBadges={unlockedBadges}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
