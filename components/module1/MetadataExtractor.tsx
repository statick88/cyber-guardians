'use client'

/**
 * MetadataExtractor — "Escaner de Rayos X"
 * Module 1 minigame: scan images for hidden EXIF metadata and purge or approve based on classification.
 *
 * @module components/module1/MetadataExtractor
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHUD } from '@/components/HUDProvider'
import useAudioSynth from '@/hooks/useAudioSynth'
import useQuizSound from '@/hooks/useQuizSound'
import type {
  SuspiciousImage,
  MetadataExtractorConfig,
  MetadataField,
} from '@/types/module1'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: MetadataExtractorConfig = {
  timeLimit: 120,
  xpPerPurge: 25,
  damagePerLeak: 12,
  imageCount: 5,
}

const STORAGE_KEY = 'cg_2026_module1' as const

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------

const CLASSIFICATION_CONFIG: Record<
  SuspiciousImage['classification'],
  { label: string; color: string; bgColor: string; borderColor: string; needsPurge: boolean }
> = {
  public: {
    label: 'PÚBLICO',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/40',
    needsPurge: false,
  },
  internal: {
    label: 'INTERNO',
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/15',
    borderColor: 'border-yellow-500/40',
    needsPurge: false,
  },
  confidential: {
    label: 'CONFIDENCIAL',
    color: 'text-orange-300',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/40',
    needsPurge: true,
  },
  secret: {
    label: 'SECRETO',
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/40',
    needsPurge: true,
  },
}

const FIELD_ICONS: Record<MetadataField, string> = {
  gps: '📍',
  device: '📱',
  date: '📅',
  software: '💻',
  camera: '📷',
  resolution: '📐',
  orientation: '🧭',
}

// ── Deepfake detection indicators (Module 5 crossover) ─────────────

const DEEPFAKE_INDICATORS = [
  { field: 'AI_Generated', label: 'IA Generado', severity: 'alta' as const },
  { field: 'Synthetic_Media', label: 'Medio Sintético', severity: 'alta' as const },
  { field: 'Face_Swap_Detected', label: 'Face Swap Detectado', severity: 'critica' as const },
  { field: 'Voice_Clone_Detected', label: 'Voz Clonada Detectada', severity: 'critica' as const },
]

const SEVERITY_CONFIG = {
  critica: { label: 'CRÍTICA', color: 'text-rose-400', bgColor: 'bg-rose-500/20', borderColor: 'border-rose-500/50' },
  alta: { label: 'ALTA', color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/50' },
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

function createSampleImages(): SuspiciousImage[] {
  return [
    {
      id: 'img-001',
      filename: 'foto_playa.jpg',
      thumbnailUrl: '',
      classification: 'public',
      scanned: false,
      action: null,
      metadata: [
        { field: 'gps', label: 'Coordenadas GPS', value: '40.4531, -3.7197 (Madrid, ES)', isSensitive: false },
        { field: 'device', label: 'Dispositivo', value: 'Apple iPhone 15 Pro', isSensitive: false },
        { field: 'date', label: 'Fecha de captura', value: '2026-03-14 15:42:08 UTC', isSensitive: false },
        { field: 'resolution', label: 'Resolución', value: '4032 × 3024 px', isSensitive: false },
        { field: 'orientation', label: 'Orientación', value: 'Horizontal (normal)', isSensitive: false },
      ],
    },
    {
      id: 'img-002',
      filename: 'reunion_ejecutiva.png',
      thumbnailUrl: '',
      classification: 'confidential',
      scanned: false,
      action: null,
      metadata: [
        { field: 'gps', label: 'Coordenadas GPS', value: '34.0522, -118.2437 (Los Angeles, US)', isSensitive: true },
        { field: 'device', label: 'Dispositivo', value: 'Samsung Galaxy S24 Ultra', isSensitive: false },
        { field: 'date', label: 'Fecha de captura', value: '2026-06-21 09:15:33 UTC', isSensitive: true },
        { field: 'software', label: 'Software de edición', value: 'Adobe Photoshop 25.4.0', isSensitive: true },
        { field: 'camera', label: 'Cámara', value: 'Samsung ISOCELL HP2', isSensitive: false },
        { field: 'resolution', label: 'Resolución', value: '12000 × 9000 px', isSensitive: false },
      ],
    },
    {
      id: 'img-003',
      filename: 'prototipo_secreto.jpg',
      thumbnailUrl: '',
      classification: 'secret',
      scanned: false,
      action: null,
      metadata: [
        { field: 'gps', label: 'Coordenadas GPS', value: '51.5074, -0.1278 (London, UK)', isSensitive: true },
        { field: 'device', label: 'Dispositivo', value: 'Canon EOS R5 Mark II', isSensitive: true },
        { field: 'date', label: 'Fecha de captura', value: '2026-07-02 11:08:45 UTC', isSensitive: true },
        { field: 'software', label: 'Software de edición', value: 'Capture One Pro 23', isSensitive: true },
        { field: 'camera', label: 'Cámara', value: 'Canon 45MP Full-Frame CMOS', isSensitive: false },
        { field: 'resolution', label: 'Resolución', value: '8192 × 5464 px', isSensitive: false },
        { field: 'orientation', label: 'Orientación', value: 'Horizontal (normal)', isSensitive: false },
      ],
    },
    {
      id: 'img-004',
      filename: 'diagrama_red.png',
      thumbnailUrl: '',
      classification: 'internal',
      scanned: false,
      action: null,
      metadata: [
        { field: 'device', label: 'Dispositivo', value: 'Dell XPS 15 9530', isSensitive: false },
        { field: 'date', label: 'Fecha de captura', value: '2026-04-18 14:22:11 UTC', isSensitive: false },
        { field: 'software', label: 'Software de creación', value: 'Microsoft Visio 2024', isSensitive: false },
        { field: 'resolution', label: 'Resolución', value: '3840 × 2160 px', isSensitive: false },
      ],
    },
    {
      id: 'img-005',
      filename: 'servidor_fisico.jpg',
      thumbnailUrl: '',
      classification: 'confidential',
      scanned: false,
      action: null,
      metadata: [
        { field: 'gps', label: 'Coordenadas GPS', value: '48.8566, 2.3522 (Paris, FR)', isSensitive: true },
        { field: 'device', label: 'Dispositivo', value: 'Google Pixel 8 Pro', isSensitive: false },
        { field: 'date', label: 'Fecha de captura', value: '2026-05-30 08:47:22 UTC', isSensitive: true },
        { field: 'camera', label: 'Cámara', value: 'Google GN2 50MP', isSensitive: false },
        { field: 'resolution', label: 'Resolución', value: '12000 × 9000 px', isSensitive: false },
        { field: 'orientation', label: 'Orientación', value: 'Vertical (rotated 90°)', isSensitive: false },
      ],
    },
    {
      id: 'img-006',
      filename: 'boceto_interfaz.jpg',
      thumbnailUrl: '',
      classification: 'secret',
      scanned: false,
      action: null,
      metadata: [
        { field: 'gps', label: 'Coordenadas GPS', value: '35.6762, 139.6503 (Tokyo, JP)', isSensitive: true },
        { field: 'device', label: 'Dispositivo', value: 'iPad Pro M4 13"', isSensitive: false },
        { field: 'date', label: 'Fecha de captura', value: '2026-07-10 23:15:07 UTC', isSensitive: true },
        { field: 'software', label: 'Software de diseño', value: 'Figma Desktop 124.0', isSensitive: true },
        { field: 'camera', label: 'Cámara', value: 'iPad Pro LiDAR + Wide', isSensitive: false },
        { field: 'resolution', label: 'Resolución', value: '4096 × 3072 px', isSensitive: false },
        { field: 'orientation', label: 'Orientación', value: 'Horizontal (normal)', isSensitive: false },
      ],
    },
  ]
}

// ---------------------------------------------------------------------------
// Thumbnail placeholder
// ---------------------------------------------------------------------------

function ThumbnailPlaceholder({ classification, filename }: { classification: SuspiciousImage['classification']; filename: string }) {
  const bgMap: Record<SuspiciousImage['classification'], string> = {
    public: 'from-emerald-900/60 to-emerald-800/40',
    internal: 'from-yellow-900/60 to-yellow-800/40',
    confidential: 'from-orange-900/60 to-orange-800/40',
    secret: 'from-rose-900/60 to-rose-800/40',
  }
  const iconMap: Record<SuspiciousImage['classification'], string> = {
    public: '🌍',
    internal: '🏢',
    confidential: '🔒',
    secret: '🗝️',
  }

  return (
    <div
      className={`w-full aspect-[4/3] rounded bg-gradient-to-br ${bgMap[classification]} flex flex-col items-center justify-center gap-1 border border-white/5`}
    >
      <span className="text-2xl" role="img" aria-label="thumbnail">
        {iconMap[classification]}
      </span>
      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[90%] text-center px-1">
        {filename}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Circular timer
// ---------------------------------------------------------------------------

function CircularTimer({
  timeRemaining,
  totalTime,
}: {
  timeRemaining: number
  totalTime: number
}) {
  const pct = totalTime > 0 ? timeRemaining / totalTime : 0
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)

  const color =
    pct > 0.5
      ? '#34d399'
      : pct > 0.25
        ? '#fbbf24'
        : '#f43f5e'

  const displayMin = Math.floor(timeRemaining / 60)
  const displaySec = timeRemaining % 60

  return (
    <div className="relative w-[72px] h-[72px]">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="4"
        />
        <motion.circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-sm font-mono font-bold tabular-nums"
          style={{ color }}
        >
          {displayMin}:{displaySec.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Scanner viewport
// ---------------------------------------------------------------------------

function ScannerViewport({
  image,
  scanProgress,
  revealedFields,
  isScanning,
}: {
  image: SuspiciousImage | null
  scanProgress: number
  revealedFields: number
  isScanning: boolean
}) {
  if (!image) {
    return (
      <div className="relative w-full aspect-[4/3] rounded-lg border border-cyan-500/20 bg-slate-950/80 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(34,211,238,0.02)_2px,rgba(34,211,238,0.02)_4px)]" />
        <div className="text-center z-10">
          <div className="text-4xl mb-2 opacity-30">🔭</div>
          <p className="text-slate-600 text-sm font-mono">
            Selecciona una imagen del buzón para escanear
          </p>
        </div>
      </div>
    )
  }

  const classConfig = CLASSIFICATION_CONFIG[image.classification]

  return (
    <div className="relative w-full aspect-[4/3] rounded-lg border border-cyan-500/30 bg-slate-950/80 overflow-hidden">
      {/* Scan lines overlay */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(34,211,238,0.015)_2px,rgba(34,211,238,0.015)_4px)] z-20 pointer-events-none" />

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400/60 z-20" />
      <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400/60 z-20" />
      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400/60 z-20" />
      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400/60 z-20" />

      {/* Image thumbnail area */}
      <div className="absolute inset-4 z-10">
        <ThumbnailPlaceholder classification={image.classification} filename={image.filename} />
      </div>

      {/* Filename + classification badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        <span className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700/50">
          {image.filename}
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${classConfig.bgColor} ${classConfig.color} ${classConfig.borderColor}`}
        >
          {classConfig.label}
        </span>
      </div>

      {/* Animated laser beam */}
      {isScanning && (
        <motion.div
          className="absolute left-0 right-0 h-[2px] z-20 pointer-events-none"
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{ duration: 2.5, ease: 'linear' }}
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.1) 20%, rgba(34,211,238,0.8) 45%, #22d3ee 50%, rgba(34,211,238,0.8) 55%, rgba(34,211,238,0.1) 80%, transparent 100%)',
            boxShadow:
              '0 0 12px 4px rgba(34,211,238,0.4), 0 0 30px 8px rgba(34,211,238,0.15)',
          }}
        />
      )}

      {/* Laser glow trail */}
      {isScanning && (
        <motion.div
          className="absolute left-0 right-0 h-16 z-19 pointer-events-none"
          initial={{ top: '-64px' }}
          animate={{ top: '100%' }}
          transition={{ duration: 2.5, ease: 'linear' }}
          style={{
            background:
              'linear-gradient(180deg, transparent, rgba(34,211,238,0.05), rgba(34,211,238,0.02), transparent)',
          }}
        />
      )}

      {/* Scan progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 z-20">
        <motion.div
          className="h-full bg-cyan-400"
          style={{ boxShadow: '0 0 8px rgba(34,211,238,0.6)' }}
          animate={{ width: `${scanProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Decoded metadata fields overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-30 space-y-1">
        {image.metadata.slice(0, revealedFields).map((entry, i) => (
          <motion.div
            key={entry.field}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className={`flex items-center gap-2 text-[11px] font-mono px-2 py-1 rounded backdrop-blur-sm ${
              entry.isSensitive
                ? 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                : 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/20'
            }`}
          >
            <span>{FIELD_ICONS[entry.field]}</span>
            <span className="text-slate-500 shrink-0">{entry.label}:</span>
            <span className={`truncate ${entry.isSensitive ? 'text-rose-200' : 'text-cyan-200'}`}>
              {entry.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface MetadataExtractorProps {
  onComplete: (score: number, xpEarned: number) => void
  config?: Partial<MetadataExtractorConfig>
}

export default function MetadataExtractor({
  onComplete,
  config: configOverrides,
}: MetadataExtractorProps) {
  const mergedConfig: MetadataExtractorConfig = {
    ...DEFAULT_CONFIG,
    ...configOverrides,
  }

  const { damageShield, addXP } = useHUD()
  const audio = useAudioSynth()
  const { playCorrect, playIncorrect } = useQuizSound()

  // --- Game state (refs for animation timers) ---
  const [images, setImages] = useState<SuspiciousImage[]>(() =>
    createSampleImages().slice(0, mergedConfig.imageCount),
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [revealedFields, setRevealedFields] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(mergedConfig.timeLimit)
  const [score, setScore] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [correctPurges, setCorrectPurges] = useState(0)
  const [missedLeaks, setMissedLeaks] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isVictory, setIsVictory] = useState(false)
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [showScanComplete, setShowScanComplete] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmountRef = useRef(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unmountRef.current = true
      if (timerRef.current) clearInterval(timerRef.current)
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current)
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
    }
  }, [])

  // --- Global timer ---
  useEffect(() => {
    if (isGameOver) return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isGameOver])

  // --- Game over when timer hits 0 ---
  useEffect(() => {
    if (timeRemaining <= 0 && !isGameOver) {
      // Auto-fail any remaining images
      setImages((prev) => {
        const updated = prev.map((img) => {
          if (img.action === null) {
            return { ...img, action: 'fail' as const, scanned: true }
          }
          return img
        })
        // Count leaks
        const leaks = updated.filter(
          (img) => img.action === 'fail' && img.classification !== 'public',
        ).length
        setMissedLeaks((prev) => prev + leaks)
        if (leaks > 0) {
          damageShield(mergedConfig.damagePerLeak * leaks)
          audio.playAlarm()
        }
        return updated
      })
      handleGameOver(false)
    }
  }, [timeRemaining]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Check if all images processed ---
  useEffect(() => {
    if (isGameOver) return
    const allProcessed = images.every((img) => img.action !== null)
    if (allProcessed && images.length > 0) {
      handleGameOver(true)
    }
  }, [images, isGameOver]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Game over handler ---
  const handleGameOver = useCallback(
    (victory: boolean) => {
      if (unmountRef.current) return
      setIsGameOver(true)
      setIsVictory(victory)
      if (timerRef.current) clearInterval(timerRef.current)

      if (victory) {
        audio.playSuccessArpeggio()
      } else {
        audio.playFailureSiren()
      }

      // Persist results
      if (typeof window !== 'undefined') {
        try {
          const existing = localStorage.getItem(STORAGE_KEY)
          const parsed: Record<string, unknown> = existing ? JSON.parse(existing) : {}
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              ...parsed,
              lastScore: score,
              lastXpEarned: xpEarned,
              lastCorrectPurges: correctPurges,
              lastMissedLeaks: missedLeaks,
              lastVictory: victory,
              lastTimestamp: Date.now(),
            }),
          )
        } catch {
          // Silent fail for localStorage
        }
      }
    },
    [score, xpEarned, correctPurges, missedLeaks, audio],
  )

  // --- Select image from queue ---
  const handleSelectImage = useCallback(
    (id: string) => {
      if (isScanning || isGameOver) return
      const img = images.find((i) => i.id === id)
      if (!img || img.action !== null) return

      audio.playClick()
      setSelectedId(id)
      setIsScanning(true)
      setScanProgress(0)
      setRevealedFields(0)
      setShowScanComplete(false)
      audio.playWarningPulse()

      const totalFields = img.metadata.length
      const scanDuration = 2500 // ms
      const fieldInterval = scanDuration / totalFields

      // Progress ticker
      let elapsed = 0
      scanIntervalRef.current = setInterval(() => {
        elapsed += 50
        const newProgress = Math.min((elapsed / scanDuration) * 100, 100)
        setScanProgress(newProgress)
      }, 50)

      // Reveal fields one by one
      let fieldIndex = 0
      const revealNext = () => {
        if (unmountRef.current) return
        fieldIndex++
        setRevealedFields(fieldIndex)
        if (fieldIndex < totalFields) {
          scanTimerRef.current = setTimeout(revealNext, fieldInterval)
        } else {
          // Scan complete
          setTimeout(() => {
            if (unmountRef.current) return
            setIsScanning(false)
            setShowScanComplete(true)
            if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
          }, 300)
        }
      }
      scanTimerRef.current = setTimeout(revealNext, fieldInterval)
    },
    [images, isScanning, isGameOver, audio],
  )

  // --- Purge EXIF ---
  const handlePurge = useCallback(() => {
    if (!selectedId || isScanning || isGameOver) return
    audio.playClick()

    const img = images.find((i) => i.id === selectedId)
    if (!img || img.action !== null) return

    const classConfig = CLASSIFICATION_CONFIG[img.classification]
    const isCorrect = classConfig.needsPurge

    if (isCorrect) {
      playCorrect()
      audio.playSuccess()
      const xpGain = mergedConfig.xpPerPurge
      addXP(xpGain)
      setXpEarned((prev) => prev + xpGain)
      setScore((prev) => prev + 100)
      setCorrectPurges((prev) => prev + 1)
      setResultMessage({ type: 'success', text: `✅ EXIF purgado correctamente. +${xpGain} XP` })
    } else {
      audio.playAlarm()
      damageShield(mergedConfig.damagePerLeak)
      setMissedLeaks((prev) => prev + 1)
      setResultMessage({
        type: 'error',
        text: `❌ Error: imagen ${classConfig.label} no requería purgado. Filtración de datos.`,
      })
    }

    setImages((prev) =>
      prev.map((i) => (i.id === selectedId ? { ...i, action: 'purge', scanned: true } : i)),
    )

    resultTimeoutRef.current = setTimeout(() => {
      setSelectedId(null)
      setShowScanComplete(false)
      setResultMessage(null)
    }, 2000)
  }, [selectedId, isScanning, isGameOver, images, audio, addXP, damageShield, mergedConfig])

  // --- Approve safe send ---
  const handleApprove = useCallback(() => {
    if (!selectedId || isScanning || isGameOver) return
    audio.playClick()

    const img = images.find((i) => i.id === selectedId)
    if (!img || img.action !== null) return

    const classConfig = CLASSIFICATION_CONFIG[img.classification]
    const isCorrect = !classConfig.needsPurge

    if (isCorrect) {
      playCorrect()
      audio.playSuccess()
      const xpGain = mergedConfig.xpPerPurge
      addXP(xpGain)
      setXpEarned((prev) => prev + xpGain)
      setScore((prev) => prev + 100)
      setCorrectPurges((prev) => prev + 1)
      setResultMessage({
        type: 'success',
        text: `✅ Envío seguro aprobado. +${xpGain} XP`,
      })
    } else {
      playIncorrect()
      audio.playAlarm()
      damageShield(mergedConfig.damagePerLeak)
      setMissedLeaks((prev) => prev + 1)
      setResultMessage({
        type: 'error',
        text: `❌ Filtración: imagen ${classConfig.label} enviada con metadatos sensibles.`,
      })
    }

    setImages((prev) =>
      prev.map((i) => (i.id === selectedId ? { ...i, action: 'approve', scanned: true } : i)),
    )

    resultTimeoutRef.current = setTimeout(() => {
      setSelectedId(null)
      setShowScanComplete(false)
      setResultMessage(null)
    }, 2000)
  }, [selectedId, isScanning, isGameOver, images, audio, addXP, damageShield, mergedConfig])

  // --- Complete ---
  const handleComplete = useCallback(() => {
    onComplete(score, xpEarned)
  }, [onComplete, score, xpEarned])

  // Derived
  const selectedImage = images.find((i) => i.id === selectedId) ?? null
  const processedCount = images.filter((i) => i.action !== null).length
  const totalCount = images.length

  // ----- RENDER -----

  return (
    <div className="min-h-screen bg-cyber-bg text-white">
      {/* Top HUD bar */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-cyan-500/20 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-cyan-400 font-mono tracking-wider uppercase">
              📡 Escáner de Rayos X
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              {processedCount}/{totalCount} procesadas
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Score */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 font-mono text-xs">SCORE</span>
              <motion.span
                key={score}
                initial={{ scale: 1.3, color: '#22d3ee' }}
                animate={{ scale: 1, color: '#e2e8f0' }}
                className="font-mono font-bold tabular-nums text-slate-200"
              >
                {score}
              </motion.span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 font-mono text-xs">XP</span>
              <motion.span
                key={xpEarned}
                initial={{ scale: 1.3, color: '#a78bfa' }}
                animate={{ scale: 1, color: '#c4b5fd' }}
                className="font-mono font-bold tabular-nums text-purple-300"
              >
                +{xpEarned}
              </motion.span>
            </div>

            {/* Timer */}
            <CircularTimer timeRemaining={timeRemaining} totalTime={mergedConfig.timeLimit} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left: Image queue */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                📥 Buzón de entrada
              </span>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {images.map((img, idx) => {
                const classConfig = CLASSIFICATION_CONFIG[img.classification]
                const isSelected = img.id === selectedId
                const isProcessed = img.action !== null
                const isLeaked = img.action === 'fail'
                const isPurged = img.action === 'purge'
                const isApproved = img.action === 'approve'

                return (
                  <motion.button
                    key={img.id}
                    onClick={() => handleSelectImage(img.id)}
                    onMouseEnter={() => {
                      if (!isProcessed) audio.playHover()
                    }}
                    disabled={isProcessed || isScanning || isGameOver}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`
                      w-full text-left p-3 rounded-lg border transition-all duration-200
                      ${isSelected
                        ? 'border-cyan-400/60 bg-cyan-950/30 shadow-neon'
                        : isLeaked
                          ? 'border-rose-500/40 bg-rose-950/20 opacity-60'
                          : isPurged
                            ? 'border-emerald-500/40 bg-emerald-950/20 opacity-60'
                            : isApproved
                              ? 'border-emerald-500/40 bg-emerald-950/20 opacity-60'
                              : 'border-slate-700/50 bg-slate-900/50 hover:border-cyan-500/30 hover:bg-slate-800/50'
                      }
                      ${isProcessed || isGameOver ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-8 rounded bg-slate-800 flex items-center justify-center">
                        {isLeaked ? (
                          <span className="text-sm">🚨</span>
                        ) : isPurged ? (
                          <span className="text-sm">🧹</span>
                        ) : isApproved ? (
                          <span className="text-sm">✅</span>
                        ) : (
                          <span className="text-sm">🖼️</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-slate-300 truncate">
                          {img.filename}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${classConfig.bgColor} ${classConfig.color} ${classConfig.borderColor}`}
                          >
                            {classConfig.label}
                          </span>
                          <span className="text-[9px] text-slate-600 font-mono">
                            {img.metadata.length} campos
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Right: Scanner viewport + actions */}
          <div className="space-y-4">
            <ScannerViewport
              image={selectedImage}
              scanProgress={scanProgress}
              revealedFields={revealedFields}
              isScanning={isScanning}
            />

            {/* Action buttons */}
            <AnimatePresence>
              {showScanComplete && selectedImage && selectedImage.action === null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <motion.button
                    onClick={handlePurge}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="
                      relative overflow-hidden py-4 px-4 rounded-lg font-bold text-sm
                      bg-gradient-to-b from-rose-600 to-rose-800
                      border border-rose-400/40 text-white
                      shadow-neon-rose
                      hover:from-rose-500 hover:to-rose-700
                      transition-colors cursor-pointer
                    "
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span className="text-lg">🧹</span>
                      <span>PURGAR EXIF</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 to-transparent" />
                  </motion.button>

                  <motion.button
                    onClick={handleApprove}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="
                      relative overflow-hidden py-4 px-4 rounded-lg font-bold text-sm
                      bg-gradient-to-b from-emerald-600 to-emerald-800
                      border border-emerald-400/40 text-white
                      shadow-neon-emerald
                      hover:from-emerald-500 hover:to-emerald-700
                      transition-colors cursor-pointer
                    "
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span className="text-lg">📤</span>
                      <span>APROBAR ENVÍO SEGURO</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result feedback */}
            <AnimatePresence>
              {resultMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className={`
                    p-3 rounded-lg border text-sm font-mono text-center
                    ${resultMessage.type === 'success'
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                    }
                  `}
                >
                  {resultMessage.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            {!selectedImage && !isGameOver && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {(
                  Object.entries(CLASSIFICATION_CONFIG) as [
                    SuspiciousImage['classification'],
                    (typeof CLASSIFICATION_CONFIG)[SuspiciousImage['classification']],
                  ][]
                ).map(([key, cfg]) => (
                  <div
                    key={key}
                    className={`p-2 rounded border text-center ${cfg.bgColor} ${cfg.borderColor}`}
                  >
                    <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      {cfg.needsPurge ? '→ Purgar' : '→ Aprobar'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Deepfake Detection Indicators (Module 5 crossover) */}
            {!selectedImage && !isGameOver && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg border border-purple-500/30 bg-purple-950/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🎭</span>
                  <span className="text-xs font-bold text-purple-300">
                    Indicadores de Deepfake
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DEEPFAKE_INDICATORS.map((ind) => {
                    const sev = SEVERITY_CONFIG[ind.severity]
                    return (
                      <div
                        key={ind.field}
                        className={`p-2 rounded border ${sev.bgColor} ${sev.borderColor}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold ${sev.color}`}>
                            {sev.label}
                          </span>
                          <span className="text-[10px] text-slate-300">{ind.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Game Over overlay */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-8 text-center space-y-6"
            >
              <div>
                <div className="text-5xl mb-3">{isVictory ? '🏆' : '💀'}</div>
                <h3 className="text-2xl font-bold text-white">
                  {isVictory ? 'Misión Completada' : 'Misión Fallida'}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {isVictory
                    ? 'Todas las imágenes procesadas correctamente.'
                    : 'El tiempo se agotó. Datos filtrados.'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Puntuación</p>
                  <p className="text-2xl font-bold text-cyan-400">{score}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">XP Ganado</p>
                  <p className="text-2xl font-bold text-purple-400">+{xpEarned}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Correctas</p>
                  <p className="text-2xl font-bold text-emerald-400">{correctPurges}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Filtraciones</p>
                  <p className="text-2xl font-bold text-rose-400">{missedLeaks}</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="text-left space-y-1 bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <p className="text-[10px] text-slate-500 uppercase font-mono mb-2">
                  Desglose por imagen
                </p>
                {images.map((img) => {
                  const classConfig = CLASSIFICATION_CONFIG[img.classification]
                  const statusIcon =
                    img.action === 'purge'
                      ? '🧹'
                      : img.action === 'approve'
                        ? '✅'
                        : img.action === 'fail'
                          ? '🚨'
                          : '⏳'
                  return (
                    <div key={img.id} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-400 truncate max-w-[55%]">
                        {img.filename}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold ${classConfig.color}`}>
                          {classConfig.label}
                        </span>
                        <span>{statusIcon}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <motion.button
                onClick={handleComplete}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="
                  w-full py-3 px-6 rounded-lg font-bold text-sm
                  bg-gradient-to-b from-cyan-600 to-cyan-800
                  border border-cyan-400/40 text-white
                  shadow-neon hover:from-cyan-500 hover:to-cyan-700
                  transition-colors cursor-pointer
                "
              >
                Continuar →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
