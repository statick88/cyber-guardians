'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useEducationalMediator } from '@/hooks/useEducationalMediator'
import EducationalPanel from './EducationalPanel'
import TipBadge from './TipBadge'
import DebriefDialog from './DebriefDialog'
import ConceptCard from './ConceptCard'
import FormativeFeedback from './FormativeFeedback'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useAdaptivePath } from '@/hooks/useAdaptivePath'
import type { EducationalLayer, ScaffoldingProgress, MediatorState, SkillCompetencyTag } from '@/types/educational'
import { getCurrentTip } from '@/hooks/useScaffolding'
import { MEDIATOR_ENABLED } from '@/lib/featureFlags'

interface EducationalMediatorProps {
  /** Capa educativa del escenario actual */
  educationalLayer?: EducationalLayer
  /** Progreso de andamiaje para el tipo de escenario */
  scaffoldingProgress?: ScaffoldingProgress
  /** Módulo actual (para DebriefDialog) */
  moduleName: string
  /** ID del escenario actual */
  scenarioId?: string
  /** Callback cuando el usuario solicita una pista */
  onTipRequest?: () => void
  /** Callback cuando se completa el debrief */
  onDebriefComplete?: (responses: Record<string, unknown>) => void
  /** Habilitar funcionalidades pedagógicas 10x (ConceptCard, FormativeFeedback, Portfolio) */
  enablePedagogical10x?: boolean
  /** Hijos que reciben el estado del mediador para control avanzado */
  children?: (mediatorState: {
    state: MediatorState
    triggerMediator: (type: 'onIntro' | 'onTipRequest' | 'onError' | 'onModuleComplete', layer?: EducationalLayer) => void
    dismissMediator: () => void
    isPaused: boolean
  }) => React.ReactNode
}

/**
 * EducationalMediator — Orquestador de Mediación Pedagógica Compartido
 * 
 * Principios:
 * - Error Constructivo: Pausa controlada + conflicto cognitivo guiado
 * - Metacognición de Cierre: Debrief estructurado por competencias
 * - Andamiaje Dinámico: Tips adaptativos por nivel (ZDP)
 * 
 * Uso en cada módulo:
 * ```tsx
 * <EducationalMediator
 *   educationalLayer={currentLayer}
 *   scaffoldingProgress={progress}
 *   moduleName="Módulo 1"
 *   scenarioId="email-001"
 * >
 *   {({ state, triggerMediator, dismissMediator, isPaused }) => (
 *     <GameContent isPaused={isPaused} onError={() => triggerMediator('onError', layer)} />
 *   )}
 * </EducationalMediator>
 * ```
 */
export function EducationalMediator({
  educationalLayer,
  scaffoldingProgress,
  moduleName,
  scenarioId,
  onTipRequest,
  onDebriefComplete,
  enablePedagogical10x = false,
  children,
}: EducationalMediatorProps) {
  const mediator = useEducationalMediator()
  const portfolio = usePortfolio()
  const adaptivePath = useAdaptivePath()
  const isMounted = useRef(true)
  const lastErrorTime = useRef(0)
  const ERROR_COOLDOWN_MS = 3000

  // Auto-trigger intro on first mount
  useEffect(() => {
    if (MEDIATOR_ENABLED && educationalLayer && mediator.state === 'idle') {
      mediator.triggerMediator('onIntro', educationalLayer)
    }
  }, [educationalLayer, mediator])

  // Compute current scaffolding tip
  const currentTip = educationalLayer && scaffoldingProgress
    ? getCurrentTip(
        scaffoldingProgress.errorCount,
        scaffoldingProgress.correctStreak,
        educationalLayer.scaffoldingOverrides
      )
    : null

  // Enhanced trigger with cooldown for errors
  const triggerWithCooldown = useCallback((
    type: 'onIntro' | 'onTipRequest' | 'onError' | 'onModuleComplete',
    layer?: EducationalLayer
  ) => {
    if (!MEDIATOR_ENABLED) return

    if (type === 'onError') {
      const now = Date.now()
      if (now - lastErrorTime.current < ERROR_COOLDOWN_MS) return
      lastErrorTime.current = now
    }

    if (type === 'onTipRequest' && onTipRequest) {
      onTipRequest()
    }

    mediator.triggerMediator(type, layer ?? educationalLayer)
  }, [mediator, educationalLayer, onTipRequest])

  // Handle debrief completion
  const handleDebriefComplete = useCallback((responses: Record<string, unknown>) => {
    // Integrate with portfolio when pedagogical-10x is enabled
    if (enablePedagogical10x && educationalLayer) {
      // Map activityType → competencyTag (EducationalLayer doesn't carry competency directly)
      const ACTIVITY_TO_COMPETENCY: Record<string, SkillCompetencyTag> = {
        email_analysis: 'email-analysis',
        url_inspection: 'url-inspection',
        phishing_scenario: 'phishing-sim',
        security_quiz: 'digital-defense',
        drag_drop_classification: 'digital-defense',
        micro_activity: 'digital-defense',
        password_strength: 'digital-defense',
        mfa_simulation: 'digital-defense',
        social_media_audit: 'digital-defense',
      }

      portfolio.addEntry({
        scenarioId: educationalLayer.scenarioId,
        moduleName,
        competencyTag: ACTIVITY_TO_COMPETENCY[educationalLayer.activityType] ?? 'digital-defense',
        responses,
        timestamp: Date.now(),
      })

      // Trigger recomputation of adaptive path recommendations
      adaptivePath.getRecommendations()
    }

    mediator.completeDebrief()
    onDebriefComplete?.(responses)
  }, [mediator, onDebriefComplete, enablePedagogical10x, educationalLayer, moduleName, portfolio, adaptivePath])

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Render nothing if mediator disabled
  if (!MEDIATOR_ENABLED) {
    return children?.({
      state: 'idle' as MediatorState,
      triggerMediator: () => {},
      dismissMediator: () => {},
      isPaused: false,
    }) ?? null
  }

  const mediatorContext = {
    state: mediator.state,
    triggerMediator: triggerWithCooldown,
    dismissMediator: mediator.dismissMediator,
    isPaused: mediator.isPaused,
  }

  return (
    <>
      {/* Concept Card (pedagogical-10x: on intro) */}
      {enablePedagogical10x && mediator.state === 'onIntro' && educationalLayer && (
        <ConceptCard
          activityType={educationalLayer.activityType}
          educationalLayer={educationalLayer}
          onDismiss={mediator.dismissMediator}
          onViewExample={mediator.dismissMediator}
        />
      )}

      {/* Educational Panel (tips + conflict questions) */}
      <EducationalPanel
        state={mediator.state}
        educationalLayer={educationalLayer}
        scaffoldingProgress={scaffoldingProgress}
        onDismiss={mediator.dismissMediator}
      />

      {/* Tip Badge (inline, non-blocking) */}
      {mediator.state === 'onTipRequested' && currentTip && (
        <TipBadge
          tip={currentTip}
          onDismiss={mediator.dismissMediator}
          autoDismissMs={8000}
        />
      )}

      {/* Formative Feedback (pedagogical-10x: on error constructive) */}
      {enablePedagogical10x && mediator.state === 'onErrorConstructive' && (
        <FormativeFeedback
          competencyScores={portfolio.competencyScores}
          overallScore={portfolio.overallScore}
          onDismiss={mediator.dismissMediator}
        />
      )}

      {/* Debrief Dialog (metacognitive closure) */}
      {mediator.state === 'onMetaReflection' && educationalLayer && (
        <DebriefDialog
          prompts={educationalLayer.metacognitiveDebrief.prompts}
          onComplete={handleDebriefComplete}
          onSkip={mediator.dismissMediator}
          moduleName={moduleName}
        />
      )}

      {/* Children render prop for advanced control */}
      {children?.(mediatorContext)}
    </>
  )
}

// Hook para acceso directo al estado del mediador (para componentes que no usan render prop)
export function useEducationalMediatorState() {
  return useEducationalMediator()
}

// HOC para componentes que necesitan acceso al mediador
export function withEducationalMediator<T extends object>(
  Component: React.ComponentType<T & { mediator: ReturnType<typeof useEducationalMediator> }>
) {
  return function WithMediatorComponent(props: T) {
    const mediator = useEducationalMediator()
    return <Component {...props} mediator={mediator} />
  }
}