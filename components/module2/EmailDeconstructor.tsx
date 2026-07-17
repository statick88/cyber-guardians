'use client'

/**
 * EmailDeconstructor — "Bisturí Holográfico de Mensajes"
 * Module 2 minigame: analyze phishing emails and click on hidden anomalies
 * before the panic timer auto-executes the payload.
 *
 * @module components/module2/EmailDeconstructor
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type {
  EmailAnomaly,
  SimulatedEmail,
  EmailDeconstructorConfig,
  AnomalyKind,
} from '@/types/module2'
import { useHUD } from '@/components/HUDProvider'
import useAudioSynth from '@/hooks/useAudioSynth'

// ---------------------------------------------------------------------------
// Config & constants
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: EmailDeconstructorConfig = {
  timeLimit: 180,
  panicPerEmail: 30,
  xpPerAnomaly: 20,
  damagePerMiss: 15,
  emailCount: 4,
}

const ANOMALY_ICONS: Record<AnomalyKind, string> = {
  spoofed_sender: '🎭',
  homograph_url: '🔗',
  failed_spf: '🛡️',
  suspicious_attachment: '📎',
  urgency_button: '⚠️',
  missing_dkim: '🔑',
  shadow_redirect: '🔀',
  fake_domain: '🌐',
}

const ANOMALY_COLORS: Record<AnomalyKind, string> = {
  spoofed_sender: 'text-rose-400',
  homograph_url: 'text-amber-400',
  failed_spf: 'text-red-400',
  suspicious_attachment: 'text-orange-400',
  urgency_button: 'text-pink-400',
  missing_dkim: 'text-red-400',
  shadow_redirect: 'text-purple-400',
  fake_domain: 'text-cyan-400',
}

// ---------------------------------------------------------------------------
// Sample phishing emails (inline data)
// ---------------------------------------------------------------------------

function buildSampleEmails(): SimulatedEmail[] {
  return [
    {
      id: 'email-1',
      fromName: 'Banco Seguro',
      fromAddress: 'support@bаnco-seguro.com', // Cyrillic 'а' in banco
      toAddress: 'usuario@correo.com',
      subject: '⚠️ Alerta de Seguridad: Acción requerida inmediatamente',
      bodyHtml: `
        <div style="font-family:Arial,sans-serif;color:#333">
          <p>Estimado cliente,</p>
          <p>Hemos detectado actividad sospechosa en su cuenta. Se realizó un intento de transferencia no autorizado por <b>$4,250.00 USD</b> desde su cuenta.</p>
          <p>Si usted no realizó esta acción, <b>debe verificar su identidad inmediatamente</b>.</p>
          <p style="text-align:center;margin:24px 0">
            <a href="https://bаnco-seguro.com/verificar" style="background:#1a73e8;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold">VERIFICAR MI CUENTA AHORA</a>
          </p>
          <p style="font-size:12px;color:#888">Si no actúa en las próximas 2 horas, su cuenta será suspendida permanentemente.</p>
          <p style="font-size:11px;color:#aaa;margin-top:24px">© 2026 Banco Seguro. Todos los derechos reservados.</p>
        </div>
      `,
      receivedAt: '2026-07-15T09:23:00Z',
      spfResult: 'fail',
      dkimResult: 'pass',
      dmarcResult: 'fail',
      isPhishing: true,
      anomalies: [
        {
          id: 'a1-1',
          kind: 'spoofed_sender',
          label: 'Remente falsificado',
          explanation: 'El nombre del remitente dice "Banco Seguro" pero el dominio real es "bаnco-seguro.com" — el carácter "а" es una letra cirílica, no una "a" latina.',
          region: { x: 0, y: 8, w: 55, h: 5 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a1-2',
          kind: 'homograph_url',
          label: 'URL con homoglifo',
          explanation: 'El enlace "bаnco-seguro.com" usa una "а" cirílica (U+0430) en lugar de la "a" latina (U+0061). El dominio real es diferente.',
          region: { x: 20, y: 65, w: 60, h: 6 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a1-3',
          kind: 'failed_spf',
          label: 'SPF fallido',
          explanation: 'El registro SPF indica que el servidor que envió este correo NO está autorizado a enviar en nombre de banco-seguro.com.',
          region: { x: 55, y: 8, w: 45, h: 5 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a1-4',
          kind: 'urgency_button',
          label: 'Presión de urgencia',
          explanation: 'El botón de "VERIFICAR" y el texto de "2 horas" son técnicas de ingeniería social para impedir que pienses antes de actuar.',
          region: { x: 20, y: 58, w: 60, h: 8 },
          discovered: false,
          xpValue: 20,
        },
      ],
    },
    {
      id: 'email-2',
      fromName: 'ExpressDelivery',
      fromAddress: 'tracking@express-delivery.net',
      toAddress: 'usuario@correo.com',
      subject: '📦 Su paquete #PKG-8847 está esperando — Confirme dirección',
      bodyHtml: `
        <div style="font-family:Arial,sans-serif;color:#333">
          <p>Hola,</p>
          <p>Tenemos un paquete pendiente de entrega a su dirección. No pudimos completar la entrega porque la dirección parece estar incompleta.</p>
          <p><b>Número de seguimiento:</b> PKG-8847-FX</p>
          <p><b>Estado:</b> En tránsito — Requiere confirmación</p>
          <p style="text-align:center;margin:24px 0">
            <a href="https://express-delivery.net/confirmar-direccion?id=8847" style="background:#ff6b00;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold">CONFIRMAR DIRECCIÓN DE ENTREGA</a>
          </p>
          <p>Adjunto encontrará el formulario de confirmación de dirección. Por favor complételo y envíelo de vuelta.</p>
          <p style="font-size:11px;color:#aaa;margin-top:24px">ExpressDelivery — Tu paquete es nuestra prioridad</p>
        </div>
      `,
      receivedAt: '2026-07-15T14:17:00Z',
      spfResult: 'pass',
      dkimResult: 'fail',
      dmarcResult: 'none',
      isPhishing: true,
      anomalies: [
        {
          id: 'a2-1',
          kind: 'fake_domain',
          label: 'Dominio falso',
          explanation: 'ExpressDelivery real usa expressdelivery.com. Este dominio "express-delivery.net" con guion es una imitación.',
          region: { x: 0, y: 8, w: 55, h: 5 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a2-2',
          kind: 'suspicious_attachment',
          label: 'Adjunto sospechoso',
          explanation: 'Se menciona un "formulario adjunto" — los adjuntos en correos no solicitados son un vector clásico de malware.',
          region: { x: 0, y: 70, w: 80, h: 6 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a2-3',
          kind: 'missing_dkim',
          label: 'DKIM ausente',
          explanation: 'No hay firma DKIM válida. No se puede verificar que el correo no fue alterado en tránsito.',
          region: { x: 55, y: 8, w: 45, h: 5 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a2-4',
          kind: 'shadow_redirect',
          label: 'Redirección oculta',
          explanation: 'El botón de confirmación redirige a express-delivery.net/confirmar-direccion — un dominio que imita al servicio real.',
          region: { x: 20, y: 58, w: 60, h: 8 },
          discovered: false,
          xpValue: 20,
        },
      ],
    },
    {
      id: 'email-3',
      fromName: 'CloudSync Pro',
      fromAddress: 'security@cloudsync-pro.com',
      toAddress: 'usuario@correo.com',
      subject: '🔒 Acceso no autorizado detectado en su cuenta CloudSync',
      bodyHtml: `
        <div style="font-family:Arial,sans-serif;color:#333">
          <p>Estimado usuario,</p>
          <p>Hemos detectado un inicio de sesión desde una ubicación no reconocida:</p>
          <div style="background:#f5f5f5;padding:12px;border-radius:4px;font-family:monospace;font-size:13px;margin:12px 0">
            <b>IP:</b> 185.220.101.42<br>
            <b>Ubicación:</b> Berlín, Alemania<br>
            <b>Fecha:</b> 15/07/2026 08:45 UTC<br>
            <b>Navegador:</b> Tor Browser 13.0
          </div>
          <p>Si este no fue usted, su cuenta puede estar comprometida. Recomendamos cambiar su contraseña <b>inmediatamente</b>.</p>
          <p style="text-align:center;margin:24px 0">
            <a href="https://cloudsync-pro.com/reset?token=xR9kL2mP" style="background:#dc2626;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold">CAMBIAR CONTRASEÑA AHORA</a>
          </p>
          <p style="font-size:11px;color:#aaa;margin-top:24px">CloudSync Pro — Protección avanzada en la nube</p>
        </div>
      `,
      receivedAt: '2026-07-15T10:45:00Z',
      spfResult: 'fail',
      dkimResult: 'none',
      dmarcResult: 'fail',
      isPhishing: true,
      anomalies: [
        {
          id: 'a3-1',
          kind: 'spoofed_sender',
          label: 'Remitente engañoso',
          explanation: 'CloudSync Pro real usa cloudsyncpro.com (sin guion). Este dominio "cloudsync-pro.com" con guion es una imitación.',
          region: { x: 0, y: 8, w: 55, h: 5 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a3-2',
          kind: 'failed_spf',
          label: 'SPF fallido',
          explanation: 'El servidor remitente no está autorizado according al registro SPF de cloudsync-pro.com.',
          region: { x: 55, y: 8, w: 45, h: 5 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a3-3',
          kind: 'missing_dkim',
          label: 'DKIM no registrado',
          explanation: 'El dominio no tiene registros DKIM — cualquier persona puede enviar correos haciéndose pasar por este dominio.',
          region: { x: 55, y: 12, w: 45, h: 4 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a3-4',
          kind: 'homograph_url',
          label: 'Enlace de suplantación',
          explanation: 'El botón de cambio de contraseña lleva a cloudsync-pro.com (con guion), no al dominio legítimo cloudsyncpro.com.',
          region: { x: 20, y: 62, w: 60, h: 7 },
          discovered: false,
          xpValue: 20,
        },
      ],
    },
    {
      id: 'email-4',
      fromName: 'UniConnect',
      fromAddress: 'noreply@uni-connect.org',
      toAddress: 'usuario@correo.com',
      subject: '💬 Tienes un nuevo mensaje de tu equipo de trabajo',
      bodyHtml: `
        <div style="font-family:Arial,sans-serif;color:#333">
          <p>Hola,</p>
          <p><b>María López</b> te ha enviado un mensaje en el canal <b>#proyecto-final</b>:</p>
          <div style="background:#f0f0f0;padding:12px;border-left:4px solid #3b82f6;margin:12px 0;font-style:italic">
            "Hey, revisa el documento que te compartí. Tiene los cambios que pediste. ¡Fíjate en la sección 3!"
          </div>
          <p>Para ver el mensaje completo y responder, haz clic en el botón de abajo.</p>
          <p style="text-align:center;margin:24px 0">
            <a href="https://uni-connect.org/messages?ref=mensaje-882" style="background:#3b82f6;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold">VER MENSAJE COMPLETO</a>
          </p>
          <p style="font-size:11px;color:#aaa;margin-top:24px">UniConnect — Conectando equipos, conectando ideas</p>
        </div>
      `,
      receivedAt: '2026-07-15T16:30:00Z',
      spfResult: 'pass',
      dkimResult: 'pass',
      dmarcResult: 'fail',
      isPhishing: true,
      anomalies: [
        {
          id: 'a4-1',
          kind: 'fake_domain',
          label: 'Plataforma falsa',
          explanation: 'UniConnect real usa uniconnect.io. Este dominio "uni-connect.org" es una imitación que busca parecerse al servicio de mensajería.',
          region: { x: 0, y: 8, w: 55, h: 5 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a4-2',
          kind: 'shadow_redirect',
          label: 'Enlace sospechoso',
          explanation: 'El enlace "VER MENSAJE COMPLETO" lleva a uni-connect.org, no al dominio legítimo. Podría inyectar credenciales.',
          region: { x: 20, y: 58, w: 60, h: 7 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a4-3',
          kind: 'urgency_button',
          label: 'Presión social',
          explanation: 'Usa el nombre de un contacto ("María López") para generar confianza y urgencia — técnica de phishing dirigido.',
          region: { x: 0, y: 42, w: 80, h: 12 },
          discovered: false,
          xpValue: 20,
        },
        {
          id: 'a4-4',
          kind: 'failed_spf',
          label: 'DMARC no alineado',
          explanation: 'DMARC falla a pesar de que SPF y DKIM pasan individualmente — indica que el dominio no tiene una política DMARC estricta.',
          region: { x: 55, y: 14, w: 45, h: 4 },
          discovered: false,
          xpValue: 20,
        },
      ],
    },
  ]
}

// ---------------------------------------------------------------------------
// Anomaly badge component
// ---------------------------------------------------------------------------

function AnomalyBadge({ anomaly }: { anomaly: EmailAnomaly }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono ${ANOMALY_COLORS[anomaly.kind]} border-current/30 bg-current/10`}
    >
      <span>{ANOMALY_ICONS[anomaly.kind]}</span>
      <span>{anomaly.label}</span>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Email header row
// ---------------------------------------------------------------------------

function EmailHeader({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-start gap-2 text-xs font-mono">
      <span className="w-20 shrink-0 text-slate-500">{label}</span>
      <span
        className={`flex-1 ${
          highlight
            ? 'text-rose-400 underline decoration-rose-400/40 decoration-dotted'
            : 'text-slate-300'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SPF/DKIM/DMARC status badges
// ---------------------------------------------------------------------------

function HeaderStatus({
  spf,
  dkim,
  dmarc,
}: {
  spf: 'pass' | 'fail' | 'softfail' | 'none'
  dkim: 'pass' | 'fail' | 'none'
  dmarc: 'pass' | 'fail' | 'none'
}) {
  const badge = (label: string, result: string) => {
    const color =
      result === 'pass'
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : result === 'fail'
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : result === 'softfail'
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'

    return (
      <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-mono ${color}`}>
        {label}:{result.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badge('SPF', spf)}
      {badge('DKIM', dkim)}
      {badge('DMARC', dmarc)}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface EmailDeconstructorProps {
  onComplete: (score: number, xpEarned: number) => void
  config?: Partial<EmailDeconstructorConfig>
}

export default function EmailDeconstructor({
  onComplete,
  config: configOverride,
}: EmailDeconstructorProps) {
  const config = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...configOverride }),
    [configOverride],
  )

  const { damageShield, addXP } = useHUD()
  const audio = useAudioSynth()

  // --- Game state refs (mutable, no re-renders) ---
  const emailsRef = useRef<SimulatedEmail[]>([])
  const globalTimerRef = useRef<number | null>(null)
  const panicTimerRef = useRef<number | null>(null)
  const initializedRef = useRef(false)

  // --- React state (snapshot for rendering) ---
  const [currentIdx, setCurrentIdx] = useState(0)
  const [emails, setEmails] = useState<SimulatedEmail[]>([])
  const [panicSec, setPanicSec] = useState(config.panicPerEmail)
  const [globalSec, setGlobalSec] = useState(config.timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [victory, setVictory] = useState(false)
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set())
  const [totalXP, setTotalXP] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [leakedCount, setLeakedCount] = useState(0)
  const [flashEmail, setFlashEmail] = useState(false)
  const [revealedExplanations, setRevealedExplanations] = useState<Set<string>>(new Set())

  // --- Derived ---
  const currentEmail = emails[currentIdx] ?? null
  const totalAnomalies = useMemo(
    () => emails.reduce((sum, e) => sum + e.anomalies.length, 0),
    [emails],
  )
  const foundCount = foundIds.size
  const panicPercent = (panicSec / config.panicPerEmail) * 100
  const panicColor =
    panicPercent > 50
      ? 'bg-emerald-500'
      : panicPercent > 25
      ? 'bg-amber-500'
      : 'bg-rose-500'

  // --- Initialize emails once ---
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const allEmails = buildSampleEmails().slice(0, config.emailCount)
    emailsRef.current = allEmails
    setEmails(allEmails)
  }, [config.emailCount])

  // --- Cleanup timers ---
  const clearAllTimers = useCallback(() => {
    if (globalTimerRef.current !== null) {
      clearInterval(globalTimerRef.current)
      globalTimerRef.current = null
    }
    if (panicTimerRef.current !== null) {
      clearInterval(panicTimerRef.current)
      panicTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearAllTimers()
  }, [clearAllTimers])

  // --- Start global timer ---
  useEffect(() => {
    if (emails.length === 0 || gameOver) return

    globalTimerRef.current = window.setInterval(() => {
      setGlobalSec((prev) => {
        if (prev <= 1) {
          clearAllTimers()
          setGameOver(true)
          setVictory(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (globalTimerRef.current !== null) {
        clearInterval(globalTimerRef.current)
        globalTimerRef.current = null
      }
    }
  }, [emails.length, gameOver, clearAllTimers])

  // --- Start panic timer for each email ---
  useEffect(() => {
    if (gameOver || !currentEmail) return

    setPanicSec(config.panicPerEmail)

    panicTimerRef.current = window.setInterval(() => {
      setPanicSec((prev) => {
        if (prev <= 1) {
          // Auto-execute: email leaks, shield damage
          if (panicTimerRef.current !== null) {
            clearInterval(panicTimerRef.current)
            panicTimerRef.current = null
          }
          audio.playAlarm()
          damageShield(config.damagePerMiss)
          setLeakedCount((c) => c + 1)
          setFlashEmail(true)
          setTimeout(() => setFlashEmail(false), 600)

          // Move to next email
          setCurrentIdx((idx) => {
            const next = idx + 1
            if (next >= emailsRef.current.length) {
              clearAllTimers()
              setGameOver(true)
              setVictory(false)
            }
            return next
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (panicTimerRef.current !== null) {
        clearInterval(panicTimerRef.current)
        panicTimerRef.current = null
      }
    }
  }, [currentIdx, gameOver, currentEmail, config.panicPerEmail, config.damagePerMiss, audio, damageShield, clearAllTimers])

  // --- Check victory ---
  useEffect(() => {
    if (!gameOver && currentIdx >= emails.length && emails.length > 0) {
      clearAllTimers()
      setGameOver(true)
      setVictory(true)
    }
  }, [currentIdx, emails.length, gameOver, clearAllTimers])

  // --- Persist results on game over ---
  useEffect(() => {
    if (!gameOver) return
    if (typeof window === 'undefined') return

    try {
      const key = 'cg_2026_module2'
      const data = {
        emailDeconstructor: {
          score: totalScore,
          xpEarned: totalXP,
          anomaliesFound: foundCount,
          emailsDefused: leakedCount === 0 ? emails.length : emails.length - leakedCount,
          leakedEmails: leakedCount,
          victory,
        },
      }
      localStorage.setItem(key, JSON.stringify(data))
    } catch {
      // localStorage unavailable
    }

    if (victory) {
      audio.playSuccessArpeggio()
    } else {
      audio.playFailureSiren()
    }

    onComplete(totalScore, totalXP)
  }, [gameOver]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Click handler on email container ---
  const handleEmailClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (gameOver || !currentEmail) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Check if click is on any undiscovered anomaly
      const hit = currentEmail.anomalies.find(
        (a) =>
          !a.discovered &&
          !foundIds.has(a.id) &&
          x >= a.region.x &&
          x <= a.region.x + a.region.w &&
          y >= a.region.y &&
          y <= a.region.y + a.region.h,
      )

      if (hit) {
        // Correct anomaly found
        audio.playSuccess()
        addXP(hit.xpValue)
        setTotalXP((t) => t + hit.xpValue)
        setTotalScore((s) => s + hit.xpValue)
        setFoundIds((prev) => new Set(prev).add(hit.id))
        setRevealedExplanations((prev) => new Set(prev).add(hit.id))

        // Update email anomalies to mark discovered
        setEmails((prev) =>
          prev.map((email) =>
            email.id === currentEmail.id
              ? {
                  ...email,
                  anomalies: email.anomalies.map((a) =>
                    a.id === hit.id ? { ...a, discovered: true } : a,
                  ),
                }
              : email,
          ),
        )

        // Check if all anomalies in this email are found
        const allFound = currentEmail.anomalies.every(
          (a) => a.id === hit.id || foundIds.has(a.id),
        )
        if (allFound) {
          // Email defused — bonus XP
          const bonus = 10
          addXP(bonus)
          setTotalXP((t) => t + bonus)
          setTotalScore((s) => s + bonus)

          // Move to next email after brief delay
          setTimeout(() => {
            setCurrentIdx((idx) => idx + 1)
          }, 800)
        }
      } else {
        // Miss — no anomaly at this position
        audio.playClick()
      }
    },
    [gameOver, currentEmail, foundIds, audio, addXP],
  )

  // --- Hover on email elements ---
  const handleEmailHover = useCallback(() => {
    if (!gameOver) audio.playHover()
  }, [gameOver, audio])

  // --- Manual skip (advance to next email without defusing) ---
  const handleSkip = useCallback(() => {
    if (gameOver || !currentEmail) return
    audio.playClick()
    setCurrentIdx((idx) => idx + 1)
  }, [gameOver, currentEmail, audio])

  // --- Format time ---
  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (emails.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 font-mono text-sm">
        Cargando correos...
      </div>
    )
  }

  // --- Game Over overlay ---
  if (gameOver) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-6 py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className={`text-6xl font-black tracking-tight ${
            victory ? 'text-emerald-400' : 'text-rose-400'
          }`}
          style={{ textShadow: victory ? '0 0 30px #10b981' : '0 0 30px #ef4444' }}
        >
          {victory ? 'NEUTRALIZADO' : 'COMPROMETIDO'}
        </motion.div>

        <p className="text-slate-400 font-mono text-sm max-w-md">
          {victory
            ? 'Todos los correos phishing fueron analizados y neutralizados. Tu identidad digital está segura.'
            : 'El sistema fue comprometido. Los correos maliciosos ejecutaron sus payloads antes de que pudieras analizarlos.'}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm font-mono">
          <div className="rounded border border-slate-700 bg-slate-900/50 p-4">
            <div className="text-slate-500 text-xs">Puntos</div>
            <div className="text-xl text-cyan-400 font-bold">{totalScore}</div>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900/50 p-4">
            <div className="text-slate-500 text-xs">XP Ganado</div>
            <div className="text-xl text-amber-400 font-bold">+{totalXP}</div>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900/50 p-4">
            <div className="text-slate-500 text-xs">Anomalías</div>
            <div className="text-xl text-emerald-400 font-bold">
              {foundCount}/{totalAnomalies}
            </div>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900/50 p-4">
            <div className="text-slate-500 text-xs">Correos filtrados</div>
            <div className="text-xl text-rose-400 font-bold">{leakedCount}</div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* --- Top bar: global timer + score --- */}
      <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/60 px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-500">
            CORREO {Math.min(currentIdx + 1, emails.length)}/{emails.length}
          </span>
          <span className="text-xs font-mono text-slate-500">
            ANOMALÍAS {foundCount}/{totalAnomalies}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-cyan-400">+{totalXP} XP</span>
          <span
            className={`text-sm font-mono font-bold ${
              globalSec < 30 ? 'text-rose-400 animate-pulse' : 'text-slate-300'
            }`}
          >
            ⏱ {fmtTime(globalSec)}
          </span>
        </div>
      </div>

      {/* --- Panic timer bar --- */}
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className={`absolute inset-y-0 left-0 ${panicColor} rounded-full`}
          animate={{ width: `${panicPercent}%` }}
          transition={{ duration: 0.5 }}
        />
        {panicPercent < 25 && (
          <div className="absolute inset-0 animate-pulse bg-rose-500/20" />
        )}
      </div>

      {/* --- Email container --- */}
      <AnimatePresence mode="wait">
        {currentEmail && (
          <motion.div
            key={currentEmail.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className={`relative overflow-hidden rounded-lg border transition-colors ${
              flashEmail
                ? 'border-rose-500 bg-rose-500/10'
                : 'border-slate-700/50 bg-slate-900/60'
            }`}
          >
            {/* Clickable email body */}
            <div
              className="cursor-crosshair"
              onClick={handleEmailClick}
              onMouseMove={handleEmailHover}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                }
              }}
            >
              {/* Email header */}
              <div className="border-b border-slate-700/50 p-4 space-y-2">
                <EmailHeader label="De" value={`${currentEmail.fromName} <${currentEmail.fromAddress}>`} highlight />
                <EmailHeader label="Para" value={currentEmail.toAddress} />
                <EmailHeader label="Asunto" value={currentEmail.subject} />
                <EmailHeader
                  label="Fecha"
                  value={new Date(currentEmail.receivedAt).toLocaleString('es-ES')}
                />
                <HeaderStatus
                  spf={currentEmail.spfResult}
                  dkim={currentEmail.dkimResult}
                  dmarc={currentEmail.dmarcResult}
                />
              </div>

              {/* Email body */}
              <div
                className="p-4 text-sm text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentEmail.bodyHtml }}
              />
            </div>

            {/* Anomaly highlight overlays (shown after discovery) */}
            {currentEmail.anomalies.map((anomaly) => {
              if (!anomaly.discovered && !foundIds.has(anomaly.id)) return null
              return (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute rounded border-2 border-cyan-400/60 bg-cyan-400/5 pointer-events-none"
                  style={{
                    left: `${anomaly.region.x}%`,
                    top: `${anomaly.region.y}%`,
                    width: `${anomaly.region.w}%`,
                    height: `${anomaly.region.h}%`,
                  }}
                >
                  <div className="absolute -top-5 left-0 rounded bg-cyan-900/90 px-2 py-0.5 text-[10px] font-mono text-cyan-300 whitespace-nowrap">
                    {ANOMALY_ICONS[anomaly.kind]} {anomaly.label}
                  </div>
                </motion.div>
              )
            })}

            {/* Anomaly hover hint zones (subtle dashed borders on hover) */}
            {!gameOver &&
              currentEmail.anomalies
                .filter((a) => !a.discovered && !foundIds.has(a.id))
                .map((anomaly) => (
                  <div
                    key={`hint-${anomaly.id}`}
                    className="absolute rounded border border-dashed border-transparent hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all cursor-crosshair pointer-events-auto"
                    style={{
                      left: `${anomaly.region.x}%`,
                      top: `${anomaly.region.y}%`,
                      width: `${anomaly.region.w}%`,
                      height: `${anomaly.region.h}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Simulate click on the parent container at this position
                      const parent = e.currentTarget.parentElement?.querySelector('.cursor-crosshair')
                      if (parent) {
                        const rect = parent.getBoundingClientRect()
                        const fakeEvent = {
                          clientX: rect.left + (anomaly.region.x / 100) * rect.width + (anomaly.region.w / 200) * rect.width,
                          clientY: rect.top + (anomaly.region.y / 100) * rect.height + (anomaly.region.h / 200) * rect.height,
                          currentTarget: parent,
                        } as React.MouseEvent<HTMLDivElement>
                        handleEmailClick(fakeEvent)
                      }
                    }}
                  />
                ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Discovered anomalies explanations --- */}
      <AnimatePresence>
        {currentEmail &&
          currentEmail.anomalies
            .filter((a) => revealedExplanations.has(a.id))
            .map((anomaly) => (
              <motion.div
                key={`exp-${anomaly.id}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded border border-cyan-500/30 bg-cyan-950/30 p-3"
              >
                <div className="flex items-start gap-2">
                  <AnomalyBadge anomaly={anomaly} />
                </div>
                <p className="mt-2 text-xs font-mono text-cyan-200/80 leading-relaxed">
                  {anomaly.explanation}
                </p>
              </motion.div>
            ))}
      </AnimatePresence>

      {/* --- Action buttons --- */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSkip}
          className="rounded border border-slate-600 bg-slate-800/50 px-4 py-2 text-xs font-mono text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 transition-colors"
        >
          SKIP →
        </button>
        <div className="text-[10px] font-mono text-slate-600">
          Haz clic en las anomalías para descubrirlas
        </div>
      </div>
    </div>
  )
}
