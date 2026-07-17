# Tasks: Phase 0 — Global Foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350–400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Types + CSS + Audio hook (foundation) | PR 1 | `pnpm build` | N/A — pure types, no runtime | Remove `lib/gameTypes.ts`, `hooks/useAudioSynth.ts`, CSS append |
| 2 | HUD provider + HUD component + layout integration | PR 1 | `pnpm build` | Open `localhost:3000`, verify HUD renders | Remove `components/HUDProvider.tsx`, `components/HUD.tsx`, revert `layout.tsx` |

**Note:** Pre-existing build failure in `app/modulo4/page.tsx:256` (`codeChallenges` property missing on `Modulo4Data`). This is unrelated to Phase 0. Build verification for Phase 0 tasks should use `pnpm build 2>&1 | grep -E '(Error|Failed)' | grep -v modulo4` to isolate Phase 0 regressions. The modulo4 error must be fixed separately before a clean full build.

## Task 1: Create `lib/gameTypes.ts` — Pure Type Definitions

- [ ] 1.1 Create `lib/gameTypes.ts` with named exports (no default export): `ShieldLevel`, `AutonomyLevel` string literal types, `HUDState` interface (shieldHP, maxShieldHP, autonomyLevel, xp, currentModule), `HUDContextValue` extending HUDState with mutators, `AudioSynthConfig` interface, `GamePhase` type, `ModuleGameState` interface, `MinigameConfig` interface
- [ ] 1.2 Verify: `pnpm build` compiles without new type errors; `grep -c 'any' lib/gameTypes.ts` returns 0

**Estimated lines:** ~50 new
**Dependencies:** None
**Risk:** Low — pure types, no runtime behavior

## Task 2: Update `lib/storage-keys.ts` — Add HUD State Key

- [ ] 2.1 Add `HUD_STATE: 'cg_2026_hud_state'` to the `STORAGE_KEYS` object in `lib/storage-keys.ts`

**Estimated lines:** 1 changed
**Dependencies:** None
**Risk:** Low — additive change to existing file

## Task 3: Create `hooks/useAudioSynth.ts` — Audio Hook

- [ ] 3.1 Create `hooks/` directory
- [ ] 3.2 Create `hooks/useAudioSynth.ts` as `'use client'` hook: import `isAudioMuted`, `setAudioMuted`, `initAudio` from `@/lib/soundEffects`; useState for muted boolean; useEffect calling `initAudio()` + syncing state from `isAudioMuted()`; useCallback for toggleMute handler; return `{ muted, toggleMute }` typed as `AudioSynthConfig` from `@/lib/gameTypes`

**Estimated lines:** ~30 new
**Dependencies:** Task 1 (gameTypes.ts for AudioSynthConfig), lib/soundEffects.ts (existing)
**Risk:** Low — thin wrapper over existing tested code

## Task 4: Append CSS Utilities to `app/globals.css`

- [ ] 4.1 Append to `app/globals.css` inside `@layer components`: `.cyber-grid` background pattern, `.screen-flash` animation (opacity 0.3→0, 500ms), `.shield-pulse` keyframes (opacity 1→0.5→1, 3 iterations), neon glow text utilities (`.neon-cyan`, `.neon-magenta`, `.neon-amber`, `.neon-red`)
- [ ] 4.2 Append `@media (prefers-reduced-motion: reduce)` override block that disables all animations/transitions

**Estimated lines:** ~40 new
**Dependencies:** None
**Risk:** Low — pure CSS, no JS changes

## Task 5: Create `components/HUDProvider.tsx` — React Context

- [ ] 5.1 Create `components/HUDProvider.tsx` as `'use client'`: define HUDContext with React.createContext, create HUDProvider component that reads initial state from localStorage key `cg_2026_hud_state` (Task 2), provides `damageShield`, `healShield`, `addXP`, `setCurrentModule`, `resetHUD` mutators, persists state to localStorage on change via useEffect, wraps children in context provider
- [ ] 5.2 Export `useHUD()` custom hook that calls `useContext(HUDContext)` with type assertion

**Estimated lines:** ~65 new
**Dependencies:** Task 1 (gameTypes.ts for HUDState, HUDContextValue), Task 2 (storage key)
**Risk:** Medium — state management must clamp values correctly (shieldHP 0–100, xp ≥ 0)

## Task 6: Create `components/HUD.tsx` — Persistent Status Bar

- [ ] 6.1 Create `components/HUD.tsx` as `'use client'`: fixed top, z-40, full width, dark background `#0a0a1a`; reads state from `useHUD()` (Task 5); renders shield HP bar with framer-motion width animation and color gradient (green→yellow→red); autonomy level badge with neon color; XP counter with animate-on-change
- [ ] 6.2 Add responsive behavior: `≥640px` full bar with CPU visualization (decorative pulse) and network activity (decorative dots); `<640px` collapsed to shield + autonomy only; red flash overlay on shield damage using CSS animation from Task 4

**Estimated lines:** ~110 new
**Dependencies:** Task 1 (gameTypes.ts), Task 4 (CSS animations), Task 5 (HUDProvider/useHUD)
**Risk:** Medium — visual component, must test responsive breakpoints and framer-motion integration

## Task 7: Integrate HUD into `app/layout.tsx`

- [ ] 7.1 Import HUDProvider and HUD in `app/layout.tsx`; wrap `{children}` with `<HUDProvider><HUD /></HUDProvider>`; remove standalone `<VolumeControl />` (audio toggle moves into HUD); add `pt-12` to body to prevent content overlap with fixed HUD

**Estimated lines:** ~15 changed
**Dependencies:** Task 5 (HUDProvider), Task 6 (HUD)
**Risk:** Medium — must preserve body classes, metadata, font imports; must not break existing module pages

## Implementation Order

```
Task 1 (gameTypes) ──┐
Task 2 (storage)  ──┤
Task 3 (audio)    ──┤── Task 5 (HUDProvider) ── Task 6 (HUD) ── Task 7 (layout)
Task 4 (css)      ──┘
```

Tasks 1–4 are independent and can be done in any order or in parallel. Task 5 depends on 1+2. Task 6 depends on 1+4+5. Task 7 depends on 5+6.

## Verification Criteria

| Task | Verification |
|------|-------------|
| 1 | `pnpm build` compiles; `grep -c 'any' lib/gameTypes.ts` = 0 |
| 2 | `pnpm build` compiles; `grep 'HUD_STATE' lib/storage-keys.ts` returns match |
| 3 | `pnpm build` compiles; hook returns `{ muted: boolean, toggleMute: fn }` |
| 4 | `pnpm build` compiles; browser DevTools shows `.cyber-grid` class available |
| 5 | `pnpm build` compiles; `useHUD()` returns typed context value |
| 6 | `pnpm build` compiles; `localhost:3000` shows fixed top bar with shield HP |
| 7 | `pnpm build` compiles; all module pages (modulo0–4) render without regression |
