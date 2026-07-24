import type { DebriefPrompt } from '@/types/educational'

/**
 * Default debrief prompts for all modules
 * These prompts encourage metacognitive reflection after completing a module
 */
export const DEFAULT_DEBRIEF_PROMPTS: DebriefPrompt[] = [
  {
    id: 'strategy-reflection',
    type: 'open-reflection',
    prompt: '¿Qué estrategia usaste para resolver las actividades? ¿Funcionó como esperabas?',
    storageKey: 'strategy-reflection',
    competency: 'metacognitive_regulation',
  },
  {
    id: 'difficulty-assessment',
    type: 'slider',
    prompt: '¿Qué actividad te resultó más difícil? ¿Por qué?',
    sliderLabels: { min: 'Fácil', max: 'Muy difícil' },
    storageKey: 'difficulty-assessment',
    competency: 'metacognitive_regulation',
  },
  {
    id: 'learning-transfer',
    type: 'open-reflection',
    prompt: '¿Cómo aplicarías lo aprendido en una situación real de seguridad?',
    storageKey: 'learning-transfer',
    competency: 'knowledge_transfer',
  },
  {
    id: 'improvement-plan',
    type: 'open-reflection',
    prompt: '¿Qué harías diferente la próxima vez para mejorar tu resultado?',
    storageKey: 'improvement-plan',
    competency: 'metacognitive_regulation',
  },
]

/**
 * Module-specific debrief prompts
 * Extend or override DEFAULT_DEBRIEF_PROMPTS for each module
 */
export const MODULE_DEBRIEF_PROMPTS: Record<number, DebriefPrompt[]> = {
  1: [
    ...DEFAULT_DEBRIEF_PROMPTS,
    {
      id: 'email-analysis-strategy',
      type: 'open-reflection',
      prompt: 'Al analizar correos sospechosos, ¿qué indicadores fueron más útiles para detectar phishing?',
      storageKey: 'email-analysis-strategy',
      competency: 'evidence_analysis',
    },
    {
      id: 'url-verification',
      type: 'open-reflection',
      prompt: '¿Cómo verificarás URLs en tu día a día antes de hacer clic?',
      storageKey: 'url-verification',
      competency: 'knowledge_transfer',
    },
  ],
  2: [
    ...DEFAULT_DEBRIEF_PROMPTS,
    {
      id: 'password-strength',
      type: 'open-reflection',
      prompt: '¿Qué aprendiste sobre la fortaleza de contraseñas que aplicarás ahora?',
      storageKey: 'password-strength',
      competency: 'knowledge_transfer',
    },
    {
      id: 'mfa-importance',
      type: 'open-reflection',
      prompt: '¿Por qué es crítico activar MFA en todas tus cuentas importantes?',
      storageKey: 'mfa-importance',
      competency: 'knowledge_transfer',
    },
  ],
  3: [
    ...DEFAULT_DEBRIEF_PROMPTS,
    {
      id: 'network-segmentation',
      type: 'open-reflection',
      prompt: '¿Cómo ayuda la segmentación de red a contener una brecha de seguridad?',
      storageKey: 'network-segmentation',
      competency: 'knowledge_transfer',
    },
    {
      id: 'firewall-rules',
      type: 'open-reflection',
      prompt: '¿Qué regla de firewall agregarías para proteger tu red doméstica?',
      storageKey: 'firewall-rules',
      competency: 'knowledge_transfer',
    },
  ],
  4: [
    ...DEFAULT_DEBRIEF_PROMPTS,
    {
      id: 'incident-response',
      type: 'open-reflection',
      prompt: '¿Cuál es el primer paso que tomarías ante un incidente de seguridad real?',
      storageKey: 'incident-response',
      competency: 'decision_under_pressure',
    },
    {
      id: 'communication-plan',
      type: 'open-reflection',
      prompt: '¿A quién notificarías primero en tu organización si detectas una brecha?',
      storageKey: 'communication-plan',
      competency: 'knowledge_transfer',
    },
  ],
  5: [
    ...DEFAULT_DEBRIEF_PROMPTS,
    {
      id: 'metadata-awareness',
      type: 'open-reflection',
      prompt: '¿Qué metadatos revelan las fotos que compartes en redes sociales? ¿Cómo protegerías tu privacidad?',
      storageKey: 'metadata-awareness',
      competency: 'knowledge_transfer' as const,
    },
    {
      id: 'deepfake-detection',
      type: 'open-reflection',
      prompt: '¿Qué señales te ayudarían a detectar un deepfake en una videollamada sospechosa?',
      storageKey: 'deepfake-detection',
      competency: 'evidence_analysis' as const,
    },
  ],
  6: [
    ...DEFAULT_DEBRIEF_PROMPTS,
    {
      id: 'qr-code-safety',
      type: 'open-reflection',
      prompt: '¿Qué precauciones tomarías antes de escanear un código QR desconocido?',
      storageKey: 'qr-code-safety',
      competency: 'knowledge_transfer' as const,
    },
    {
      id: 'employment-scam-signs',
      type: 'open-reflection',
      prompt: '¿Qué señales de alarma indican que una oferta de empleo es una estafa?',
      storageKey: 'employment-scam-signs',
      competency: 'evidence_analysis' as const,
    },
  ],
}

/**
 * Get debrief prompts for a specific module
 */
export function getDebriefPrompts(moduleNumber: number): DebriefPrompt[] {
  return MODULE_DEBRIEF_PROMPTS[moduleNumber] ?? DEFAULT_DEBRIEF_PROMPTS
}