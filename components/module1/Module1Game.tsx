'use client'

import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import WelcomeScreen from '@/components/WelcomeScreen'
import GameProgress from '@/components/GameProgress'
import ResultsScreen from '@/components/ResultsScreen'
import { EmailAnalysis } from '@/components/module1/EmailAnalysis'
import { URLInspector } from '@/components/module1/URLInspector'
import { PhishingSimulator } from '@/components/module1/PhishingSimulator'
import { DigitalDefense } from '@/components/module1/DigitalDefense'
import { DragDropActivity } from '@/components/module1/DragDropActivity'
import { navigateTo } from '@/lib/navigation'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { MicroActivities } from '@/components/module1/MicroActivities'
import { Module1Category, ALL_MODULE1_CATEGORIES, GameProgressModule1 } from '@/types/module1'
import module1Data from '@/data/module1Data.json'
import type { ModuloData as Module1ModuloData } from '@/types/module1'
import { MEDATOR_ENABLED } from '@/lib/featureFlags'
import { GamePauseProvider } from '@/hooks/useGamePause'
import { useEducationalMediator } from '@/hooks/useEducationalMediator'
import { EducationalPanel } from '@/components/mediator'
import DebriefDialog from '@/components/mediator/DebriefDialog'
import { DEFAULT_DEBRIEF_PROMPTS } from '@/data/debriefPrompts'
import type { EducationalLayer } from '@/types/educational'

const typedModule1Data = module1Data as Module1ModuloData

const moduloForResults = {
  id: 'module1',
  titulo: typedModule1Data.modulo.nombre,
  subtitulo: typedModule1Data.modulo.descripcion,
  descripcion: typedModule1Data.modulo.descripcion,
  umbralAprobacion: typedModule1Data.modulo.umbralAprobacion,
  tiempoEstimado: typedModule1Data.modulo.tiempoEstimado,
  totalPuntosPosibles: 100,
  icono: typedModule1Data.modulo.icono,
}

const STORAGE_KEY = STORAGE_KEYS.MODULE1
const STALE_MS = 24 * 60 * 60 * 1000 // 24 hours

type GamePhase = 'WELCOME' | 'ACTIVITIES' | 'RESULTS'

const ACTIVITIES = [
  { key: 'email', component: 'email' as const },
  { key: 'url', component: 'url' as const },
  { key: 'simulator', component: 'simulator' as const },
  { key: 'defense', component: 'defense' as const },
  { key: 'dragdrop', component: 'dragdrop' as const },
  { key: 'micro', component: 'micro' as const },
]

function loadProgress(): GameProgressModule1 | null {
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
    return parsed as GameProgressModule1
  } catch {
    return null
  }
}

function saveProgress(progress: GameProgressModule1) {
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

function Module1GameContent() {
  const [savedProgress] = useState(() => loadProgress())
  const mediator = useEducationalMediator()

  const [gamePhase, setGamePhase] = useState<GamePhase>(
    savedProgress ? 'ACTIVITIES' : 'WELCOME'
  )
  const [currentActivityIndex, setCurrentActivityIndex] = useState(
    savedProgress?.currentActivityIndex ?? 0
  )
  const [score, setScore] = useState(savedProgress?.score ?? 0)
  const [maxScore] = useState(100)
  const [categoryScores, setCategoryScores] = useState<Record<Module1Category, number>>(() => {
    const base = Object.fromEntries(
      ALL_MODULE1_CATEGORIES.map(k => [k, 0])
    ) as Record<Module1Category, number>
    if (savedProgress?.categoryScores) {
      for (const [key, val] of Object.entries(savedProgress.categoryScores)) {
        if (key in base) base[key as Module1Category] = val
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
      Object.fromEntries(ALL_MODULE1_CATEGORIES.map(k => [k, 0])) as Record<Module1Category, number>
    )
  }, [])

  const handleActivityScore = useCallback((points: number, category: Module1Category) => {
    if (MEDATOR_ENABLED && points === 0) {
      mediator.triggerMediator('onError', typedModule1Data.modulo as unknown as EducationalLayer)
    }
    setScore(prev => {
      const next = prev + points
      setCategoryScores(prevCat => {
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
      setCurrentActivityIndex(prev => prev + 1)
    } else {
      if (MEDATOR_ENABLED) {
        mediator.triggerMediator('onModuleComplete', typedModule1Data.modulo as unknown as EducationalLayer)
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
      Object.fromEntries(ALL_MODULE1_CATEGORIES.map(k => [k, 0])) as Record<Module1Category, number>
    )
  }, [])

  const handleContinue = useCallback(() => {
    setIsNavigating(true)
    navigateTo('/modulo2')
  }, [])

  const renderCurrentActivity = () => {
    const activity = ACTIVITIES[currentActivityIndex]
    if (!activity) return null

    const onScore = (points: number, category: Module1Category) =>
      handleActivityScore(points, category)
    const onComplete = handleActivityComplete

    switch (activity.component) {
      case 'email':
        return (
          <EmailAnalysis
            emails={typedModule1Data.correos}
            onScore={(p) => onScore(p, 'analisis-email')}
            onComplete={onComplete}
          />
        )
      case 'url':
        return (
          <URLInspector
            urls={typedModule1Data.urls}
            onScore={(p) => onScore(p, 'inspeccion-url')}
            onComplete={onComplete}
          />
        )
      case 'simulator':
        return (
          <PhishingSimulator
            escenarios={typedModule1Data.escenarios}
            onScore={(p) => onScore(p, 'phishing-simulado')}
            onComplete={onComplete}
          />
        )
      case 'defense':
        return (
          <DigitalDefense
            onScore={(p) => onScore(p, 'defensa-digital')}
            onComplete={onComplete}
          />
        )
      case 'dragdrop':
        return (
          <DragDropActivity
            ejercicios={typedModule1Data.ejercicios}
            onScore={(p) => onScore(p, 'clasificacion')}
            onComplete={onComplete}
          />
        )
      case 'micro':
        return (
          <MicroActivities
            actividades={typedModule1Data.microActividades}
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
            moduleTitle="Misión: Shadow Protocol"
            moduleSubtitle="Privacidad y Huella Digital"
            moduleDescription="Aprende a rastrear y neutralizar las huellas invisibles que dejas en la red. Domina el análisis de metadatos EXIF y limpia las cookies espías antes de que el enemigo compile tu perfil digital."
            moduleIcon="🕵️"
            stats="6 dinámicas · 15-20 min · Umbral: 70%"
            moduleNumber={1}
          />
        )}

        {gamePhase === 'ACTIVITIES' && (
          <div key="activities" className="min-h-screen flex flex-col items-center pt-6 pb-12">
            <GameProgress
              currentIndex={currentActivityIndex}
              total={ACTIVITIES.length}
              score={score}
              maxScore={maxScore}
              categorias={typedModule1Data.categorias}
              categoryScores={categoryScores}
            />
            <div className="flex-1 flex items-center w-full">
              {renderCurrentActivity()}
            </div>
            {MEDATOR_ENABLED && (
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
              categorias={typedModule1Data.categorias}
              modulo={moduloForResults}
              onRetry={handleRetry}
              onContinue={handleContinue}
              isNavigating={isNavigating}
              continueLabel="Continuar al Módulo 2"
            />
            {MEDATOR_ENABLED && mediator.state === 'onMetaReflection' && (
              <DebriefDialog
                prompts={DEFAULT_DEBRIEF_PROMPTS}
                moduleName="Módulo 1"
                onComplete={(responses: Record<string, unknown>) => {
                  mediator.completeDebrief()
                  void responses
                }}
                onSkip={mediator.dismissMediator}
              />
            )}
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default function Module1Game() {
  return (
    <GamePauseProvider>
      <Module1GameContent />
    </GamePauseProvider>
  )
}
