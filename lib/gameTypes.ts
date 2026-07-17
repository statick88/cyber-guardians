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
}

export interface HUDContextValue extends HUDState {
  damageShield: (amount: number) => void
  healShield: (amount: number) => void
  addXP: (amount: number) => void
  setCurrentModule: (id: number | null) => void
  resetHUD: () => void
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
