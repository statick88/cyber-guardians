'use client'

import { motion } from 'framer-motion'

interface MiaAvatarProps {
  /** Current emotion border color */
  color?: string
  /** Size in px (default 48) */
  size?: number
  /** Show pulse ring animation */
  pulse?: boolean
}

/**
 * Illustrated avatar for mIA — friendly female AI assistant.
 * Pure SVG, no external assets needed.
 */
export default function MiaAvatar({
  color = '#00f0ff',
  size = 48,
  pulse = true,
}: MiaAvatarProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${color}, transparent, ${color})`,
          boxShadow: `0 0 12px ${color}55, 0 0 4px ${color}88`,
        }}
      />

      {/* SVG Avatar */}
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          {/* Hair gradient */}
          <linearGradient id="mia-hair" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          {/* Skin tone */}
          <radialGradient id="mia-skin" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fbbf24" />
          </radialGradient>

          {/* Headset gradient */}
          <linearGradient id="mia-headset" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Face mask clip */}
          <clipPath id="mia-face-clip">
            <circle cx="60" cy="52" r="28" />
          </clipPath>
        </defs>

        {/* Hair back */}
        <ellipse
          cx="60"
          cy="45"
          rx="32"
          ry="34"
          fill="url(#mia-hair)"
        />

        {/* Face */}
        <circle
          cx="60"
          cy="52"
          r="28"
          fill="url(#mia-skin)"
        />

        {/* Hair bangs */}
        <path
          d="M32 42 Q40 20 60 18 Q80 20 88 42 Q82 30 60 28 Q38 30 32 42Z"
          fill="url(#mia-hair)"
        />

        {/* Hair sides */}
        <path
          d="M30 48 Q28 38 32 30 Q30 50 30 48Z"
          fill="url(#mia-hair)"
        />
        <path
          d="M90 48 Q92 38 88 30 Q90 50 90 48Z"
          fill="url(#mia-hair)"
        />

        {/* Eyes — big expressive */}
        <g clipPath="url(#mia-face-clip)">
          {/* Left eye */}
          <ellipse cx="48" cy="52" rx="5" ry="5.5" fill="white" />
          <circle cx="49" cy="51.5" r="3" fill="#1e293b" />
          <circle cx="50" cy="50.5" r="1.2" fill="white" />

          {/* Right eye */}
          <ellipse cx="72" cy="52" rx="5" ry="5.5" fill="white" />
          <circle cx="73" cy="51.5" r="3" fill="#1e293b" />
          <circle cx="74" cy="50.5" r="1.2" fill="white" />

          {/* Eyebrows */}
          <path
            d="M42 46 Q48 43 54 46"
            stroke="#7c3aed"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M66 46 Q72 43 78 46"
            stroke="#7c3aed"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />

          {/* Blush */}
          <circle cx="40" cy="58" r="4" fill="#f472b6" opacity="0.35" />
          <circle cx="80" cy="58" r="4" fill="#f472b6" opacity="0.35" />
        </g>

        {/* Nose */}
        <path
          d="M58 56 Q60 58 62 56"
          stroke="#d97706"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Mouth — friendly smile */}
        <path
          d="M50 62 Q60 70 70 62"
          stroke="#dc2626"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Headset band */}
        <path
          d="M28 45 Q30 22 60 18 Q90 22 92 45"
          stroke="url(#mia-headset)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Left ear cup */}
        <rect
          x="22"
          y="42"
          width="10"
          height="16"
          rx="5"
          fill="url(#mia-headset)"
        />
        <rect
          x="24"
          y="45"
          width="6"
          height="10"
          rx="3"
          fill={color}
          opacity="0.6"
        />

        {/* Right ear cup */}
        <rect
          x="88"
          y="42"
          width="10"
          height="16"
          rx="5"
          fill="url(#mia-headset)"
        />
        <rect
          x="90"
          y="45"
          width="6"
          height="10"
          rx="3"
          fill={color}
          opacity="0.6"
        />

        {/* Microphone boom */}
        <path
          d="M24 56 Q18 60 16 68 Q15 72 18 74"
          stroke="#475569"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="18" cy="74" r="3" fill="#64748b" />
        <circle cx="18" cy="74" r="1.5" fill={color} opacity="0.7" />
      </svg>

      {/* Inner ring */}
      <div
        className="absolute inset-[3px] rounded-full pointer-events-none"
        style={{ border: `2px solid ${color}44` }}
      />

      {/* Pulse ring */}
      {pulse && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `2px solid ${color}` }}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}
    </div>
  )
}
