/**
 * Module 1 — "Shadow Protocol": Privacy & Digital Footprint
 * Strict TypeScript. Zero `any`. Static-export safe.
 *
 * Merges original category/progress types with new Console Edition game types.
 */

// ---------------------------------------------------------------------------
// Original activity types (kept for Module1Game.tsx compatibility)
// ---------------------------------------------------------------------------

export interface Email {
  id: string;
  remetente: {
    nome: string;
    email: string;
  };
  assunto: string;
  corpo: string;
  dataEnvio: string;
  links: Array<{
    texto: string;
    urlReal: string;
    urlExibida: string;
    dominio: string;
    https: boolean;
    seloSeguranca: boolean;
  }>;
  dicasVisuais: string[];
}

export interface URLItem {
  id: string;
  urlCompleta: string;
  componentes: {
    protocolo: string;
    dominio: string;
    caminho: string;
    parametros?: string | null;
    porta?: number;
  };
  elementoSuspeito: string;
  classificacao: "phishing" | "suspeita" | "segura";
  explicacion: string;
  pontos: number;
  /** Optional educational mediator layer for this URL scenario */
  educationalLayer?: import('./educational').EducationalLayer;
}

export interface Indicador {
  id: string;
  tipo: string;
  descricao: string;
  localizacao: string;
  gravidade: "alta" | "media" | "baja";
}

export interface Escenario {
  id: string;
  tipo: "email" | "sms" | "web" | "redes-sociais";
  titulo: string;
  descricao: string;
  conteudo: string;
  indicadores: Indicador[];
  acaoCorreta: "reportar" | "verificar" | "bloquear" | "ignorar";
  pontos: number;
  dificuldad: "basico" | "intermedio" | "avancado";
  explicacion: string;
  /** Optional educational mediator layer for this scenario */
  educationalLayer?: import('./educational').EducationalLayer;
}

export interface DragItem {
  id: string;
  conteudo: string;
  tipo: string;
  icone: string;
}

export interface DragTarget {
  id: string;
  label: string;
  tipo: string;
  cor: string;
}

export interface Ejercicio {
  id: string;
  titulo: string;
  descricao: string;
  itens: DragItem[];
  alvos: DragTarget[];
  pontos: number;
}

/** Strict answer types per micro-activity kind */
export type RespuestaVF = "verdadero" | "falso";
export type RespuestaCodigo = number;
export type RespuestaOrden = string[]; // ordered step IDs

export interface MicroActividad {
  id: string;
  tipo: "verdadero-falso" | "completar-codigo" | "ordenar-pasos";
  pergunta: string;
  respuestaCorrecta: RespuestaVF | RespuestaCodigo | RespuestaOrden;
  codigo?: string;
  pasos?: Array<{ id: string; texto: string; ordenCorrecto: number }>;
  explicacion: string;
  puntos: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  color: string;
}

export interface ModuloData {
  modulo: {
    id: number;
    nombre: string;
    descripcion: string;
    umbralAprobacion: number;
    tiempoEstimado: string;
    icono: string;
  };
  categorias: Categoria[];
  correos: Email[];
  urls: URLItem[];
  escenarios: Escenario[];
  ejercicios: Ejercicio[];
  microActividades: MicroActividad[];
}

/** All valid category keys for Module 1 scoring */
export type Module1Category =
  | "analisis-email"
  | "inspeccion-url"
  | "phishing-simulado"
  | "defensa-digital"
  | "clasificacion"
  | "micro-actividades";

/** All Module 1 category keys for zero-initialization */
export const ALL_MODULE1_CATEGORIES: Module1Category[] = [
  "analisis-email",
  "inspeccion-url",
  "phishing-simulado",
  "defensa-digital",
  "clasificacion",
  "micro-actividades",
];

/** Activity component identifiers */
export type ActivityType =
  | "analisis-email"
  | "inspeccion-url"
  | "phishing-simulado"
  | "defensa-digital";

export type ActionType = "reportar" | "verificar" | "bloquear" | "ignorar";

export interface QuestionState {
  answered: boolean;
  selected: string | null;
  correct: boolean;
  showingExplanation: boolean;
}

/** Persisted game progress for Module 1 (localStorage) */
export interface GameProgressModule1 {
  currentActivityIndex: number;
  score: number;
  categoryScores: Record<Module1Category, number>;
  timestamp: number; // Date.now() for staleness check
}

/** Activity key mapping used in ACTIVITIES array */
export type ActivityKey =
  | "email"
  | "url"
  | "simulator"
  | "defense"
  | "dragdrop"
  | "micro";

// ---------------------------------------------------------------------------
// Cookie Sweeper ("Destructor de Rastreadores") — Console Edition
// ---------------------------------------------------------------------------

export type CookieKind = 'tracking' | 'telemetry' | 'pixel' | 'fingerprint'

export interface FallingCookie {
  id: string
  kind: CookieKind
  /** Normalized label shown on the node */
  label: string
  /** Horizontal start position (0–100% of container width) */
  x: number
  /** Vertical position in px from top */
  y: number
  /** Fall speed in px per tick */
  speed: number
  /** Whether this cookie has been intercepted */
  destroyed: boolean
  /** Whether it passed the shield (reached HP zone) */
  leaked: boolean
}

export interface ShieldPaddle {
  /** Centre X in px */
  x: number
  /** Width in px */
  width: number
}

export interface CookieSweeperState {
  /** All active cookies in the current wave */
  cookies: FallingCookie[]
  /** Paddle (shield) position */
  paddle: ShieldPaddle
  /** Shield HP at module level (mirrors HUD) */
  shieldHP: number
  /** Maximum shield HP */
  maxShieldHP: number
  /** Total cookies intercepted */
  destroyedCount: number
  /** Total cookies that leaked through */
  leakedCount: number
  /** XP earned so far */
  xpEarned: number
  /** Whether the minigame is over */
  isGameOver: boolean
  /** Whether the player won (reached wave end with HP > 0) */
  isVictory: boolean
  /** Current wave number (1-indexed) */
  wave: number
  /** Total waves in this session */
  totalWaves: number
  /** Difficulty knob */
  difficulty: 'normal' | 'hard' | 'elite'
}

export interface CookieSweeperConfig {
  /** How many cookies per wave */
  cookiesPerWave: number
  /** Base fall speed (px/tick) — scales with wave */
  baseSpeed: number
  /** Shield damage per leaked cookie */
  damagePerLeak: number
  /** XP per destroyed cookie */
  xpPerDestroy: number
  /** Paddle width in px */
  paddleWidth: number
  /** Tick interval in ms (lower = faster) */
  tickMs: number
}

// ---------------------------------------------------------------------------
// MetadataExtractor ("Escaner de Rayos X") — Console Edition
// ---------------------------------------------------------------------------

export type MetadataField =
  | 'gps'
  | 'device'
  | 'date'
  | 'software'
  | 'camera'
  | 'resolution'
  | 'orientation'

export interface MetadataEntry {
  field: MetadataField
  label: string
  value: string
  /** Whether this field is sensitive (should be purged) */
  isSensitive: boolean
}

export interface SuspiciousImage {
  id: string
  /** Display name / filename */
  filename: string
  /** Simulated thumbnail URL (data-URI or path) */
  thumbnailUrl: string
  /** EXIF metadata embedded in the image */
  metadata: MetadataEntry[]
  /** Mission-required classification */
  classification: 'public' | 'internal' | 'confidential' | 'secret'
  /** Whether the player already scanned this image */
  scanned: boolean
  /** Player's action: null = pending, 'purge' = purged EXIF, 'approve' = sent safe, 'fail' = leaked */
  action: 'purge' | 'approve' | 'fail' | null
}

export interface MetadataExtractorState {
  /** Queue of images to process */
  images: SuspiciousImage[]
  /** Currently selected image index (null = none) */
  selectedId: string | null
  /** Whether the scan lens animation is active */
  isScanning: boolean
  /** Scan progress 0–100 */
  scanProgress: number
  /** Mission score */
  score: number
  /** Max possible score */
  maxScore: number
  /** Timer remaining in seconds */
  timeRemaining: number
  /** XP earned */
  xpEarned: number
  /** Whether game is over */
  isGameOver: boolean
  /** Whether player won */
  isVictory: boolean
  /** Correct purges */
  correctPurges: number
  /** Missed leaks (sent confidential without purge) */
  missedLeaks: number
}

export interface MetadataExtractorConfig {
  /** Total time in seconds */
  timeLimit: number
  /** XP per correct purge */
  xpPerPurge: number
  /** Shield damage per leaked confidential image */
  damagePerLeak: number
  /** Number of images in the queue */
  imageCount: number
}
