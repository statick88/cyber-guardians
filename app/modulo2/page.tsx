'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import WelcomeScreen from '@/components/WelcomeScreen'
import GameProgress from '@/components/GameProgress'
import ResultsScreen from '@/components/ResultsScreen'
import { PasswordStrengthSim } from '@/components/module2/PasswordStrengthSim'
import { MFASimulator } from '@/components/module2/MFASimulator'
import { SocialMediaAudit } from '@/components/module2/SocialMediaAudit'
import { IdentityTheftSimulator } from '@/components/module2/IdentityTheftSimulator'
import { DragDropDefense } from '@/components/module2/DragDropDefense'
import { navigateTo } from '@/lib/navigation'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { MicroActivities } from '@/components/module2/MicroActivities'
import { Module2Category, ALL_MODULE2_CATEGORIES, GameProgressModule2 } from '@/types/module2'
import module2Data from '@/data/module2Data.json'
import type { Modulo2Data } from '@/types/module2'

const typedModule2Data = module2Data as Modulo2Data

// Transform module2 modulo to match ResultsScreen expected shape
const moduloForResults = {
  id: 'module2',
  titulo: typedModule2Data.modulo.nombre,
  subtitulo: typedModule2Data.modulo.descripcion,
  descripcion: typedModule2Data.modulo.descripcion,
  umbralAprobacion: typedModule2Data.modulo.umbralAprobacion,
  tiempoEstimado: typedModule2Data.modulo.tiempoEstimado,
  totalPuntosPosibles: 200,
  icono: typedModule2Data.modulo.icono,
}

const STORAGE_KEY = STORAGE_KEYS.MODULE2
const STALE_MS = 24 * 60 * 60 * 1000 // 24 hours

type GamePhase = 'WELCOME' | 'ACTIVITIES' | 'RESULTS'

const ACTIVITIES = [
  { key: 'passwords', component: 'passwords' as const },
  { key: '2fa', component: '2fa' as const },
  { key: 'social', component: 'social' as const },
  { key: 'identity', component: 'identity' as const },
  { key: 'defense', component: 'defense' as const },
  { key: 'micro', component: 'micro' as const },
]

function loadProgress(): GameProgressModule2 | null {
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
    return parsed as GameProgressModule2
  } catch {
    return null
  }
}

function saveProgress(progress: GameProgressModule2) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // localStorage unavailable — silently continue
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

export default function Modulo2Page() {
  const [savedProgress] = useState(() => loadProgress())

  const [gamePhase, setGamePhase] = useState<GamePhase>(
    savedProgress ? 'ACTIVITIES' : 'WELCOME'
  )
  const [currentActivityIndex, setCurrentActivityIndex] = useState(
    savedProgress?.currentActivityIndex ?? 0
  )
  const [score, setScore] = useState(savedProgress?.score ?? 0)
  const [maxScore] = useState(200)
  const [categoryScores, setCategoryScores] = useState<Record<Module2Category, number>>(() => {
    const base = Object.fromEntries(
      ALL_MODULE2_CATEGORIES.map((k) => [k, 0])
    ) as Record<Module2Category, number>
    if (savedProgress?.categoryScores) {
      for (const [key, val] of Object.entries(savedProgress.categoryScores)) {
        if (key in base) base[key as Module2Category] = val
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
      Object.fromEntries(ALL_MODULE2_CATEGORIES.map((k) => [k, 0])) as Record<Module2Category, number>
    )
  }, [])

  const handleActivityScore = useCallback((points: number, category: Module2Category) => {
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
      Object.fromEntries(ALL_MODULE2_CATEGORIES.map((k) => [k, 0])) as Record<Module2Category, number>
    )
  }, [])

  const handleContinue = useCallback(() => {
    setIsNavigating(true)
    navigateTo('/modulo3')
  }, [])

  const renderCurrentActivity = () => {
    const activity = ACTIVITIES[currentActivityIndex]
    if (!activity) return null

    const onScore = (points: number, category: Module2Category) =>
      handleActivityScore(points, category)
    const onComplete = handleActivityComplete

    switch (activity.component) {
      case 'passwords':
        return (
          <PasswordStrengthSim
            onScore={(p) => onScore(p, 'boveda-contrasenas')}
            onComplete={onComplete}
          />
        )
      case '2fa':
        return (
          <MFASimulator
            onScore={(p) => onScore(p, 'autenticacion-2fa')}
            onComplete={onComplete}
          />
        )
      case 'social':
        return (
          <SocialMediaAudit
            perfiles={typedModule2Data.perfilesSociales}
            onScore={(p) => onScore(p, 'auditoria-redes-sociales')}
            onComplete={onComplete}
          />
        )
      case 'identity':
        return (
          <IdentityTheftSimulator
            escenarios={typedModule2Data.robosIdentidad}
            onScore={(p) => onScore(p, 'proteccion-identidad')}
            onComplete={onComplete}
          />
        )
      case 'defense':
        return (
          <DragDropDefense
            ejercicios={typedModule2Data.ejercicios}
            onScore={(p) => onScore(p, 'defensa-activa')}
            onComplete={onComplete}
          />
        )
      case 'micro':
        return (
          <MicroActivities
            actividades={typedModule2Data.microActividades}
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
            moduleTitle="Guardianes de Identidad"
            moduleSubtitle="Protege tu identidad digital"
            moduleDescription="Domina contraseñas, 2FA, privacidad en redes y defensa contra robo de identidad"
            moduleIcon="🛡️"
            stats="6 actividades · 15-20 min · Umbral: 70%"
            moduleNumber={2}
          />
        )}

        {gamePhase === 'ACTIVITIES' && (
          <div key="activities" className="min-h-screen flex flex-col items-center pt-6 pb-12">
            <GameProgress
              currentIndex={currentActivityIndex}
              total={ACTIVITIES.length}
              score={score}
              maxScore={maxScore}
              categorias={typedModule2Data.categorias}
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
              categorias={typedModule2Data.categorias}
              modulo={moduloForResults}
              onRetry={handleRetry}
              onContinue={handleContinue}
              isNavigating={isNavigating}
              continueLabel="Continuar al Módulo 3"
            />
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}