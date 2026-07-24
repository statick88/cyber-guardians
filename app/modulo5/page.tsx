'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import WelcomeScreen from '@/components/WelcomeScreen'
import GameProgress from '@/components/GameProgress'
import ResultsScreen from '@/components/ResultsScreen'
import { DeepfakeDetector, MetadataAnalyzer, ReverseImageSearch, MicroActivities } from '@/components/module5'
import { navigateTo } from '@/lib/navigation'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import module5Data from '@/data/module5Data.json'
import type { Modulo5Data } from '@/types/module5'
import { useMIA } from '@/hooks/useMIA'
import { MEDIATOR_ENABLED } from '@/lib/featureFlags'
import { useEducationalMediator } from '@/hooks/useEducationalMediator'
import { EducationalPanel } from '@/components/mediator'
import DebriefDialog from '@/components/mediator/DebriefDialog'
import { DEFAULT_DEBRIEF_PROMPTS } from '@/data/debriefPrompts'
import type { EducationalLayer } from '@/types/educational'

const typedModule5Data = module5Data as Modulo5Data

const MODULE5_EDUCATIONAL_LAYER = {
  scenarioId: 'module5-intro',
  moduleId: 5,
  activityType: 'metadata_extractor',
  conflictQuestion: {
    question: '¿Por qué crees que esta respuesta fue incorrecta?',
    expectedInsight: 'Identificar la táctica del atacante',
  },
  scaffoldingTip: {
    level: 'guided',
    hint: 'Observa los metadatos ocultos en el archivo',
  },
  metacognitiveDebrief: { prompts: [] },
  mediatorHook: 'onError',
} as EducationalLayer

const moduloForResults = {
  id: 'module5',
  titulo: 'Deepfake Defender — Detector de Amenazas IA',
  subtitulo: 'Identifica y defiéndete de deepfakes, clonación de voz y contenido sintético',
  descripcion: 'Aprende a detectar deepfakes de audio, video e imagen. Analiza metadatos, verifica fuentes y protégete del contenido generado por IA.',
  umbralAprobacion: 70,
  tiempoEstimado: '15-20 min',
  totalPuntosPosibles: 0, // will be set dynamically
  icono: '🎭',
}

const STORAGE_KEY = STORAGE_KEYS.MODULE5 || 'cyberguardians-module5-progress'
const STALE_MS = 24 * 60 * 60 * 1000

type GamePhase = 'WELCOME' | 'ACTIVITIES' | 'RESULTS'

const ACTIVITIES = [
  { key: 'deepfake-1', component: 'detector' as const },
  { key: 'deepfake-2', component: 'detector' as const },
  { key: 'deepfake-3', component: 'detector' as const },
  { key: 'deepfake-4', component: 'detector' as const },
  { key: 'metadata', component: 'metadata' as const },
  { key: 'micro', component: 'micro' as const },
]

function loadProgress() {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    if (typeof parsed.currentActivityIndex !== 'number' || typeof parsed.score !== 'number') {
      return null
    }
    if (Date.now() - parsed.timestamp > STALE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function saveProgress(progress: { currentActivityIndex: number; score: number; timestamp: number }) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {}
}

function clearProgress() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export default function Modulo5Page() {
  const [savedProgress] = useState(() => loadProgress())
  const { triggerMIA } = useMIA()
  const mediator = useEducationalMediator()
  const [gamePhase, setGamePhase] = useState<GamePhase>(savedProgress ? 'ACTIVITIES' : 'WELCOME')
  const [currentActivityIndex, setCurrentActivityIndex] = useState(savedProgress?.currentActivityIndex ?? 0)
  const [score, setScore] = useState(savedProgress?.score ?? 0)
  const [maxScore] = useState(() => {
    const deepfakePoints = typedModule5Data.escenarios.length * 8
    const metadataPoints = typedModule5Data.indicadoresMetadata.length * 4
    const microPoints = typedModule5Data.microActividades?.reduce(
      (sum: number, m: { puntos?: number }) => sum + (m.puntos ?? 3), 0
    ) ?? 0
    return deepfakePoints + metadataPoints + microPoints
  })
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({ deepfake_detection: 0 })
  const [isNavigating, setIsNavigating] = useState(false)

  const handleStart = useCallback(() => {
    setGamePhase('ACTIVITIES')
    setCurrentActivityIndex(0)
    setScore(0)
  }, [])

  const handleActivityScore = useCallback((points: number) => {
    if (MEDIATOR_ENABLED && points === 0) {
      mediator.triggerMediator('onError', MODULE5_EDUCATIONAL_LAYER)
    }
    setScore((prev: number) => {
      const next = prev + points
      saveProgress({ currentActivityIndex, score: next, timestamp: Date.now() })
      return next
    })
  }, [currentActivityIndex])

  const handleActivityComplete = useCallback(() => {
    if (currentActivityIndex + 1 < ACTIVITIES.length) {
      setCurrentActivityIndex((prev: number) => prev + 1)
    } else {
      if (MEDIATOR_ENABLED) {
        mediator.triggerMediator('onModuleComplete', MODULE5_EDUCATIONAL_LAYER)
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
  }, [])

  const handleContinue = useCallback(() => {
    setIsNavigating(true)
    navigateTo('/modulo6')
  }, [])

  const renderCurrentActivity = () => {
    const activity = ACTIVITIES[currentActivityIndex]
    if (!activity) return null

    switch (activity.component) {
      case 'detector': {
        const scenarioIndex = currentActivityIndex
        const scenario = typedModule5Data.escenarios[scenarioIndex]
        if (!scenario) return null
        return (
          <DeepfakeDetector
            artifacts={scenario.artifacts}
            explicacion={scenario.explicacion}
            fuente={scenario.fuente}
            pregunta={scenario.pregunta}
            opciones={scenario.opciones}
            respuestaCorrecta={scenario.respuestaCorrecta}
            onScore={handleActivityScore}
            onComplete={handleActivityComplete}
            onMIAEmotion={triggerMIA}
          />
        )
      }

      case 'metadata':
        return (
          <MetadataAnalyzer
            indicators={typedModule5Data.indicadoresMetadata}
            onScore={handleActivityScore}
            onComplete={handleActivityComplete}
          />
        )

      case 'micro':
        return (
          <MicroActivities
            actividades={typedModule5Data.microActividades}
            onScore={handleActivityScore}
            onComplete={handleActivityComplete}
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
            moduleTitle="Deepfake Defender — Detector de Amenazas IA"
            moduleSubtitle="Identifica y defiéndete de deepfakes, clonación de voz y contenido sintético"
            moduleDescription="Aprende a detectar deepfakes de audio, video e imagen. Analiza metadatos, verifica fuentes y protégete del contenido generado por IA."
            stats="6 actividades · 15-20 min · Umbral: 70%"
            moduleNumber={5}
          />
        )}

        {gamePhase === 'ACTIVITIES' && (
          <div key="activities" className="min-h-screen flex flex-col items-center pt-6 pb-12">
            <GameProgress
              currentIndex={currentActivityIndex}
              total={ACTIVITIES.length}
              score={score}
              maxScore={maxScore}
              categorias={[{
                id: 'deepfake_detection',
                nombre: 'Detección de Deepfakes',
                emoji: '🎭',
                descripcion: 'Identifica contenido generado por IA',
                color: '#8b5cf6',
              }]}
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
              categorias={[{
                id: 'deepfake_detection',
                nombre: 'Detección de Deepfakes',
                emoji: '🎭',
                descripcion: 'Identifica contenido generado por IA',
                color: '#8b5cf6',
              }]}
              modulo={{ ...moduloForResults, totalPuntosPosibles: maxScore }}
              onRetry={handleRetry}
              onContinue={handleContinue}
              isNavigating={isNavigating}
              continueLabel="Continuar al Módulo 6"
            />
            {MEDIATOR_ENABLED && mediator.state === 'onMetaReflection' && (
              <DebriefDialog
                prompts={DEFAULT_DEBRIEF_PROMPTS}
                moduleName="Módulo 5"
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
