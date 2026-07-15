'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import WelcomeScreen from '@/components/WelcomeScreen'
import GameProgress from '@/components/GameProgress'
import ResultsScreen from '@/components/ResultsScreen'
import { DeepfakeAnalyzer } from '@/components/module3/DeepfakeAnalyzer'
import { VishingCallSimulator } from '@/components/module3/VishingCallSimulator'
import { DesinformacionDetector } from '@/components/module3/DesinformacionDetector'
import { MicroActivities } from '@/components/module3/MicroActivities'
import { Module3Category, ALL_MODULE3_CATEGORIES, GameProgressModule3 } from '@/types/module3'
import { navigateTo } from '@/lib/navigation'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import module3Data from '@/data/module3Data.json'
import type { Modulo3Data } from '@/types/module3'

const typedModule3Data = module3Data as Modulo3Data

const moduloForResults = {
  id: 'module3',
  titulo: typedModule3Data.modulo.nombre,
  subtitulo: typedModule3Data.modulo.descripcion,
  descripcion: typedModule3Data.modulo.descripcion,
  umbralAprobacion: typedModule3Data.modulo.umbralAprobacion,
  tiempoEstimado: typedModule3Data.modulo.tiempoEstimado,
  totalPuntosPosibles: 200,
  icono: typedModule3Data.modulo.icono,
}

const STORAGE_KEY = STORAGE_KEYS.MODULE3
const STALE_MS = 24 * 60 * 60 * 1000

type GamePhase = 'WELCOME' | 'ACTIVITIES' | 'RESULTS'

const ACTIVITIES = [
  { key: 'deepfake', component: 'deepfake' as const },
  { key: 'vishing', component: 'vishing' as const },
  { key: 'desinformacion', component: 'desinformacion' as const },
  { key: 'defense', component: 'defense' as const },
  { key: 'dragdrop', component: 'dragdrop' as const },
  { key: 'micro', component: 'micro' as const },
]

function loadProgress(): GameProgressModule3 | null {
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
    return parsed as GameProgressModule3
  } catch {
    return null
  }
}

function saveProgress(progress: GameProgressModule3) {
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

export default function Modulo3Page() {
  const [savedProgress] = useState(() => loadProgress())

  const [gamePhase, setGamePhase] = useState<GamePhase>(
    savedProgress ? 'ACTIVITIES' : 'WELCOME'
  )
  const [currentActivityIndex, setCurrentActivityIndex] = useState(
    savedProgress?.currentActivityIndex ?? 0
  )
  const [score, setScore] = useState(savedProgress?.score ?? 0)
  const [maxScore] = useState(200)
  const [categoryScores, setCategoryScores] = useState<Record<Module3Category, number>>(() => {
    const base = Object.fromEntries(
      ALL_MODULE3_CATEGORIES.map((k) => [k, 0])
    ) as Record<Module3Category, number>
    if (savedProgress?.categoryScores) {
      for (const [key, val] of Object.entries(savedProgress.categoryScores)) {
        if (key in base) base[key as Module3Category] = val
      }
    }
    return base
  })
  const [isNavigating, setIsNavigating] = useState(false)

  const handleStart = useCallback(() => {
    setGamePhase('ACTIVITIES')
    setCurrentActivityIndex(0)
    setScore(0)
    setCategoryScores(
      Object.fromEntries(ALL_MODULE3_CATEGORIES.map((k) => [k, 0])) as Record<Module3Category, number>
    )
  }, [])

  const handleActivityScore = useCallback((points: number, category: Module3Category) => {
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
      setGamePhase('RESULTS')
    }
  }, [currentActivityIndex])

  useEffect(() => {
    if (gamePhase === 'RESULTS') clearProgress()
  }, [gamePhase])

  const handleRetry = useCallback(() => {
    clearProgress()
    setGamePhase('WELCOME')
    setCurrentActivityIndex(0)
    setScore(0)
    setCategoryScores(
      Object.fromEntries(ALL_MODULE3_CATEGORIES.map((k) => [k, 0])) as Record<Module3Category, number>
    )
  }, [])

  const handleContinue = useCallback(() => {
    setIsNavigating(true)
    navigateTo('/modulo4')
  }, [])

  const renderCurrentActivity = () => {
    const activity = ACTIVITIES[currentActivityIndex]
    if (!activity) return null

    const onScore = (points: number, category: Module3Category) =>
      handleActivityScore(points, category)
    const onComplete = handleActivityComplete

    switch (activity.component) {
      case 'deepfake':
        return (
          <DeepfakeAnalyzer
            cases={typedModule3Data.deepfakeCases}
            onScore={(p) => onScore(p, 'analisis-deepfake')}
            onComplete={onComplete}
          />
        )
      case 'vishing':
        return (
          <VishingCallSimulator
            scenarios={typedModule3Data.vishingScenarios}
            onScore={(p) => onScore(p, 'vishing-simulado')}
            onComplete={onComplete}
          />
        )
      case 'desinformacion':
        return (
          <DesinformacionDetector
            cases={typedModule3Data.desinformacionCases}
            onScore={(p) => onScore(p, 'desinformacion-ia')}
            onComplete={onComplete}
          />
        )
      case 'defense':
        return (
          <DeepfakeAnalyzer
            cases={typedModule3Data.deepfakeCases.slice(0, 3)}
            onScore={(p) => onScore(p, 'defensa-critica')}
            onComplete={onComplete}
          />
        )
      case 'dragdrop':
        return (
          <DesinformacionDetector
            cases={typedModule3Data.desinformacionCases.slice(0, 2)}
            onScore={(p) => onScore(p, 'desinformacion-ia')}
            onComplete={onComplete}
          />
        )
      case 'micro':
        return (
          <MicroActivities
            actividades={typedModule3Data.microActividades}
            onScore={(p) => onScore(p, 'micro-actividades')}
            onComplete={onComplete}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen gradient-bg">
      <AnimatePresence mode="wait">
        {gamePhase === 'WELCOME' && (
          <WelcomeScreen
            key="welcome"
            onStart={handleStart}
            moduleTitle="Deepfakes: No creas todo lo que ves"
            moduleSubtitle="Detecta contenido sintético generado por IA"
            moduleDescription="Identifica deepfakes de imagen, audio clonado, video manipulado y desinformación generada por IA"
            moduleIcon="🎭"
            stats="6 actividades · 15-20 min · Umbral: 70%"
            moduleNumber={3}
          />
        )}

        {gamePhase === 'ACTIVITIES' && (
          <div key="activities" className="min-h-screen flex flex-col items-center pt-6 pb-12">
            <GameProgress
              currentIndex={currentActivityIndex}
              total={ACTIVITIES.length}
              score={score}
              maxScore={maxScore}
              categorias={typedModule3Data.categorias}
              categoryScores={categoryScores}
            />
            <div className="flex-1 flex items-center w-full">
              {renderCurrentActivity()}
            </div>
          </div>
        )}

        {gamePhase === 'RESULTS' && (
          <div key="results">
            <ResultsScreen
              score={score}
              maxScore={maxScore}
              categoryScores={categoryScores}
              categorias={typedModule3Data.categorias}
              modulo={moduloForResults}
              onRetry={handleRetry}
              onContinue={handleContinue}
              isNavigating={isNavigating}
              continueLabel="Continuar al Módulo 4"
            />
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
