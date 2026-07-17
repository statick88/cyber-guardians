# Tasks: Educational Mediator (P0 → P1 → P2)

## PR Workload Forecast

| PR   | Estimated Changed Lines | 400-Line Risk | Work Unit Range |
|------|------------------------|---------------|-----------------|
| PR 1 | ~120                   | Low           | T0–T4           |
| PR 2 | ~180                   | Low           | T5–T10          |
| PR 3 | ~220                   | Low           | T11–T17         |
| PR 4 | ~180                   | Low           | T18–T22         |
| PR 5 | ~140                   | Low           | T23–T27         |
| **Total** | **~840**          | —             | T0–T27          |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low

> **Work-unit evidence**: Each PR below names its Focused test command, Runtime harness, and Rollback boundary. PRs are independently deployable with feature flag.

---

## PR 1 — Foundation (T0–T4)

**Goal**: Types, context, feature flag. Zero behavior change when flag=off.

### T0 — Create `types/educationalMediator.ts` ✅
Create `types/educationalMediator.ts` with: `MediatorState`, `CognitiveConflict`, `EducationalLayer`, `NotebookEntry`, `ScaffoldingTip`, `DebriefReflection`, `MediatorAction`. Export all interfaces. Use `readonly` on discriminated unions. ~60 lines.
- **Prerequisites**: None
- **Files**: `types/educationalMediator.ts` (create)
- **Acceptance**: `npx tsc --noEmit` passes; types match design.md §3.1
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: N/A (types only)
- **Rollback boundary**: Delete `types/educationalMediator.ts`

### T1 — Create `lib/featureFlags.ts` ✅
Create `lib/featureFlags.ts` exporting `MEDIATOR_ENABLED: boolean` derived from `process.env.NEXT_PUBLIC_EDUCATIONAL_MEDIATOR`. Default `false`. ~10 lines.
- **Prerequisites**: None
- **Files**: `lib/featureFlags.ts` (create)
- **Acceptance**: `MEDIATOR_ENABLED` is `false` when env var unset
- **Focused test**: `npm run build`
- **Runtime harness**: N/A (pure logic)
- **Rollback boundary**: Delete `lib/featureFlags.ts`

### T2 — Enrich `data/module1Data.json` ✅
Add optional `"capaEducativa"` (EducationalLayer) to each scenario in `data/module1Data.json`. Preserve all existing fields. ~30 lines added.
- **Prerequisites**: T0
- **Files**: `data/module1Data.json` (modify)
- **Acceptance**: JSON valid; existing fields untouched; `capaEducativa` present on first scenario
- **Focused test**: `node -e "require('./data/module1Data.json')"`
- **Runtime harness**: N/A (data only)
- **Rollback boundary**: `git checkout data/module1Data.json`

### T3 — Enrich `data/module2Data.json` ✅
Same as T2 for `data/module2Data.json`. ~25 lines.
- **Prerequisites**: T0
- **Files**: `data/module2Data.json` (modify)
- **Acceptance**: Same as T2
- **Focused test**: `node -e "require('./data/module2Data.json')"`
- **Runtime harness**: N/A
- **Rollback boundary**: `git checkout data/module2Data.json`

### T4 — Enrich `data/module3Data.json` ✅
Same as T2 for `data/module3Data.json`. ~20 lines.
- **Prerequisites**: T0
- **Files**: `data/module3Data.json` (modify)
- **Acceptance**: Same as T2
- **Focused test**: `node -e "require('./data/module3Data.json')"`
- **Runtime harness**: N/A
- **Rollback boundary**: `git checkout data/module3Data.json`

---

## PR 2 — State Machine + Pause Context (T5–T9)

**Goal**: Core hooks, GamePauseProvider, notebook persistence.

### T5 — Create `hooks/useGamePause.ts`
Create `hooks/useGamePause.ts` exporting `GamePauseProvider` (context) and `useGamePause()` hook. Follow existing `HUDProvider.tsx` pattern: `createContext`, `useCallback` memoization, `localStorage` persistence. ~45 lines.
- **Prerequisites**: None
- **Files**: `hooks/useGamePause.ts` (create)
- **Acceptance**: `useGamePause` returns `{ isPaused, pauseGame, resumeGame }`; provider wraps children
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: N/A (unit logic)
- **Rollback boundary**: Delete `hooks/useGamePause.ts`

### T6 — Create `hooks/useEducationalMediator.ts`
Create `hooks/useEducationalMediator.ts` with `useReducer` state machine (5 states: idle → onIntro → onTipRequested → onErrorConstructive → onMetaReflection). Expose `requestTip()`, `triggerReflection()`, `dismiss()`. ~80 lines.
- **Prerequisites**: T0, T1, T5
- **Files**: `hooks/useEducationalMediator.ts` (create)
- **Acceptance**: State transitions: idle→onTipRequested→idle; idle→onMetaReflection→idle
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: N/A (pure reducer logic)
- **Rollback boundary**: Delete `hooks/useEducationalMediator.ts`

### T7 — Create `hooks/useNotebook.ts`
Create `hooks/useNotebook.ts` with `useState` + `localStorage` for entries (`NotebookEntry[]`). Expose `addEntry()`, `getEntries()`, `clearEntries()`. ~40 lines.
- **Prerequisites**: T0
- **Files**: `hooks/useNotebook.ts` (create)
- **Acceptance**: Entries persist across page reloads; `clearEntries()` empties storage
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: N/A (localStorage mock)
- **Rollback boundary**: Delete `hooks/useNotebook.ts`

### T8 — Create `hooks/useScaffolding.ts`
Create `hooks/useScaffolding.ts` returning `getCurrentTip(level, errorCount)`. Pure function based on `ScaffoldingTip[]` from design.md §3.6. ~35 lines.
- **Prerequisites**: T0
- **Files**: `hooks/useScaffolding.ts` (create)
- **Acceptance**: Returns correct tip for novice+0 errors, intermediate+2 errors, etc.
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: N/A (pure logic)
- **Rollback boundary**: Delete `hooks/useScaffolding.ts`

### T9 — Create `hooks/index.ts` barrel
Create `hooks/index.ts` re-exporting all hooks. ~10 lines.
- **Prerequisites**: T5, T6, T7, T8
- **Files**: `hooks/index.ts` (create)
- **Acceptance**: `import { useEducationalMediator, useNotebook, useScaffolding, useGamePause } from '@/hooks'` resolves
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: N/A
- **Rollback boundary**: Delete `hooks/index.ts`

---

## PR 3 — Core Components (T10–T15)

**Goal**: UI components, CSS animations, error boundaries.

### T10 — Create `components/mediator/EducationalPanel.tsx`
Create `components/mediator/EducationalPanel.tsx`. Fixed overlay panel (`bottom-4 right-4`, `max-w-sm`). Renders `CognitiveConflict` summary + `ScaffoldingTip`. framer-motion `AnimatePresence` for enter/exit. ~70 lines.
- **Prerequisites**: T0, T6
- **Files**: `components/mediator/EducationalPanel.tsx` (create)
- **Acceptance**: Panel visible when `state !== 'idle'`; dismiss button calls `dismiss()`
- **Focused test**: `npx tsc --noEmit && npm run build`
- **Runtime harness**: Manual test with feature flag ON
- **Rollback boundary**: Delete `components/mediator/EducationalPanel.tsx`

### T11 — Create `components/mediator/TipBadge.tsx`
Create `components/mediator/TipBadge.tsx`. Small pill badge showing current `ScaffoldingTip`. Animated entrance (slide-up + fade). ~35 lines.
- **Prerequisites**: T0
- **Files**: `components/mediator/TipBadge.tsx` (create)
- **Acceptance**: Badge shows tip text; animates on mount
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: N/A
- **Rollback boundary**: Delete `components/mediator/TipBadge.tsx`

### T12 — Create `components/mediator/DebriefDialog.tsx` ✅
Create `components/mediator/DebriefDialog.tsx`. Modal dialog for `DebriefReflection`. Three sections: what went wrong, why, learning. Save to notebook on confirm. ~60 lines.
- **Prerequisites**: T0, T7
- **Files**: `components/mediator/DebriefDialog.tsx` (create)
- **Acceptance**: Opens when `state === 'onMetaReflection'`; saves entry on confirm
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: Manual test
- **Rollback boundary**: Delete `components/mediator/DebriefDialog.tsx`

### T13 — Create `components/mediator/index.ts` barrel ✅
Create `components/mediator/index.ts` re-exporting all mediator components. ~8 lines.
- **Prerequisites**: T10, T11, T12
- **Files**: `components/mediator/index.ts` (create)
- **Acceptance**: Barrel exports work
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: N/A
- **Rollback boundary**: Delete `components/mediator/index.ts`

### T14 — Add CSS animations to `styles/globals.css` ✅
Append `@keyframes mediator-slide-up`, `mediator-fade-in`, `mediator-pulse` to `styles/globals.css`. ~20 lines.
- **Prerequisites**: None
- **Files**: `styles/globals.css` (modify)
- **Acceptance**: Keyframes present; no existing styles broken
- **Focused test**: `npm run build`
- **Runtime harness**: N/A
- **Rollback boundary**: `git checkout styles/globals.css`

### T15 — Create `components/ErrorBoundary.tsx` ✅
Create `components/ErrorBoundary.tsx` React error boundary. Catches mediator component errors, logs to console, shows fallback UI. ~40 lines.
- **Prerequisites**: None
- **Files**: `components/ErrorBoundary.tsx` (create)
- **Acceptance**: Wraps mediator components; catches render errors
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: N/A
- **Rollback boundary**: Delete `components/ErrorBoundary.tsx`

---

## PR 4 — Scenario Integration (T16–T20)

**Goal**: Wire mediator into existing module components.

### T16 — Wire into `components/module1/Module1Game.tsx`
Modify `components/module1/Module1Game.tsx`: wrap with `GamePauseProvider`, add `EducationalPanel` below game area, dispatch mediator actions on error events. ~50 lines.
- **Prerequisites**: T5, T6, T10, T15
- **Files**: `components/module1/Module1Game.tsx` (modify)
- **Acceptance**: Panel appears on error; game pauses during mediator interaction
- **Focused test**: `npm run build && npm run lint`
- **Runtime harness**: `npm run dev` → Module 1 → trigger error
- **Rollback boundary**: `git checkout components/module1/Module1Game.tsx`

### T17 — Wire into `components/module2/MicroActivities.tsx`
Same pattern as T16 for module2. ~40 lines.
- **Prerequisites**: T5, T6, T10, T15
- **Files**: `components/module2/MicroActivities.tsx` (modify)
- **Acceptance**: Same as T16
- **Focused test**: `npm run build && npm run lint`
- **Runtime harness**: `npm run dev` → Module 2
- **Rollback boundary**: `git checkout components/module2/MicroActivities.tsx`

### T18 — Wire into `components/module3/MicroActivities.tsx`
Same pattern as T16 for module3. ~35 lines.
- **Prerequisites**: T5, T6, T10, T15
- **Files**: `components/module3/MicroActivities.tsx` (modify)
- **Acceptance**: Same as T16
- **Focused test**: `npm run build && npm run lint`
- **Runtime harness**: `npm run dev` → Module 3
- **Rollback boundary**: `git checkout components/module3/MicroActivities.tsx`

### T19 — Guard all integration with feature flag
Ensure all mediator integrations in T16–T18 are wrapped in `if (!MEDATOR_ENABLED) return`. ~15 lines across files.
- **Prerequisites**: T1, T16, T17, T18
- **Files**: `components/module1/Module1Game.tsx`, `components/module2/MicroActivities.tsx`, `components/module3/MicroActivities.tsx`
- **Acceptance**: With flag OFF, no mediator code executes; zero bundle impact
- **Focused test**: `npm run build && npm run lint`
- **Runtime harness**: `npm run dev` → verify no mediator UI with flag OFF
- **Rollback boundary**: Remove flag checks

### T20 — Add `NotebookPanel.tsx` to HUD
Create `components/mediator/NotebookPanel.tsx` accessible from HUD. Shows saved `NotebookEntry[]`. ~45 lines.
- **Prerequisites**: T7, T13
- **Files**: `components/mediator/NotebookPanel.tsx` (create), `components/HUD.tsx` (modify)
- **Acceptance**: Notebook accessible from HUD; entries display correctly
- **Focused test**: `npm run build && npm run lint`
- **Runtime harness**: `npm run dev` → open notebook
- **Rollback boundary**: Delete file, revert HUD change

---

## PR 5 — Edge Cases + Docs (T21–T27)

**Goal**: Edge cases, integration tests, documentation.

### T21 — Handle empty scenario data
Ensure mediator gracefully handles scenarios without `capaEducativa`. Add null checks in `useEducationalMediator.ts`. ~15 lines.
- **Prerequisites**: T6
- **Files**: `hooks/useEducationalMediator.ts` (modify)
- **Acceptance**: No crash when `capaEducativa` is undefined
- **Focused test**: `npx tsc --noEmit`
- **Runtime harness**: N/A
- **Rollback boundary**: Revert null checks

### T22 — Handle hydration mismatch
Ensure mediator state machine doesn't cause SSR/CSR mismatch. Use `useEffect` for initial state. ~10 lines.
- **Prerequisites**: T6
- **Files**: `hooks/useEducationalMediator.ts` (modify)
- **Acceptance**: No React hydration warning in console
- **Focused test**: `npm run build`
- **Runtime harness**: `npm run dev` → check console
- **Rollback boundary**: Revert changes

### T23 — Performance: memoize mediator callbacks
Ensure `requestTip()`, `dismiss()`, `triggerReflection()` are wrapped in `useCallback`. ~10 lines.
- **Prerequisites**: T6
- **Files**: `hooks/useEducationalMediator.ts` (modify)
- **Acceptance**: No unnecessary re-renders in React DevTools
- **Focused test**: `npm run build`
- **Runtime harness**: React DevTools Profiler
- **Rollback boundary**: Revert memoization

### T24 — Accessibility: keyboard navigation
Ensure `EducationalPanel` and `DebriefDialog` support Escape to close, Tab navigation. ~20 lines.
- **Prerequisites**: T10, T12
- **Files**: `components/mediator/EducationalPanel.tsx`, `components/mediator/DebriefDialog.tsx` (modify)
- **Acceptance**: Escape closes panel; Tab cycles through focusable elements
- **Focused test**: Manual keyboard test
- **Runtime harness**: `npm run dev` → keyboard-only navigation
- **Rollback boundary**: Revert accessibility changes

### T25 — Add `module4Data.json` enrichment (optional)
Enrich `data/module4Data.json` with `capaEducativa` if scenarios exist. ~15 lines.
- **Prerequisites**: T0
- **Files**: `data/module4Data.json` (modify)
- **Acceptance**: JSON valid; optional fields added
- **Focused test**: `node -e "require('./data/module4Data.json')"`
- **Runtime harness**: N/A
- **Rollback boundary**: `git checkout data/module4Data.json`

### T26 — Write integration smoke test
Create `__tests__/mediator-integration.test.tsx` testing: mediator renders when flag ON, hidden when OFF, state transitions work. ~60 lines.
- **Prerequisites**: T1, T5, T6, T10
- **Files**: `__tests__/mediator-integration.test.tsx` (create)
- **Acceptance**: Tests pass with `npm test`
- **Focused test**: `npm test`
- **Runtime harness**: Jest
- **Rollback boundary**: Delete test file

### T27 — Update README with feature flag instructions
Add section to README.md explaining: env var setup, feature flag behavior, how to enable/disable. ~25 lines.
- **Prerequisites**: None
- **Files**: `README.md` (modify)
- **Acceptance**: README documents `NEXT_PUBLIC_EDUCATIONAL_MEDIATOR` usage
- **Focused test**: N/A (documentation)
- **Runtime harness**: N/A
- **Rollback boundary**: Revert README changes

---

## Dependency Graph

```
T0 ──┬── T2 ── T4
     ├── T3 ── T4
     ├── T5 ── T6 ──┬── T10 ── T16 ── T19
     │              ├── T11 ── T13 ── T20
     │              └── T12 ── T24
     ├── T7 ── T12, T20
     ├── T8 ── T9
     └── T1 ── T19, T21
     
T14, T15 ── T16, T17, T18

T22, T23 ── (standalone after T6)
T25 ── (standalone after T0)
T26 ── (after T1, T5, T6, T10)
T27 ── (standalone)
```
