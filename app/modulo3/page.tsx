'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import WelcomeScreen from '@/components/WelcomeScreen'
import GameProgress from '@/components/GameProgress'
import ResultsScreen from '@/components/ResultsScreen'
import ChatSimulator from '@/components/module3/ChatSimulator'
import MulaDineroDetector from '@/components/module3/MulaDineroDetector'
import ExtorsionResponse from '@/components/module3/ExtorsionResponse'
import SeñalesDragDrop from '@/components/module3/SeñalesDragDrop'
import { MicroActivities } from '@/components/module3/MicroActivities'
import { Module3Category, ALL_MODULE3_CATEGORIES, GameProgressModule3 } from '@/types/module3'
import { navigateTo } from '@/lib/navigation'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import module3Data from '@/data/module3Data.json'
import type { Modulo3Data } from '@/types/module3'
import { MEDIATOR_ENABLED } from '@/lib/featureFlags'
import { useEducationalMediator } from '@/hooks/useEducationalMediator'
import { EducationalPanel } from '@/components/mediator'
import DebriefDialog from '@/components/mediator/DebriefDialog'
import { DEFAULT_DEBRIEF_PROMPTS } from '@/data/debriefPrompts'
import type { EducationalLayer } from '@/types/educational'
import { useMIA } from '@/hooks/useMIA'

const typedModule3Data = module3Data as Modulo3Data

const moduloForResults = {
  id: 'module3',
  titulo: 'CyberSentry — Escudo contra Engaños y Mafias Digitales',
  subtitulo: 'Protege a los jóvenes del reclutamiento criminal, muleo financiero, ciberextorsión y manipulación',
  descripcion: 'Identifica señales de peligro en reclutamiento, muleo financiero, ciberextorsión y manipulación. Toma decisiones correctas en escenarios reales.',
  umbralAprobacion: 70,
  tiempoEstimado: '15-20 min',
  totalPuntosPosibles: 200,
  icono: '🛡️',
}

const STORAGE_KEY = STORAGE_KEYS.MODULE3
const STALE_MS = 24 * 60 * 60 * 1000

type GamePhase = 'WELCOME' | 'ACTIVITIES' | 'RESULTS'

// 6 activity slots:
// 0: Chat reclutamiento (Instagram)
// 1: Mula dinero 1
// 2: Extorsión 1
// 3: Chat manipulación (TikTok)
// 4: Drag & drop
// 5: Micro-activities
const ACTIVITIES = [
  { key: 'chat-reclutamiento', component: 'chat-reclutamiento' as const },
  { key: 'mula-1', component: 'mula-1' as const },
  { key: 'extorsion-1', component: 'extorsion-1' as const },
  { key: 'chat-manipulacion', component: 'chat-manipulacion' as const },
  { key: 'dragdrop', component: 'dragdrop' as const },
  { key: 'micro', component: 'micro' as const },
]

// Categories mapped to each activity index
const ACTIVITY_CATEGORIES: Module3Category[] = [
  'reclutamiento',
  'mula_dinero',
  'ciberextorsion',
  'manipulacion',
  'manipulacion', // dragdrop covers all categories
  'reclutamiento', // micro covers multiple
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

  const handleActivityScore = useCallback((points: number, category?: Module3Category) => {
    if (MEDIATOR_ENABLED && points === 0) {
      mediator.triggerMediator('onError', { scenarioId: 'module3-intro', moduleId: 3, activityType: 'chat_simulation', conflictQuestion: { question: '¿Por qué crees que esta respuesta fue incorrecta?', expectedInsight: 'Identificar la táctica del atacante' }, scaffoldingTip: { level: 'guided', hint: 'Observa las señales de urgencia en el mensaje' }, metacognitiveDebrief: { prompts: [] }, mediatorHook: 'onError' } as EducationalLayer)
    }
    setScore((prev) => {
      const next = prev + points
      setCategoryScores((prevCat) => {
        const cat = category ?? ACTIVITY_CATEGORIES[currentActivityIndex]
        const updated = { ...prevCat, [cat]: (prevCat[cat] || 0) + points }
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
        mediator.triggerMediator('onModuleComplete', { scenarioId: 'module3-intro', moduleId: 3, activityType: 'chat_simulation', conflictQuestion: { question: '¿Por qué crees que esta respuesta fue incorrecta?', expectedInsight: 'Identificar la táctica del atacante' }, scaffoldingTip: { level: 'guided', hint: 'Observa las señales de urgencia en el mensaje' }, metacognitiveDebrief: { prompts: [] }, mediatorHook: 'onError' } as EducationalLayer)
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

    switch (activity.component) {
      case 'chat-reclutamiento': {
        const scenario = typedModule3Data.escenariosChat.find(s => s.categoria === 'reclutamiento')
        if (!scenario) return null
        return (
          <ChatSimulator
            scenario={scenario}
            onScore={(p) => handleActivityScore(p, 'reclutamiento')}
            onComplete={handleActivityComplete}
          />
        )
      }

      case 'mula-1': {
        const mulaAct = typedModule3Data.actividadesMula[0]
        if (!mulaAct) return null
        return (
          <MulaDineroDetector
            actividad={mulaAct}
            onScore={(p) => handleActivityScore(p, 'mula_dinero')}
            onComplete={handleActivityComplete}
          />
        )
      }

      case 'extorsion-1': {
        const extScenario = typedModule3Data.escenariosExtorsion[0]
        if (!extScenario) return null
        return (
          <ExtorsionResponse
            scenario={extScenario}
            onScore={(p) => handleActivityScore(p, 'ciberextorsion')}
            onComplete={handleActivityComplete}
          />
        )
      }

      case 'chat-manipulacion': {
        const scenario = typedModule3Data.escenariosChat.find(s => s.categoria === 'manipulacion')
        if (!scenario) return null
        return (
          <ChatSimulator
            scenario={scenario}
            onScore={(p) => handleActivityScore(p, 'manipulacion')}
            onComplete={handleActivityComplete}
          />
        )
      }

      case 'dragdrop':
        return (
          <SeñalesDragDrop
            mensajes={typedModule3Data.mensajesDragDrop}
            onScore={(p) => handleActivityScore(p, 'manipulacion')}
            onComplete={handleActivityComplete}
            onMIAEmotion={triggerMIA}
          />
        )

      case 'micro': {
        // Collect micro activities from all data
        const microActividades = [
          // Verdadero/falso about mule signals
          {
            id: 'micro-tf-1',
            tipo: 'verdadero-falso' as const,
            pregunta: '¿Es legal recibir dinero en tu cuenta y transferirlo a otra persona por una comisión?',
            respuestaCorrecta: 'falso',
            puntos: 3,
            explicacion: 'Es ILEGAL — estás participando en lavado de dinero aunque no lo sepas.',
            categoria: 'mula_dinero' as const,
          },
          {
            id: 'micro-tf-2',
            tipo: 'verdadero-falso' as const,
            pregunta: 'Si un desconocido te ofrece un trabajo por internet sin contrato, es seguro aceptar.',
            respuestaCorrecta: 'falso',
            puntos: 3,
            explicacion: 'Un trabajo legítimo siempre tiene contrato y datos verificables de la empresa.',
            categoria: 'reclutamiento' as const,
          },
          {
            id: 'micro-tf-3',
            tipo: 'verdadero-falso' as const,
            pregunta: 'Si te amenazan con difundir fotos íntimas, debes pagar para que no lo hagan.',
            respuestaCorrecta: 'falso',
            puntos: 3,
            explicacion: 'NUNCA pagues — no hay garantía de que paren. Guarda evidencia y denuncia.',
            categoria: 'ciberextorsion' as const,
          },
          {
            id: 'micro-tf-4',
            tipo: 'verdadero-falso' as const,
            pregunta: 'El love bombing (amor excesivo rápido) es una táctica de manipulación.',
            respuestaCorrecta: 'verdadero',
            puntos: 3,
            explicacion: 'Correcto. El afecto excesivo muy rápido es una táctica para ganar confianza y luego manipular.',
            categoria: 'manipulacion' as const,
          },
        ]
        return (
          <MicroActivities
            actividades={microActividades}
            onScore={handleActivityScore}
            onComplete={handleActivityComplete}
            onMIAEmotion={triggerMIA}
          />
        )
      }

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
            moduleTitle="CyberSentry — Escudo contra Engaños y Mafias Digitales"
            moduleSubtitle="Protege a los jóvenes del reclutamiento criminal, muleo financiero, ciberextorsión y manipulación"
            moduleDescription="Identifica señales de peligro en reclutamiento, muleo financiero, ciberextorsión y manipulación. Toma decisiones correctas en escenarios reales."
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
              categorias={ALL_MODULE3_CATEGORIES.map((cat) => ({
                id: cat,
                nombre: cat === 'reclutamiento' ? 'Reclutamiento'
                  : cat === 'mula_dinero' ? 'Mula Dinero'
                  : cat === 'ciberextorsion' ? 'Ciberextorsión'
                  : 'Manipulación',
                emoji: cat === 'reclutamiento' ? '👥'
                  : cat === 'mula_dinero' ? '💰'
                  : cat === 'ciberextorsion' ? '🔒'
                  : '🎭',
                descripcion: '',
                color: cat === 'reclutamiento' ? '#6366f1'
                  : cat === 'mula_dinero' ? '#f59e0b'
                  : cat === 'ciberextorsion' ? '#ef4444'
                  : '#8b5cf6',
              }))}
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
              categorias={ALL_MODULE3_CATEGORIES.map((cat) => ({
                id: cat,
                nombre: cat === 'reclutamiento' ? 'Reclutamiento'
                  : cat === 'mula_dinero' ? 'Mula Dinero'
                  : cat === 'ciberextorsion' ? 'Ciberextorsión'
                  : 'Manipulación',
                emoji: cat === 'reclutamiento' ? '👥'
                  : cat === 'mula_dinero' ? '💰'
                  : cat === 'ciberextorsion' ? '🔒'
                  : '🎭',
                descripcion: '',
                color: cat === 'reclutamiento' ? '#6366f1'
                  : cat === 'mula_dinero' ? '#f59e0b'
                  : cat === 'ciberextorsion' ? '#ef4444'
                  : '#8b5cf6',
              }))}
              modulo={moduloForResults}
              onRetry={handleRetry}
              onContinue={handleContinue}
              isNavigating={isNavigating}
              continueLabel="Continuar al Módulo 4"
            />
            {MEDIATOR_ENABLED && mediator.state === 'onMetaReflection' && (
              <DebriefDialog
                prompts={DEFAULT_DEBRIEF_PROMPTS}
                moduleName="Módulo 3"
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
