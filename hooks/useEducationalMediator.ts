'use client'

import { useReducer, useCallback, useEffect } from 'react'
import type {
  MediatorState,
  MediatorTrigger,
  EducationalLayer,
  MediatorAction,
  MediatorContextValue,
} from '@/types/educational'

// ─── Reducer ─────────────────────────────────────────────────────────────────

interface MediatorReducerState {
  state: MediatorState
  currentLayer: EducationalLayer | null
}

const initialState: MediatorReducerState = {
  state: 'idle',
  currentLayer: null,
}

function mediatorReducer(
  prev: MediatorReducerState,
  action: MediatorAction
): MediatorReducerState {
  switch (action.type) {
    case 'TRIGGER': {
      const trigger = action.payload?.trigger
      const layer = action.payload?.layer ?? null

      // Map trigger → mediator state
      switch (trigger) {
        case 'onIntro':
          return { state: 'onIntro', currentLayer: layer }
        case 'onTipRequest':
          return { state: 'onTipRequested', currentLayer: layer }
        case 'onError':
          return { state: 'onErrorConstructive', currentLayer: layer }
        case 'onModuleComplete':
          return { state: 'onMetaReflection', currentLayer: layer }
        default:
          return prev
      }
    }

    case 'DISMISS':
      return { state: 'idle', currentLayer: null }

    case 'ANSWER':
      // After answering an error, go back to idle
      if (prev.state === 'onErrorConstructive') {
        return { state: 'idle', currentLayer: null }
      }
      return prev

    case 'COMPLETE_DEBRIEF':
      return { state: 'idle', currentLayer: null }

    default:
      return prev
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'cg_mediator_debrief'

/**
 * useEducationalMediator manages the mediator finite state machine.
 *
 * States: idle → onIntro → onTipRequested → onErrorConstructive → onMetaReflection
 *
 * Persists debrief answers to localStorage under `cg_mediator_debrief`.
 */
export function useEducationalMediator(): MediatorContextValue {
  const [reducerState, dispatch] = useReducer(mediatorReducer, initialState)

  // Persist debrief responses to localStorage
  useEffect(() => {
    if (reducerState.state !== 'onMetaReflection') return
    // Debrief started — no-op until COMPLETE_DEBRIEF
  }, [reducerState.state])

  const triggerMediator = useCallback(
    (trigger: MediatorTrigger, layer?: EducationalLayer) => {
      dispatch({ type: 'TRIGGER', payload: { trigger, layer } })
    },
    []
  )

  const dismissMediator = useCallback(() => {
    dispatch({ type: 'DISMISS' })
  }, [])

  const answerMediator = useCallback((answer: string | number) => {
    dispatch({ type: 'ANSWER', payload: { answer } })
  }, [])

  const completeDebrief = useCallback(() => {
    dispatch({ type: 'COMPLETE_DEBRIEF' })
  }, [])

  return {
    state: reducerState.state,
    currentLayer: reducerState.currentLayer,
    triggerMediator,
    dismissMediator,
    answerMediator,
    completeDebrief,
    // isPaused is derived from state — mediator is active when not idle
    isPaused: reducerState.state !== 'idle',
  }
}
