'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import WelcomeScreen from '@/components/WelcomeScreen'
import ScenarioCard from '@/components/ScenarioCard'
import GameProgress from '@/components/GameProgress'
import ResultsScreen from '@/components/ResultsScreen'
import MicroActivity from '@/components/MicroActivity'
import module0Raw from '@/data/module0Data.json'
import type { ModuloData, GameState, GameProgress as GameProgressType } from '@/types/module0'
import { navigateTo } from '@/lib/navigation'
import { STORAGE_KEYS } from '@/lib/storage-keys'

const STORAGE_KEY = STORAGE_KEYS.MODULE0
const STALE_MS = 24 * 60 * 60 * 1000 // 24 hours

function loadData(): ModuloData {
  const data = module0Raw as ModuloData
  if (!data?.modulo || !Array.isArray(data?.escenarios) || !Array.isArray(data?.categorias)) {
    throw new Error('Invalid module data')
  }
  return data
}

function loadProgress(): GameProgressType | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    if (
      typeof parsed.currentScenarioIndex !== 'number' ||
      typeof parsed.totalScore !== 'number' ||
      !parsed.categoryScores ||
      !Array.isArray(parsed.completedScenarios) ||
      typeof parsed.timestamp !== 'number'
    ) {
      return null
    }
    if (Date.now() - parsed.timestamp > STALE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed as GameProgressType
  } catch {
    return null
  }
}

function saveProgress(progress: GameProgressType) {
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

export default function Modulo0Game() {
  const data = loadData()

  const [gameState, setGameState] = useState<GameState>('WELCOME')
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({})
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([])
  const [microActivitiesComplete, setMicroActivitiesComplete] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)

  // Restore progress on mount
  useEffect(() => {
    const saved = loadProgress()
    if (saved && saved.gameState === 'PLAYING') {
      setGameState('PLAYING')
      setCurrentScenarioIndex(saved.currentScenarioIndex)
      setTotalScore(saved.totalScore)
      setCategoryScores(saved.categoryScores)
      setCompletedScenarios(saved.completedScenarios)
    } else if (saved && saved.gameState === 'RESULTS') {
      setGameState('RESULTS')
      setCurrentScenarioIndex(saved.currentScenarioIndex)
      setTotalScore(saved.totalScore)
      setCategoryScores(saved.categoryScores)
      setCompletedScenarios(saved.completedScenarios)
    }
  }, [])

  // Save progress when state changes
  useEffect(() => {
    if (gameState === 'PLAYING' || gameState === 'RESULTS') {
      saveProgress({
        currentScenarioIndex,
        totalScore,
        categoryScores,
        completedScenarios,
        gameState,
        timestamp: Date.now(),
      })
    }
  }, [gameState, currentScenarioIndex, totalScore, categoryScores, completedScenarios])

  // Clear progress when showing results (matches modules 1-4 pattern)
  useEffect(() => {
    if (gameState === 'RESULTS') clearProgress()
  }, [gameState])

  const handleStart = useCallback(() => {
    setGameState('PLAYING')
    setCurrentScenarioIndex(0)
    setTotalScore(0)
    setCategoryScores({})
    setCompletedScenarios([])
    setMicroActivitiesComplete(0)
  }, [])

  const handleAnswer = useCallback((puntos: number, categoria: string) => {
    const scenario = data.escenarios[currentScenarioIndex]
    if (!scenario) return

    setTotalScore(prev => prev + puntos)
    setCategoryScores(prev => ({
      ...prev,
      [categoria]: (prev[categoria] || 0) + puntos,
    }))
    setCompletedScenarios(prev => [...prev, scenario.id])

    if (currentScenarioIndex + 1 < data.escenarios.length) {
      setCurrentScenarioIndex(prev => prev + 1)
      setGameState('PLAYING')
    } else {
      setGameState('RESULTS')
    }
  }, [currentScenarioIndex, data.escenarios])

  const handleRetry = useCallback(() => {
    clearProgress()
    setGameState('WELCOME')
    setCurrentScenarioIndex(0)
    setTotalScore(0)
    setCategoryScores({})
    setCompletedScenarios([])
    setMicroActivitiesComplete(0)
  }, [])

  const handleContinue = useCallback(() => {
    setIsNavigating(true)
    navigateTo('/modulo1')
  }, [])

  const handleMicroComplete = useCallback(() => {
    setMicroActivitiesComplete(prev => prev + 1)
  }, [])

  const percentage = data.modulo.totalPuntosPosibles > 0
    ? Math.round((totalScore / data.modulo.totalPuntosPosibles) * 100)
    : 0

  return (
    <main className="min-h-screen gradient-bg">
      <AnimatePresence mode="wait">
        {gameState === 'WELCOME' && (
          <WelcomeScreen key="welcome" onStart={handleStart} />
        )}

        {(gameState === 'PLAYING' || gameState === 'FEEDBACK') && (
          <div key="playing" className="min-h-screen flex flex-col items-center pt-6 pb-12">
            <GameProgress
              currentIndex={currentScenarioIndex}
              total={data.escenarios.length}
              score={totalScore}
              maxScore={data.modulo.totalPuntosPosibles}
              categorias={data.categorias}
              categoryScores={categoryScores}
            />

            <div className="flex-1 flex items-center w-full">
              <ScenarioCard
                key={data.escenarios[currentScenarioIndex].id ?? currentScenarioIndex}
                scenario={data.escenarios[currentScenarioIndex]}
                onAnswer={handleAnswer}
              />
            </div>
          </div>
        )}

        {gameState === 'RESULTS' && (
          <div key="results">
            <ResultsScreen
              score={totalScore}
              maxScore={data.modulo.totalPuntosPosibles}
              categoryScores={categoryScores}
              categorias={data.categorias}
              modulo={data.modulo}
              onRetry={handleRetry}
              onContinue={handleContinue}
              isNavigating={isNavigating}
              continueLabel="Continuar al Módulo 1"
            />

            {percentage < data.modulo.umbralAprobacion && (
              <div className="max-w-4xl mx-auto px-4 pb-12 -mt-2">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-slate-200">Micro-Actividades</h3>
                  <span className="text-xs text-slate-500 code-font">
                    {microActivitiesComplete}/2 completadas
                  </span>
                </div>
                {data.resultados.nivelBasico.microActividades?.map((activity) => (
                  <MicroActivity
                    key={activity.id}
                    activityId={activity.id}
                    title={activity.titulo}
                    description={activity.descripcion}
                    onComplete={handleMicroComplete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
