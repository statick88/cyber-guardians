'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { ScaffoldingTip } from '@/types/educational'

interface TipBadgeProps {
  tip: ScaffoldingTip
  onDismiss?: () => void
  autoDismissMs?: number
}

/**
 * TipBadge — small animated pill showing the current scaffolding hint.
 *
 * Slides up and fades in on mount. Different border color per level:
 * explicit = amber (warning), guided = cyan, implicit = emerald, withdrawn = hidden.
 * Auto-dismisses after configurable time (default 8s).
 */
export default function TipBadge({ tip, onDismiss, autoDismissMs = 8000 }: TipBadgeProps) {
  if (tip.level === 'withdrawn' || !tip.hint) return null

  const levelColors: Record<string, string> = {
    explicit: 'border-amber-500/30 text-amber-300',
    guided: 'border-cyan-500/30 text-cyan-300',
    implicit: 'border-emerald-500/30 text-emerald-300',
  }

  const colorClass = levelColors[tip.level] ?? 'border-cyan-500/30 text-cyan-300'

  // Auto-dismiss
  useEffect(() => {
    if (!onDismiss) return
    const timer = setTimeout(onDismiss, autoDismissMs)
    return () => clearTimeout(timer)
  }, [onDismiss, autoDismissMs])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${colorClass}`}
    >
      <span className="font-medium mr-2 opacity-60 uppercase text-[10px]">
        {tip.level}
      </span>
      {tip.hint}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-2 opacity-50 hover:opacity-100"
          aria-label="Descartar pista"
        >
          ×
        </button>
      )}
    </motion.div>
  )
}
