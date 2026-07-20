# Tasks: MIA Agent — Interactive AI Guide

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450–550 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (types + data + hook) → PR 2 (component + integration) |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Types + dialogue data + useMIA hook | PR 1 | `npx vitest run --reporter=verbose` | HUD state simulation via mock context | Revert `types/mia.ts`, `data/miaDialogues.json`, `hooks/useMIA.ts`, `hooks/index.ts` |
| 2 | MIAgent component + layout wiring | PR 2 | `npx vitest run --reporter=verbose` | Render in browser, verify animation + typewriter | Revert `components/shared/MIAgent.tsx`, `app/layout.tsx` |

## Phase 1: Foundation — Types & Dialogue Data

- [ ] 1.1 Create `types/mia.ts` — define `MIAEmotion` union type (5 states), `MIADialogueEntry` interface (id, moduleId, emotion, text, priority), `MIADialogueBank` type, `MIAAgentState` interface, `MIAEvent` discriminated union. Zero `any`. Enforce `text` ≤ 120 chars via JSDoc.
- [ ] 1.2 Create `data/miaDialogues.json` — structure as `{ "0": { IDLE: [...], EXCITED: [...], ... }, "1": {...}, ..., "6": {...} }`. Module 0: ≥5 entries per emotion (25+ total). Modules 1–6: ≥3 entries per emotion (15 each). All Spanish, adolescent-friendly tone. Unique `id` per entry.
- [ ] 1.3 Verify dialogue data integrity — run a script or manual check: every module key has all 5 emotion arrays, every entry has all required fields, no `text` exceeds 120 chars, all `id` values are unique across the bank.

## Phase 2: Hook — Event Mapping & Cooldown

- [ ] 2.1 Create `hooks/useMIA.ts` — `'use client'` directive. Import `useHUD` from `HUDProvider`. Use `useRef` for cooldown timestamp (`lastTransition: number`) and previous state tracking (`prevShieldHP`, `prevXP`, `prevCompleted`).
- [ ] 2.2 Implement emotion state machine in `useMIA` — `useState<MIAEmotion>('IDLE')`. In `useEffect` watching HUD deps: compare prev vs current `shieldHP` (decrease → `SAMPLED_ERROR`), `xp` (increase → `EXCITED`), `completedChallenges` length (increase → `EXCITED`). Apply 3s cooldown guard before each transition. Reset to `IDLE` after 10s inactivity via `setTimeout`.
- [ ] 2.3 Implement dialogue selection in `useMIA` — `selectDialogue(emotion, moduleId)` helper: try `bank[moduleId][emotion]` → fallback `bank['0'][emotion]` → ultimate fallback `bank['0']['IDLE']`. Shuffle selection, track last 5 displayed IDs to avoid short-term repeats (60s dedup window).
- [ ] 2.4 Implement `triggerMIA` in `useMIA` — `useCallback` that accepts `MIAEmotion`, checks cooldown, updates state. Return `{ emotion, dialogue, triggerMIA, isTyping }` with stable references via `useCallback`/`useMemo`.
- [ ] 2.5 Add barrel export in `hooks/index.ts` — `export { useMIA } from './useMIA'`.

## Phase 3: Component — Avatar, Bubble & Typewriter

- [ ] 3.1 Create `components/shared/MIAgent.tsx` — `'use client'`. Import `motion`, `AnimatePresence` from `framer-motion`. Import `useMIA` from hooks. Implement avatar container: fixed `bottom-6 right-6 z-50`, 64×64px, clip-path angular shape, neon border glow per emotion.
- [ ] 3.2 Implement avatar animations per state — IDLE: CSS `animate-float` breathing. EXCITED: spring scale 1→1.15 + emerald glow. SAMPLED_ERROR: shake `[0,-2,2,0]` + dim. MISSION_BRIEF: steady amber glow. PROVIDING_CLUE: gentle scale 1→1.05 + magenta tint. Use Framer Motion spring configs from design doc. Respect `prefers-reduced-motion` via `window.matchMedia`.
- [ ] 3.3 Implement speech bubble — `AnimatePresence` wrapper. Bubble appears above avatar with `clip-path` polygon comic shape. Neon border color matches emotion. Entry animation: opacity 0→1, y: 8→0, scale: 0.95→1. Auto-hide after 8 seconds via `setTimeout`. Clear on emotion change.
- [ ] 3.4 Implement typewriter effect — `useEffect` with `setInterval` at 30ms/char. State: `displayedChars: number`. Click-to-reveal: set `displayedChars = text.length` and clear interval. Cap max duration at 2s. `prefers-reduced-motion`: show full text instantly. Return `isTyping` boolean for bubble styling.
- [ ] 3.5 Add emotion-specific bubble styling — IDLE: subtle pulse, low opacity. EXCITED: bounce-in, high energy. SAMPLED_ERROR: alert style, red tint. MISSION_BRIEF: focus style, amber glow. PROVIDING_CLUE: mystery style, magenta tint. Map `MIAEmotion` → Tailwind classes.

## Phase 4: Integration & Verification

- [ ] 4.1 Wire `<MIAgent />` into `app/layout.tsx` — add `import MIAgent from '@/components/shared/MIAgent'`. Place `<MIAgent />` after `<HUD />` inside `<HUDProvider>`. Ensure it renders on all routes.
- [ ] 4.2 Write unit tests for `useMIA` — test emotion transitions (shield damage → SAMPLED_ERROR, XP gain → EXCITED, challenge complete → EXCITED). Test cooldown: rapid events within 3s are ignored. Test idle timeout: returns to IDLE after 10s. Test dialogue fallback chain. Mock `useHUD` return values.
- [ ] 4.3 Write unit tests for dialogue selection — test module-specific lookup, fallback to module 0, ultimate fallback to IDLE. Test deduplication: same dialogue not shown within 60s. Test shuffle: multiple calls produce different entries.
- [ ] 4.4 Verify TypeScript strict compliance — `npx tsc --noEmit` passes with zero errors across `types/mia.ts`, `hooks/useMIA.ts`, `components/shared/MIAgent.tsx`. Confirm zero `any` types.
- [ ] 4.5 Manual verification — render in browser, trigger shield damage / XP gain / challenge complete via HUD, confirm emotion transitions within 500ms, typewriter completes in <2s, bubble auto-hides after 8s, `prefers-reduced-motion` disables animations, zero console errors on route navigation.
