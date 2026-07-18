// ─────────────────────────────────────────────────────────────────────
// CyberGuardians — Type Barrel Exports
// Re-exports all module-specific type definitions.
//
// Note: Some modules export identically named types (e.g. Escenario,
// MicroActividad, ActivityType). Import directly from the specific
// module file to avoid ambiguity:
//
//   import type { Escenario } from '@/types/module0'
//   import type { Escenario } from '@/types/module1'
// ─────────────────────────────────────────────────────────────────────

// New modules (no conflicts)
export * from './module5'
export * from './module6'

// Shared types — re-export with explicit aliases to avoid name collisions
export type {
  GameState as GameStateModule0,
  GameProgress as GameProgressModule0,
} from './module0'

export type {
  GameProgressModule1,
} from './module1'

export type {
  GameProgressModule3,
} from './module3'

export type {
  GameProgressModule4,
} from './module4'
