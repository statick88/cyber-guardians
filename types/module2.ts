/**
 * Module 2 — "Phish Hunter": Social Engineering & Identity
 * Strict TypeScript. Zero `any`. Static-export safe.
 *
 * Merges original category/progress types with new Console Edition game types.
 */

// ---------------------------------------------------------------------------
// Original activity types (kept for Module2Game.tsx compatibility)
// ---------------------------------------------------------------------------

export interface PasswordEntry {
  id: string;
  servicio: string;
  usuario: string;
  contrasena: string;
  fortaleza: "muy-debil" | "debil" | "media" | "fuerte" | "muy-fuerte";
  tiempoCrackeo: string;
  fueFiltrada: boolean;
  recomendacion: string;
}

export interface TwoFactorMethod {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  nivelSeguridad: "bajo" | "medio" | "alto" | "maximo";
  vulnerableA: string[];
  ejemplo: string;
}

export interface TwoFactorScenario {
  id: string;
  servicio: string;
  icono: string;
  descripcion: string;
  metodosDisponibles: string[];
  metodoRecomendado: string;
  explicacion: string;
  puntos: number;
  /** Optional educational mediator layer for this 2FA scenario */
  educationalLayer?: import('./educational').EducationalLayer;
}

export interface SocialMediaProfile {
  id: string;
  plataforma: string;
  icono: string;
  configuraciones: ConfiguracionPrivacidad[];
}

export interface ConfiguracionPrivacidad {
  id: string;
  nombre: string;
  descripcion: string;
  estadoActual: "publico" | "amigos" | "solo-yo" | "personalizado";
  estadoRecomendado: "publico" | "amigos" | "solo-yo" | "personalizado";
  riesgo: "alto" | "medio" | "bajo";
  explicacion: string;
  puntos: number;
}

export interface IdentityTheftScenario {
  id: string;
  tipo: "credenciales" | "identidad" | "financiero" | "medico" | "infantil";
  titulo: string;
  descripcion: string;
  indicadores: IndicadorRiesgo[];
  accionCorrecta: "congelar-credito" | "cambiar-contrasenas" | "reportar-autoridades" | "monitorear-cuentas" | "contactar-soporte";
  puntos: number;
  dificultad: "basico" | "intermedio" | "avanzado";
  explicacion: string;
  /** Optional educational mediator layer for this identity theft scenario */
  educationalLayer?: import('./educational').EducationalLayer;
}

export interface IndicadorRiesgo {
  id: string;
  tipo: string;
  descripcion: string;
  severidad: "critica" | "alta" | "media" | "baja";
  accion: string;
}

export interface DragItemDefense {
  id: string;
  contenido: string;
  tipo: string;
  icono: string;
}

export interface DragTargetDefense {
  id: string;
  etiqueta: string;
  tipo: string;
  color: string;
  descripcion: string;
}

export interface EjercicioDefensa {
  id: string;
  titulo: string;
  descripcion: string;
  items: DragItemDefense[];
  objetivos: DragTargetDefense[];
  puntos: number;
}

export interface MicroActividad {
  id: string;
  tipo: "verdadero-falso" | "completar-codigo" | "ordenar-pasos";
  pregunta: string;
  respuestaCorrecta: "verdadero" | "falso" | number | string[];
  codigo?: string;
  pasos?: Array<{ id: string; texto: string; ordenCorrecto: number }>;
  explicacion: string;
  puntos: number;
}

export interface CategoriaModulo2 {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  color: string;
}

export interface Modulo2Data {
  modulo: {
    id: number;
    nombre: string;
    descripcion: string;
    umbralAprobacion: number;
    tiempoEstimado: string;
    icono: string;
  };
  categorias: CategoriaModulo2[];
  contrasenas: PasswordEntry[];
  metodos2fa: TwoFactorMethod[];
  escenarios2fa: TwoFactorScenario[];
  perfilesSociales: SocialMediaProfile[];
  robosIdentidad: IdentityTheftScenario[];
  ejercicios: EjercicioDefensa[];
  microActividades: MicroActividad[];
  vishing?: VishingCall[];
}

export type Module2Category =
  | "boveda-contrasenas"
  | "autenticacion-2fa"
  | "auditoria-redes-sociales"
  | "proteccion-identidad"
  | "defensa-activa"
  | "micro-actividades";

export const ALL_MODULE2_CATEGORIES: Module2Category[] = [
  "boveda-contrasenas",
  "autenticacion-2fa",
  "auditoria-redes-sociales",
  "proteccion-identidad",
  "defensa-activa",
  "micro-actividades",
];

export type ActivityType =
  | "boveda-contrasenas"
  | "autenticacion-2fa"
  | "auditoria-redes-sociales"
  | "proteccion-identidad"
  | "defensa-activa"
  | "micro-actividades";

export interface GameProgressModule2 {
  currentActivityIndex: number;
  score: number;
  categoryScores: Record<Module2Category, number>;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// EmailDeconstructor ("Bisturí Holográfico de Mensajes") — Console Edition
// ---------------------------------------------------------------------------

export type AnomalyKind =
  | 'spoofed_sender'
  | 'homograph_url'
  | 'failed_spf'
  | 'suspicious_attachment'
  | 'urgency_button'
  | 'missing_dkim'
  | 'shadow_redirect'
  | 'fake_domain'

export interface EmailAnomaly {
  id: string
  kind: AnomalyKind
  /** Short label shown on the highlight */
  label: string
  /** Longer explanation revealed after discovery */
  explanation: string
  /** Bounding box {x,y,w,h} in % of email container — for click detection */
  region: { x: number; y: number; w: number; h: number }
  /** Whether the player has found this anomaly */
  discovered: boolean
  /** XP awarded for finding it */
  xpValue: number
}

export interface SimulatedEmail {
  id: string
  /** Visible "From" display name */
  fromName: string
  /** Actual (potentially spoofed) email address */
  fromAddress: string
  /** Visible "To" */
  toAddress: string
  /** Subject line */
  subject: string
  /** Email body HTML (simulated) */
  bodyHtml: string
  /** Fake received timestamp */
  receivedAt: string
  /** SPF / DKIM / DMARC verdict strings for header display */
  spfResult: 'pass' | 'fail' | 'softfail' | 'none'
  dkimResult: 'pass' | 'fail' | 'none'
  dmarcResult: 'pass' | 'fail' | 'none'
  /** Anomalies embedded in this email */
  anomalies: EmailAnomaly[]
  /** Whether this is actually a phishing email (all are for this minigame) */
  isPhishing: boolean
}

export interface EmailDeconstructorState {
  /** Current email being analyzed */
  currentEmail: SimulatedEmail | null
  /** Queue of emails */
  emailQueue: SimulatedEmail[]
  /** Index in the queue */
  currentIndex: number
  /** Total emails to analyze */
  totalEmails: number
  /** Timer remaining in seconds */
  timeRemaining: number
  /** Total anomalies found across all emails */
  anomaliesFound: number
  /** Total anomalies available */
  anomaliesTotal: number
  /** XP earned */
  xpEarned: number
  /** Score */
  score: number
  /** Max score */
  maxScore: number
  /** Whether game is over */
  isGameOver: boolean
  /** Whether player won */
  isVictory: boolean
  /** Emails correctly flagged as phishing */
  correctFlags: number
  /** Emails missed (auto-executed by timer) */
  missedEmails: number
  /** Panic timer: when it hits 0 the current email "auto-executes" */
  panicSeconds: number
  /** Whether the panic bar is flashing */
  panicWarning: boolean
}

export interface EmailDeconstructorConfig {
  /** Time limit in seconds for the whole round */
  timeLimit: number
  /** Panic timer per email in seconds */
  panicPerEmail: number
  /** XP per anomaly discovered */
  xpPerAnomaly: number
  /** Shield damage per missed email */
  damagePerMiss: number
  /** Number of emails in the round */
  emailCount: number
}

// ---------------------------------------------------------------------------
// PhishingRedFlags — shared utility types for flag display
// ---------------------------------------------------------------------------

export interface RedFlagIndicator {
  id: string
  label: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// ---------------------------------------------------------------------------
// PhoneticDecoder ("Decodificador de Voces Fantasma") — Vishing Simulator
// ---------------------------------------------------------------------------

export interface VishingLine {
  id: string
  speaker: 'caller' | 'player'
  text: string
  /** Red flag IDs triggered by this line (if caller line) */
  redFlags?: string[]
  /** Decision point triggered after this line */
  decisionPointId?: string
}

export interface VishingRedFlag {
  id: string
  /** The suspicious phrase to click on */
  phrase: string
  /** Social engineering technique */
  technique: string
  /** Why this is dangerous */
  explanation: string
  /** XP value for identifying it */
  xpValue: number
  /** Whether player found it */
  discovered: boolean
}

export interface VishingDecisionPoint {
  id: string
  /** Prompt shown to the player */
  prompt: string
  /** Available choices */
  choices: VishingChoice[]
}

export interface VishingChoice {
  id: string
  etiqueta: string
  /** Whether this is the safe choice */
  isSafe: boolean
  /** XP reward/penalty */
  xpDelta: number
  /** Shield damage if wrong */
  shieldDamage: number
  /** Follow-up line ID after this choice */
  followUpLineId: string
  /** Explanation shown after choice */
  explanation: string
}

export interface VishingCall {
  id: string;
  /** Caller's claimed identity */
  callerIdentity: string;
  /** The organization they claim to represent */
  organization: string;
  /** Difficulty level */
  difficulty: 'basico' | 'intermedio' | 'avanzado';
  /** Ordered transcript lines */
  transcript: VishingLine[];
  /** Red flags to find in the transcript */
  redFlags: VishingRedFlag[];
  /** Decision points */
  decisionPoints: VishingDecisionPoint[];
  /** Summary shown after completion */
  summary: string;
  /** Total XP available */
  totalXp: number;
  /** Optional educational mediator layer for this vishing scenario */
  educationalLayer?: import('./educational').EducationalLayer;
}

export interface PhoneticDecoderState {
  /** Current call being analyzed */
  currentCall: VishingCall | null
  /** Queue of calls */
  callQueue: VishingCall[]
  /** Index in queue */
  currentIndex: number
  /** Total calls */
  totalCalls: number
  /** Currently visible transcript lines */
  visibleLines: VishingLine[]
  /** Index of next line to reveal */
  nextLineIndex: number
  /** Active decision point (if any) */
  activeDecisionPoint: VishingDecisionPoint | null
  /** Player's choices so far */
  choicesMade: Array<{ decisionPointId: string; choiceId: string; safe: boolean }>
  /** Red flags found in current call */
  redFlagsFound: string[]
  /** Timer remaining in seconds */
  timeRemaining: number
  /** XP earned */
  xpEarned: number
  /** Score */
  score: number
  /** Max possible score */
  maxScore: number
  /** Whether game is over */
  isGameOver: boolean
  /** Whether player won */
  isVictory: boolean
  /** Whether the transcript is auto-scrolling */
  isAutoScrolling: boolean
  /** Caller "impatience" level (increases over time) */
  impatienceLevel: number
}

export interface PhoneticDecoderConfig {
  /** Time limit in seconds */
  timeLimit: number
  /** Seconds between automatic line reveals */
  autoRevealInterval: number
  /** XP per red flag found */
  xpPerFlag: number
  /** Shield damage per wrong decision */
  damagePerWrongDecision: number
  /** Number of calls in round */
  callCount: number
}
