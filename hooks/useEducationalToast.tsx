'use client'

import { toast, type ExternalToast } from 'sonner'
import {
  CheckCircle,
  Lightbulb,
  BookOpen,
  GraduationCap,
} from 'lucide-react'

const BASE_DURATION = 6000
const WORKED_EXAMPLE_DURATION = 10000

const glassStyle = 'glass-card neon-border'

/**
 * Centralized educational toast notifications.
 * Wraps sonner's toast with themed variants for each feedback type.
 */
export function useEducationalToast() {
  function showFeedback(message: string, opts?: ExternalToast) {
    toast(message, {
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      duration: BASE_DURATION,
      className: glassStyle,
      ...opts,
    })
  }

  function showScaffolding(message: string, opts?: ExternalToast) {
    toast(message, {
      icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
      duration: BASE_DURATION,
      className: glassStyle,
      ...opts,
    })
  }

  function showConcept(message: string, opts?: ExternalToast) {
    toast(message, {
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
      duration: BASE_DURATION,
      className: glassStyle,
      ...opts,
    })
  }

  function showWorkedExample(message: string, opts?: ExternalToast) {
    toast(message, {
      icon: <GraduationCap className="w-4 h-4 text-purple-400" />,
      duration: WORKED_EXAMPLE_DURATION,
      className: glassStyle,
      ...opts,
    })
  }

  return { showFeedback, showScaffolding, showConcept, showWorkedExample }
}
