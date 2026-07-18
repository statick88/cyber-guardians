/**
 * Centralized localStorage keys for CyberGuardians.
 * All keys use the prefix "cg_2026_" to avoid collisions
 * with other projects on the same GitHub Pages domain.
 */
export const STORAGE_KEYS = {
  MODULE0: 'cg_2026_module0',
  MODULE1: 'cg_2026_module1',
  MODULE2: 'cg_2026_module2',
  MODULE3: 'cg_2026_module3',
  MODULE4: 'cg_2026_module4',
  MODULE5: 'cg_2026_module5',
  MODULE6: 'cg_2026_module6',
  BADGES: 'cg_2026_badges',
} as const

/** All module storage keys in order */
export const ALL_MODULE_KEYS = [
  STORAGE_KEYS.MODULE0,
  STORAGE_KEYS.MODULE1,
  STORAGE_KEYS.MODULE2,
  STORAGE_KEYS.MODULE3,
  STORAGE_KEYS.MODULE4,
  STORAGE_KEYS.MODULE5,
  STORAGE_KEYS.MODULE6,
] as const
