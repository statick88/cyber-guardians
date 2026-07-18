/**
 * Global game types for CyberGuardians OS: Console Edition.
 * Pure type definitions — no runtime code.
 */

export type GamePhase = 'MENU' | 'BRIEFING' | 'MINIGAMES' | 'FEEDBACK' | 'RESULTS' | 'GRADUATION'

export type ShieldLevel = 'full' | 'high' | 'medium' | 'low' | 'critical'

export type AutonomyLevel = 'novice' | 'defender' | 'guardian' | 'elite'

export interface HUDState {
  shieldHP: number          // 0-100
  maxShieldHP: number       // always 100
  autonomyLevel: AutonomyLevel
  xp: number
  currentModule: number | null  // 0-4 or null (home)
  notebookOpen: boolean
  /** Active challenges for the current session */
  challenges: Challenge[]
  /** IDs of challenges the student has completed */
  completedChallenges: string[]
}

export interface HUDContextValue extends HUDState {
  damageShield: (amount: number) => void
  healShield: (amount: number) => void
  addXP: (amount: number) => void
  setCurrentModule: (id: number | null) => void
  resetHUD: () => void
  toggleNotebook: () => void
}

export interface AudioSynthConfig {
  muted: boolean
  onToggle: (muted: boolean) => void
}

export interface ModuleGameState {
  phase: GamePhase
  currentMinigame: number
  totalMinigames: number
  score: number
  maxScore: number
  startTime: number
  endTime?: number
}

export interface MinigameConfig {
  id: string
  name: string
  description: string
  briefingText: string
  feedbackText: string
  maxScore: number
  timeLimit?: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

// ── Challenge system ──────────────────────────────────────────────

/** Type of challenge: daily, weekly, or special event */
export type TipoChallenge = "diario" | "semanal" | "especial";

/**
 * Challenge for gamified learning progression.
 * Students earn rewards for completing challenges.
 */
export interface Challenge {
  /** Unique identifier */
  id: string;
  /** Challenge title */
  titulo: string;
  /** Description of the challenge task */
  descripcion: string;
  /** Challenge frequency type */
  tipo: TipoChallenge;
  /** Reward points for completion */
  puntosRecompensa: number;
  /** Requirements to unlock this challenge */
  requisitos: string[];
  /** Whether the student has completed this challenge */
  completado: boolean;
}

// ── Social sharing ─────────────────────────────────────────────────

/** Supported social platforms */
export type PlataformaSocial = "twitter" | "facebook" | "whatsapp" | "instagram";

/**
 * Social sharing configuration for celebrating achievements.
 */
export interface SocialShare {
  /** Unique identifier */
  id: string;
  /** Target platform */
  plataforma: PlataformaSocial;
  /** Pre-written share message */
  mensaje: string;
  /** URL to share */
  url: string;
  /** Hashtags for the post */
  hashtags: string[];
}
