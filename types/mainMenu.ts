// ─────────────────────────────────────────────
// types/mainMenu.ts – Mission Hub / Central de Operaciones
// ─────────────────────────────────────────────

/** Module difficulty tier */
export type ModuleTier = 'diagnostic' | 'recon' | 'defense' | 'forensics' | 'hardening'

/** Module unlock status for a given operator */
export type MissionStatus = 'completed' | 'available' | 'locked' | 'override'

/** Raw score snapshot persisted in localStorage per module */
export interface ModuleScore {
  score: number
  maxScore: number
  currentActivityIndex: number
  categoryScores: Record<string, number>
  timestamp: number
}

/** Derived mission card data shown in the hub */
export interface Mission {
  id: number                   // 0-4
  slug: string                 // e.g. 'modulo0'
  codeName: string             // e.g. 'Misión: Shadow Protocol'
  title: string                // human-readable title
  description: string         // short blurb
  tier: ModuleTier
  totalActivities: number      // max activity index
  status: MissionStatus
  progressPct: number          // 0-100
  score: number                // raw points earned
  maxScore: number             // max possible points
}

/** Operator profile persisted in HUD localStorage */
export interface OperatorProfile {
  displayName: string
  level: number
  rank: string                 // e.g. 'Operador Junior'
  overallShieldPct: number     // weighted average across modules
}

/** Single log line rendered in the terminal cascade */
export interface ConsoleLine {
  tag: 'CONECTADO' | 'INFO' | 'WARNING' | 'ERROR' | 'SYSTEM'
  text: string
  delayMs: number              // stagger entry
}

/** Global console state */
export interface MissionHubState {
  missions: Mission[]
  operator: OperatorProfile
  consoleLines: ConsoleLine[]
  overrideMode: boolean
}
