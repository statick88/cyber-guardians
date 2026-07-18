'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import WelcomeScreen from '@/components/WelcomeScreen'
import GameProgress from '@/components/GameProgress'
import ResultsScreen from '@/components/ResultsScreen'
import { QRCodeInspector, PyramidDetector, EmploymentScamAlert, MicroActivities } from '@/components/module6'
import { navigateTo } from '@/lib/navigation'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import module6Data from '@/data/module6Data.json'
import type { Modulo6Data } from '@/types/module6'

const typedModule6Data = module6Data as Modulo6Data

const moduloForResults = {
  id: 'module6',
  titulo: 'Crypto-Scam Shield — Escudo contra Estafas Financieras',
  subtitulo: 'Identifica y defiéndete de estafas crypto, pirámides y fraudes laborales',
  descripcion: 'Aprende a detectar estafas QR, esquemas piramidales y fraudes de empleo. Protege tu dinero y el de tu familia.',
  umbralAprobacion: 70,
  tiempoEstimado: '15-20 min',
  totalPuntosPosibles: 200,
  icono: '🛡️',
}

const STORAGE_KEY = STORAGE_KEYS.MODULE6 || 'cg_2026_module6'
const STALE_MS = 24 * 60 * 60 * 1000

type GamePhase = 'WELCOME' | 'ACTIVITIES' | 'RESULTS'

const ACTIVITIES = [
  { key: 'qr-1', component: 'qr' as const },
  { key: 'qr-2', component: 'qr' as const },
  { key: 'qr-3', component: 'qr' as const },
  { key: 'pir-1', component: 'pyramid' as const },
  { key: 'pir-2', component: 'pyramid' as const },
  { key: 'pir-3', component: 'pyramid' as const },
  { key: 'emp-1', component: 'employment' as const },
  { key: 'emp-2', component: 'employment' as const },
  { key: 'emp-3', component: 'employment' as const },
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

export default function Modulo6Page() {
  const [savedProgress] = useState(() => loadProgress())
  const [gamePhase, setGamePhase] = useState<GamePhase>(savedProgress ? 'ACTIVITIES' : 'WELCOME')
  const [currentActivityIndex, setCurrentActivityIndex] = useState(savedProgress?.currentActivityIndex ?? 0)
  const [score, setScore] = useState(savedProgress?.score ?? 0)
  const [maxScore] = useState(200)
  const [categoryScores] = useState<Record<string, number>>({
    scam_detection: 0,
    pyramid_detection: 0,
    employment_scam: 0,
  })
  const [isNavigating, setIsNavigating] = useState(false)

  const handleStart = useCallback(() => {
    setGamePhase('ACTIVITIES')
    setCurrentActivityIndex(0)
    setScore(0)
  }, [])

  const handleActivityScore = useCallback((points: number) => {
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
  }, [])

  const handleContinue = useCallback(() => {
    setIsNavigating(true)
    navigateTo('/modulo7')
  }, [])

  const renderCurrentActivity = () => {
    const activity = ACTIVITIES[currentActivityIndex]
    if (!activity) return null

    switch (activity.component) {
      case 'qr': {
        const scenarioIndex = currentActivityIndex
        const scenario = typedModule6Data.scamsQR[scenarioIndex]
        if (!scenario) return null
        return (
          <QRCodeInspector
            scenarios={[scenario]}
            onComplete={handleActivityComplete}
          />
        )
      }

      case 'pyramid': {
        const scenarioIndex = currentActivityIndex - 3
        const scenario = typedModule6Data.piramides[scenarioIndex]
        if (!scenario) return null
        return (
          <PyramidDetector
            scenarios={[scenario]}
            onComplete={handleActivityComplete}
          />
        )
      }

      case 'employment': {
        const scenarioIndex = currentActivityIndex - 6
        const scenario = typedModule6Data.empleosFalsos[scenarioIndex]
        if (!scenario) return null
        return (
          <EmploymentScamAlert
            scenarios={[scenario]}
            onComplete={handleActivityComplete}
          />
        )
      }

      case 'micro':
        return (
          <MicroActivities
            onComplete={handleActivityComplete}
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
            moduleTitle="Crypto-Scam Shield — Escudo contra Estafas Financieras"
            moduleSubtitle="Identifica y defiéndete de estafas crypto, pirámides y fraudes laborales"
            moduleDescription="Aprende a detectar estafas QR, esquemas piramidales y fraudes de empleo. Protege tu dinero y el de tu familia."
            stats="10 actividades · 15-20 min · Umbral: 70%"
            moduleNumber={6}
          />
        )}

        {gamePhase === 'ACTIVITIES' && (
          <div key="activities" className="min-h-screen flex flex-col items-center pt-6 pb-12">
            <GameProgress
              currentIndex={currentActivityIndex}
              total={ACTIVITIES.length}
              score={score}
              maxScore={maxScore}
              categorias={[
                {
                  id: 'scam_detection',
                  nombre: 'Detección de Estafas QR',
                  emoji: '📱',
                  descripcion: 'Identifica códigos QR maliciosos',
                  color: '#06b6d4',
                },
                {
                  id: 'pyramid_detection',
                  nombre: 'Esquemas Piramidales',
                  emoji: '🔺',
                  descripcion: 'Detecta fraudes de inversión',
                  color: '#a855f7',
                },
                {
                  id: 'employment_scam',
                  nombre: 'Fraudes de Empleo',
                  emoji: '💼',
                  descripcion: 'Reconoce ofertas falsas',
                  color: '#f97316',
                },
              ]}
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
              categorias={[
                {
                  id: 'scam_detection',
                  nombre: 'Detección de Estafas QR',
                  emoji: '📱',
                  descripcion: 'Identifica códigos QR maliciosos',
                  color: '#06b6d4',
                },
                {
                  id: 'pyramid_detection',
                  nombre: 'Esquemas Piramidales',
                  emoji: '🔺',
                  descripcion: 'Detecta fraudes de inversión',
                  color: '#a855f7',
                },
                {
                  id: 'employment_scam',
                  nombre: 'Fraudes de Empleo',
                  emoji: '💼',
                  descripcion: 'Reconoce ofertas falsas',
                  color: '#f97316',
                },
              ]}
              modulo={moduloForResults}
              onRetry={handleRetry}
              onContinue={handleContinue}
              isNavigating={isNavigating}
              continueLabel="Continuar al Módulo 7"
            />
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
