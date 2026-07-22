'use client'

import { motion } from 'framer-motion'
import type { MIAEmotion } from '@/types/mia'

interface MiaAvatarProps {
  /** Current emotion for dynamic styling */
  emotion?: MIAEmotion
  /** Color override (border/accent color) */
  color?: string
  /** Size in px (default 64) */
  size?: number
  /** Show pulse ring animation */
  pulse?: boolean
}

/**
 * Emotion → visual accent mapping for avatar internals
 */
const EMOTION_ACCENTS: Record<MIAEmotion, { primary: string; glow: string; eyeStyle: 'normal' | 'happy' | 'worried' | 'thinking' | 'celebrate' }> = {
  IDLE: { primary: '#00f0ff', glow: '#00f0ff', eyeStyle: 'normal' },
  EXCITED: { primary: '#00ff88', glow: '#00ff88', eyeStyle: 'happy' },
  SAMPLED_ERROR: { primary: '#ff00ff', glow: '#ff00ff', eyeStyle: 'worried' },
  MISSION_BRIEF: { primary: '#ffcc00', glow: '#ffcc00', eyeStyle: 'normal' },
  PROVIDING_CLUE: { primary: '#0088ff', glow: '#0088ff', eyeStyle: 'thinking' },
  CORRECT: { primary: '#22c55e', glow: '#22c55e', eyeStyle: 'celebrate' },
  INCORRECT: { primary: '#ef4444', glow: '#ef4444', eyeStyle: 'worried' },
  THINKING: { primary: '#a855f7', glow: '#a855f7', eyeStyle: 'thinking' },
}

/**
 * Illustrated avatar for mIA — friendly female AI assistant with cyberpunk style.
 * Pure SVG, no external assets needed.
 * Features: long flowing purple hair, tech headset, expressive eyes, animated glow.
 */
export default function MiaAvatar({
  emotion = 'IDLE',
  color,
  size = 64,
  pulse = true,
}: MiaAvatarProps) {
  const accent = EMOTION_ACCENTS[emotion]
  const activeColor = color ?? accent.primary

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* ── Outer animated glow ring ───────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${activeColor}cc, transparent 40%, ${activeColor}99, transparent 70%, ${activeColor}cc)`,
        }}
        animate={{
          rotate: [0, 360],
          boxShadow: [
            `0 0 16px ${activeColor}66, 0 0 8px ${activeColor}88, inset 0 0 12px ${activeColor}33`,
            `0 0 24px ${activeColor}88, 0 0 12px ${activeColor}aa, inset 0 0 16px ${activeColor}44`,
            `0 0 16px ${activeColor}66, 0 0 8px ${activeColor}88, inset 0 0 12px ${activeColor}33`,
          ],
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* ── Breathing glow background ──────────────────────────────────────── */}
      <motion.div
        className="absolute inset-1 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${activeColor}22, transparent 70%)`,
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── SVG Avatar ────────────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 w-full h-full drop-shadow-lg"
        style={{
          filter: `drop-shadow(0 0 6px ${activeColor}88) drop-shadow(0 0 12px ${activeColor}44)`,
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Long hair gradient — deep purple to neon violet */}
          <linearGradient id="mia-hair-long" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="40%" stopColor="#9d4edd" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* Hair highlight shimmer */}
          <linearGradient id="mia-hair-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e879f9" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#e879f9" stopOpacity="0.4" />
          </linearGradient>

          {/* Skin tone — warm golden */}
          <radialGradient id="mia-skin-new" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fcd34d" />
          </radialGradient>

          {/* Tech headset gradient — magenta/cyan */}
          <linearGradient id="mia-headset-tech" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Headset glow */}
          <linearGradient id="mia-headset-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={activeColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={activeColor} stopOpacity="0.3" />
          </linearGradient>

          {/* Face clip */}
          <clipPath id="mia-face-clip-new">
            <circle cx="60" cy="54" r="26" />
          </clipPath>

          {/* Neon glow filter */}
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Hair back (long, flowing) ────────────────────────────────────── */}
        <g>
          {/* Main hair volume */}
          <ellipse cx="60" cy="42" rx="34" ry="36" fill="url(#mia-hair-long)" />

          {/* Long flowing hair strands — left side */}
          <path
            d="M26 50 Q22 70 24 95 Q26 105 32 108 Q28 90 30 65 Q28 55 26 50Z"
            fill="url(#mia-hair-long)"
          />
          <path
            d="M30 55 Q26 75 28 100 Q30 110 36 112 Q32 95 34 70 Q32 60 30 55Z"
            fill="url(#mia-hair-long)"
            opacity="0.9"
          />

          {/* Long flowing hair strands — right side */}
          <path
            d="M94 50 Q98 70 96 95 Q94 105 88 108 Q92 90 90 65 Q92 55 94 50Z"
            fill="url(#mia-hair-long)"
          />
          <path
            d="M90 55 Q94 75 92 100 Q90 110 84 112 Q88 95 86 70 Q88 60 90 55Z"
            fill="url(#mia-hair-long)"
            opacity="0.9"
          />

          {/* Hair shimmer overlay */}
          <ellipse
            cx="55"
            cy="35"
            rx="18"
            ry="12"
            fill="url(#mia-hair-shimmer)"
            opacity="0.6"
          />
        </g>

        {/* ── Face ─────────────────────────────────────────────────────────── */}
        <circle cx="60" cy="54" r="26" fill="url(#mia-skin-new)" />

        {/* ── Hair bangs (styled, with volume) ─────────────────────────────── */}
        <path
          d="M34 44 Q42 18 60 16 Q78 18 86 44 Q80 28 60 25 Q40 28 34 44Z"
          fill="url(#mia-hair-long)"
        />
        {/* Bangs highlight */}
        <path
          d="M45 32 Q52 22 60 21 Q68 22 75 32 Q68 26 60 25 Q52 26 45 32Z"
          fill="#c084fc"
          opacity="0.3"
        />

        {/* ── Face details (clipped to face circle) ────────────────────────── */}
        <g clipPath="url(#mia-face-clip-new)">
          {/* ── Eyes — expressive, anime-inspired ──────────────────────────── */}
          <g>
            {/* Left eye — white */}
            <ellipse cx="48" cy="54" rx="6" ry="6.5" fill="white" />
            {/* Left iris */}
            <circle
              cx={emotion === 'EXCITED' || emotion === 'CORRECT' ? 49 : 48}
              cy={emotion === 'THINKING' ? 52 : 54}
              r="3.5"
              fill="#1e293b"
            />
            {/* Left pupil */}
            <circle
              cx={emotion === 'EXCITED' || emotion === 'CORRECT' ? 49.5 : 48.5}
              cy={emotion === 'THINKING' ? 52.5 : 54.5}
              r="1.8"
              fill="black"
            />
            {/* Left eye sparkle */}
            <circle cx="50" cy="52" r="1.2" fill="white" />
            <circle cx="47" cy="55" r="0.6" fill="white" opacity="0.7" />

            {/* Right eye — white */}
            <ellipse cx="72" cy="54" rx="6" ry="6.5" fill="white" />
            {/* Right iris */}
            <circle
              cx={emotion === 'EXCITED' || emotion === 'CORRECT' ? 73 : 72}
              cy={emotion === 'THINKING' ? 52 : 54}
              r="3.5"
              fill="#1e293b"
            />
            {/* Right pupil */}
            <circle
              cx={emotion === 'EXCITED' || emotion === 'CORRECT' ? 73.5 : 72.5}
              cy={emotion === 'THINKING' ? 52.5 : 54.5}
              r="1.8"
              fill="black"
            />
            {/* Right eye sparkle */}
            <circle cx="74" cy="52" r="1.2" fill="white" />
            <circle cx="71" cy="55" r="0.6" fill="white" opacity="0.7" />
          </g>

          {/* ── Eyebrows — expressive based on emotion ────────────────────── */}
          <path
            d={
              emotion === 'SAMPLED_ERROR' || emotion === 'INCORRECT'
                ? 'M42 48 Q48 45 54 48'  /* worried — angled up */
                : emotion === 'EXCITED' || emotion === 'CORRECT'
                  ? 'M42 46 Q48 42 54 44'  /* happy — raised */
                  : 'M42 47 Q48 44 54 47'  /* neutral */
            }
            stroke="#7c3aed"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={
              emotion === 'SAMPLED_ERROR' || emotion === 'INCORRECT'
                ? 'M66 48 Q72 45 78 48'
                : emotion === 'EXCITED' || emotion === 'CORRECT'
                  ? 'M66 44 Q72 42 78 46'
                  : 'M66 47 Q72 44 78 47'
            }
            stroke="#7c3aed"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* ── Blush — more prominent on happy/correct ───────────────────── */}
          <circle
            cx="38"
            cy="60"
            r="5"
            fill="#f472b6"
            opacity={emotion === 'CORRECT' || emotion === 'EXCITED' ? 0.5 : 0.3}
          />
          <circle
            cx="82"
            cy="60"
            r="5"
            fill="#f472b6"
            opacity={emotion === 'CORRECT' || emotion === 'EXCITED' ? 0.5 : 0.3}
          />
        </g>

        {/* ── Nose ─────────────────────────────────────────────────────────── */}
        <path
          d="M58 58 Q60 60 62 58"
          stroke="#d97706"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Mouth — changes with emotion ─────────────────────────────────── */}
        {emotion === 'CORRECT' || emotion === 'EXCITED' ? (
          /* Big happy smile */
          <path
            d="M48 64 Q54 72 60 72 Q66 72 72 64"
            stroke="#dc2626"
            strokeWidth="2.2"
            fill="#fca5a5"
            fillOpacity="0.4"
            strokeLinecap="round"
          />
        ) : emotion === 'INCORRECT' || emotion === 'SAMPLED_ERROR' ? (
          /* Worried frown */
          <path
            d="M50 68 Q60 62 70 68"
            stroke="#dc2626"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        ) : emotion === 'THINKING' ? (
          /* Thinking — small 'o' */
          <ellipse
            cx="60"
            cy="66"
            rx="3"
            ry="2.5"
            stroke="#dc2626"
            strokeWidth="1.8"
            fill="#fca5a5"
            fillOpacity="0.3"
          />
        ) : (
          /* Neutral friendly smile */
          <path
            d="M50 64 Q60 72 70 64"
            stroke="#dc2626"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* ── Tech Headset — magenta/cyan gradient ────────────────────────── */}
        <g filter="url(#neon-glow)">
          {/* Headband */}
          <path
            d="M26 46 Q28 20 60 16 Q92 20 94 46"
            stroke="url(#mia-headset-tech)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Left ear cup — outer */}
          <rect
            x="18"
            y="40"
            width="14"
            height="20"
            rx="7"
            fill="url(#mia-headset-tech)"
          />
          {/* Left ear cup — inner glow */}
          <rect
            x="21"
            y="44"
            width="8"
            height="12"
            rx="4"
            fill="url(#mia-headset-glow)"
          />

          {/* Right ear cup — outer */}
          <rect
            x="88"
            y="40"
            width="14"
            height="20"
            rx="7"
            fill="url(#mia-headset-tech)"
          />
          {/* Right ear cup — inner glow */}
          <rect
            x="91"
            y="44"
            width="8"
            height="12"
            rx="4"
            fill="url(#mia-headset-glow)"
          />
        </g>

        {/* ── Microphone boom ──────────────────────────────────────────────── */}
        <path
          d="M20 58 Q14 62 12 70 Q11 76 14 78"
          stroke="#64748b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="14" cy="78" r="4" fill="#475569" />
        <motion.circle
          cx="14"
          cy="78"
          r="2"
          fill={activeColor}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* ── Small floating tech particles ────────────────────────────────── */}
        {emotion !== 'IDLE' && (
          <g opacity="0.6">
            <motion.circle
              cx="30"
              cy="25"
              r="1.5"
              fill={activeColor}
              animate={{
                cy: [25, 18, 25],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx="90"
              cy="28"
              r="1"
              fill={activeColor}
              animate={{
                cy: [28, 20, 28],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle
              cx="60"
              cy="12"
              r="1.2"
              fill={activeColor}
              animate={{
                cy: [12, 6, 12],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </g>
        )}
      </svg>

      {/* ── Inner ring border ──────────────────────────────────────────────── */}
      <div
        className="absolute inset-[3px] rounded-full pointer-events-none"
        style={{ border: `2px solid ${activeColor}55` }}
      />

      {/* ── Pulse ring (on emotion change) ─────────────────────────────────── */}
      {pulse && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `2px solid ${activeColor}` }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      )}
    </div>
  )
}
