'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useMIA } from '@/hooks/useMIA'
import type { MIAEmotion } from '@/types/mia'

// ── Emotion → visual mapping ──────────────────────────────────────────────────

const EMOTION_STYLES: Record<
  MIAEmotion,
  { border: string; glow: string; label: string; emoji: string; color: string }
> = {
  IDLE: {
    border: '#00f0ff',
    glow: '0 0 12px rgba(0,240,255,0.35), 0 0 4px rgba(0,240,255,0.5)',
    label: 'Neutro',
    emoji: ' ',
    color: '#00f0ff',
  },
  EXCITED: {
    border: '#00ff88',
    glow: '0 0 14px rgba(0,255,136,0.4), 0 0 6px rgba(0,255,136,0.5)',
    label: 'Entusiasmado',
    emoji: '⚡',
    color: '#00ff88',
  },
  SAMPLED_ERROR: {
    border: '#ff00ff',
    glow: '0 0 14px rgba(255,0,255,0.4), 0 0 6px rgba(255,0,255,0.5)',
    label: 'Preocupado',
    emoji: ' ',
    color: '#ff00ff',
  },
  MISSION_BRIEF: {
    border: '#ffcc00',
    glow: '0 0 14px rgba(255,204,0,0.4), 0 0 6px rgba(255,204,0,0.5)',
    label: 'Misión',
    emoji: ' ',
    color: '#ffcc00',
  },
  PROVIDING_CLUE: {
    border: '#0088ff',
    glow: '0 0 14px rgba(0,136,255,0.4), 0 0 6px rgba(0,136,255,0.5)',
    label: 'Pista',
    emoji: ' ',
    color: '#0088ff',
  },
}

// ── Comic-neon clip-path (angular speech bubble) ──────────────────────────────

const BUBBLE_CLIP_PATH =
  'polygon(0% 0%, 100% 0%, 100% 82%, 88% 82%, 78% 100%, 72% 82%, 0% 82%)'

// ── Typewriter speed (ms per character) ───────────────────────────────────────

const TYPEWRITER_SPEED_MS = 30

// ── Component ─────────────────────────────────────────────────────────────────

export default function MIAAgent() {
  const { emotion, currentDialogue, isVisible, dismissMIA } = useMIA()
  const prefersReducedMotion = useReducedMotion()

  const style = EMOTION_STYLES[emotion] ?? EMOTION_STYLES.IDLE

  // ── Typewriter state ──────────────────────────────────────────────────────

  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clear typewriter interval on cleanup
  const clearTypewriter = useCallback(() => {
    if (typewriterRef.current !== null) {
      clearInterval(typewriterRef.current)
      typewriterRef.current = null
    }
  }, [])

  // Start typewriter when dialogue changes
  useEffect(() => {
    clearTypewriter()

    if (!currentDialogue || !isVisible) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    const fullText = currentDialogue.text

    // If reduced motion, show full text instantly
    if (prefersReducedMotion) {
      setDisplayedText(fullText)
      setIsTyping(false)
      return
    }

    // Typewriter: reveal one character at a time
    setDisplayedText('')
    setIsTyping(true)
    let charIndex = 0

    typewriterRef.current = setInterval(() => {
      charIndex++
      if (charIndex >= fullText.length) {
        setDisplayedText(fullText)
        setIsTyping(false)
        clearTypewriter()
      } else {
        setDisplayedText(fullText.slice(0, charIndex))
      }
    }, TYPEWRITER_SPEED_MS)

    return clearTypewriter
  }, [currentDialogue?.id, isVisible, prefersReducedMotion, clearTypewriter])

  // Click-to-reveal: show full text and stop typewriter
  const handleRevealAll = useCallback(() => {
    if (isTyping && currentDialogue) {
      clearTypewriter()
      setDisplayedText(currentDialogue.text)
      setIsTyping(false)
    }
  }, [isTyping, currentDialogue, clearTypewriter])

  // ── Avatar animation variants ─────────────────────────────────────────────

  const avatarVariants = {
    initial: { scale: 1 },
    idle: { scale: 1 },
    excited: {
      scale: [1, 1.15, 1],
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
        repeat: Infinity,
        repeatDelay: 1.5,
      },
    },
    error: {
      x: [0, -4, 4, -4, 4, 0],
      transition: { duration: 0.4 },
    },
    missionBrief: { scale: 1 },
    providingClue: {
      scale: [1, 1.05, 1],
      transition: { duration: 1.2, repeat: Infinity, repeatDelay: 2 },
    },
  }

  const getAvatarVariant = (em: MIAEmotion) => {
    if (prefersReducedMotion) return 'idle'
    switch (em) {
      case 'EXCITED':
        return 'excited'
      case 'SAMPLED_ERROR':
        return 'error'
      case 'MISSION_BRIEF':
        return 'missionBrief'
      case 'PROVIDING_CLUE':
        return 'providingClue'
      default:
        return 'idle'
    }
  }

  // ── Bubble animation ─────────────────────────────────────────────────────

  const bubbleVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 20, scale: 0.92 },
    visible: prefersReducedMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 260, damping: 22, mass: 0.8 },
        },
    exit: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } },
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed bottom-20 right-4 md:right-8 z-40 flex flex-col items-end gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="MIA — agente de apoyo"
    >
      {/* ── Speech Bubble ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isVisible && currentDialogue && (
          <motion.div
            key={currentDialogue.id}
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pointer-events-auto w-72"
            style={{ clipPath: BUBBLE_CLIP_PATH }}
          >
            <div
              className="
                relative
                w-full
                bg-[#0d1117]/95 backdrop-blur-md
                border border-white/10
                px-4 pt-3 pb-5
                cursor-pointer
                select-none
                transition-colors duration-200
              "
              style={{
                boxShadow: style.glow,
                borderColor: `${style.border}44`,
              }}
              title="Clic para cerrar"
              onClick={(e) => {
                handleRevealAll()
                // If not typing, dismiss on click
                if (!isTyping) {
                  dismissMIA()
                }
              }}
            >
              {/* Header: emotion label */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm leading-none">{style.emoji}</span>
                <span
                  className="font-mono text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: `${style.border}aa` }}
                >
                  {style.label}
                </span>
              </div>

              {/* Dialogue text with typewriter */}
              <p className="text-sm leading-relaxed text-slate-200 min-h-[2.5rem]">
                {displayedText}
                {isTyping && (
                  <span
                    className="inline-block w-[2px] h-3.5 ml-0.5 align-middle"
                    style={{
                      backgroundColor: style.border,
                      animation: 'blink 0.7s step-end infinite',
                    }}
                  />
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Avatar ─────────────────────────────────────────────────────────── */}
      <motion.div
        className="pointer-events-auto relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer"
        style={{
          background: `conic-gradient(from 0deg, ${style.border}, #0d1117, ${style.border})`,
          boxShadow: style.glow,
        }}
        variants={avatarVariants}
        initial="initial"
        animate={getAvatarVariant(emotion)}
        onClick={dismissMIA}
        title="MIA — clic para cerrar"
        aria-label={`MIA avatar — estado: ${style.label}`}
      >
        {/* Inner ring */}
        <div className="absolute inset-[3px] rounded-full bg-[#0d1117] flex items-center justify-center">
          <span className="text-lg leading-none">{style.emoji}</span>
        </div>
        {/* Pulse ring on emotion change */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${style.border}` }}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={
            prefersReducedMotion
              ? { scale: 1, opacity: 0 }
              : { scale: [1, 1.3], opacity: [0.5, 0] }
          }
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </motion.div>

      {/* ── Keyframes for blinking cursor ──────────────────────────────────── */}
      <style jsx global>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
