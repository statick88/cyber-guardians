'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useHUD } from '@/components/HUDProvider'
import type { MIAEmotion, MIADialogueEntry, MIADialogueSchema, UseMIAReturn } from '@/types/mia'
import dialogueBankRaw from '@/data/miaDialogues.json'

const dialogueBank = dialogueBankRaw as MIADialogueSchema

// ── Constants ────────────────────────────────────────────────────────────────

/** Cooldown in ms between emotion changes */
const COOLDOWN_MS = 3000

/** How many recent dialogue IDs to exclude */
const DEDUP_WINDOW_SIZE = 5

/** How long (ms) a dialogue ID stays excluded after being shown */
const DEDUP_TTL_MS = 60_000

/** Auto-dismiss duration (ms) — bubble hides after this time */
const AUTO_DISMISS_MS = 8000

// ── Dedup tracker ────────────────────────────────────────────────────────────

interface DedupEntry {
  id: string
  shownAt: number
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useMIA(): UseMIAReturn {
  const hud = useHUD()

  const [emotion, setEmotion] = useState<MIAEmotion>('IDLE')
  const [currentDialogue, setCurrentDialogue] = useState<MIADialogueEntry | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Track previous HUD values to detect state changes
  const prevShieldHP = useRef(hud.shieldHP)
  const prevXP = useRef(hud.xp)
  const prevCompletedCount = useRef(hud.completedChallenges.length)

  // Cooldown: timestamp of last emotion change
  const lastEmotionChange = useRef(0)

  // Dialogue dedup: circular buffer of recently shown IDs
  const dedupList = useRef<DedupEntry[]>([])

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Check if a dialogue ID is excluded by the dedup window */
  const isDeduped = useCallback((id: string): boolean => {
    const now = Date.now()
    // Prune expired entries
    dedupList.current = dedupList.current.filter((e) => now - e.shownAt < DEDUP_TTL_MS)
    return dedupList.current.some((e) => e.id === id)
  }, [])

  /** Add a dialogue ID to the dedup window */
  const markShown = useCallback((id: string) => {
    dedupList.current.push({ id, shownAt: Date.now() })
    // Keep only the last N entries
    if (dedupList.current.length > DEDUP_WINDOW_SIZE) {
      dedupList.current = dedupList.current.slice(-DEDUP_WINDOW_SIZE)
    }
  }, [])

  /** Select a random dialogue for the given emotion and module, with fallback chain */
  const selectDialogue = useCallback(
    (targetEmotion: MIAEmotion, moduleId?: number): MIADialogueEntry | null => {
      const activeModule = moduleId ?? hud.currentModule ?? 0
      const allDialogues = dialogueBank.dialogues

      // Fallback chain: module-specific → moduleId 0 → IDLE default
      const candidates = allDialogues.filter(
        (d) =>
          d.emotion === targetEmotion &&
          d.moduleId === activeModule &&
          !isDeduped(d.id)
      )

      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)]
      }

      // Fallback: moduleId 0
      const fallbackModule0 = allDialogues.filter(
        (d) =>
          d.emotion === targetEmotion &&
          d.moduleId === 0 &&
          !isDeduped(d.id)
      )

      if (fallbackModule0.length > 0) {
        return fallbackModule0[Math.floor(Math.random() * fallbackModule0.length)]
      }

      // Fallback: IDLE with any module
      const idleFallback = allDialogues.filter(
        (d) => d.emotion === 'IDLE' && !isDeduped(d.id)
      )

      if (idleFallback.length > 0) {
        return idleFallback[Math.floor(Math.random() * idleFallback.length)]
      }

      // Last resort: any dialogue (bypass dedup)
      const anyDialogue = allDialogues.filter((d) => d.emotion === targetEmotion)
      return anyDialogue.length > 0
        ? anyDialogue[Math.floor(Math.random() * anyDialogue.length)]
        : null
    },
    [hud.currentModule, isDeduped]
  )

  /** Apply emotion change with cooldown and dialogue selection */
  const applyEmotion = useCallback(
    (newEmotion: MIAEmotion, moduleId?: number) => {
      const now = Date.now()

      // Enforce cooldown (skip if triggered within COOLDOWN_MS)
      if (now - lastEmotionChange.current < COOLDOWN_MS) {
        return
      }

      // Skip if same emotion (avoid redundant resets)
      if (newEmotion === emotion) {
        return
      }

      lastEmotionChange.current = now
      setEmotion(newEmotion)

      const dialogue = selectDialogue(newEmotion, moduleId)
      setCurrentDialogue(dialogue)
      setIsVisible(true)

      if (dialogue) {
        markShown(dialogue.id)
      }
    },
    [emotion, selectDialogue, markShown]
  )

  // ── React to HUD state changes ──────────────────────────────────────────

  // Detect shield damage → SAMPLED_ERROR
  useEffect(() => {
    if (hud.shieldHP < prevShieldHP.current) {
      applyEmotion('SAMPLED_ERROR')
    }
    prevShieldHP.current = hud.shieldHP
  }, [hud.shieldHP, applyEmotion])

  // Detect XP gain → EXCITED
  useEffect(() => {
    if (hud.xp > prevXP.current) {
      applyEmotion('EXCITED')
    }
    prevXP.current = hud.xp
  }, [hud.xp, applyEmotion])

  // Detect challenge completion → EXCITED
  useEffect(() => {
    if (hud.completedChallenges.length > prevCompletedCount.current) {
      applyEmotion('EXCITED')
    }
    prevCompletedCount.current = hud.completedChallenges.length
  }, [hud.completedChallenges.length, applyEmotion])

  // ── Auto-dismiss after delay ────────────────────────────────────────────

  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Clear any pending dismiss timer
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current)
    }

    // When bubble becomes visible, schedule auto-dismiss
    if (isVisible) {
      dismissTimer.current = setTimeout(() => {
        setIsVisible(false)
      }, AUTO_DISMISS_MS)
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current)
      }
    }
  }, [isVisible]) // Re-schedule when visibility changes

  // ── Cleanup on unmount ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      prevShieldHP.current = 0
      prevXP.current = 0
      prevCompletedCount.current = 0
      lastEmotionChange.current = 0
      dedupList.current = []
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current)
      }
    }
  }, [])

  // ── Manual trigger ──────────────────────────────────────────────────────

  const triggerMIA = useCallback(
    (targetEmotion: MIAEmotion, moduleId?: number) => {
      const now = Date.now()

      // Respect cooldown — skip if triggered within COOLDOWN_MS
      if (now - lastEmotionChange.current < COOLDOWN_MS) {
        return
      }

      lastEmotionChange.current = now
      setEmotion(targetEmotion)

      const dialogue = selectDialogue(targetEmotion, moduleId)
      setCurrentDialogue(dialogue)
      setIsVisible(true)

      if (dialogue) {
        markShown(dialogue.id)
      }
    },
    [selectDialogue, markShown]
  )

  // ── Dismiss ─────────────────────────────────────────────────────────────

  const dismissMIA = useCallback(() => {
    setIsVisible(false)
  }, [])

  return {
    emotion,
    currentDialogue,
    isVisible,
    triggerMIA,
    dismissMIA,
  }
}
