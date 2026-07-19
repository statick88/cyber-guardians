'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type {
  MediatorState,
  EducationalLayer,
  ScaffoldingProgress,
} from '@/types/educational'
import { getCurrentTip } from '@/hooks/useScaffolding'

interface EducationalPanelProps {
  state: MediatorState
  educationalLayer?: EducationalLayer
  scaffoldingProgress?: ScaffoldingProgress
  onDismiss: () => void
}

export default function EducationalPanel({
  state,
  educationalLayer,
  scaffoldingProgress,
  onDismiss,
}: EducationalPanelProps) {
  const prevStateRef = useRef<MediatorState | null>(null)

  const isVisible =
    state === 'onTipRequested' ||
    state === 'onErrorConstructive' ||
    state === 'onIntro'

  const tip =
    educationalLayer && scaffoldingProgress
      ? getCurrentTip(
          scaffoldingProgress.errorCount,
          scaffoldingProgress.correctStreak
        )
      : null

  useEffect(() => {
    if (!isVisible || !educationalLayer) return
    if (prevStateRef.current === state) return
    prevStateRef.current = state

    let message = ''
    if (state === 'onErrorConstructive') {
      message = educationalLayer.conflictQuestion.question
      if (educationalLayer.conflictQuestion.followUp) {
        message += ` ${educationalLayer.conflictQuestion.followUp}`
      }
      toast(message, {
        duration: 8000,
        className: 'glass-card neon-border',
        onDismiss,
      })
    } else if (state === 'onTipRequested' && tip) {
      toast(tip.hint, {
        duration: 6000,
        className: 'glass-card neon-border',
        onDismiss,
      })
    } else if (state === 'onIntro') {
      toast('Bienvenido al modo guiado. Te ayudaré a reflexionar sobre tus decisiones.', {
        duration: 6000,
        className: 'glass-card neon-border',
        onDismiss,
      })
    }
  }, [state, isVisible, educationalLayer, tip, onDismiss])

  return null
}
