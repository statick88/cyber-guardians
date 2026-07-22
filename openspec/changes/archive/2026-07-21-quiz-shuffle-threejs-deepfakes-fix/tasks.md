# Tasks: quiz-shuffle-threejs-deepfakes-fix

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~80-120 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | MC integration + maxScore fix | PR 1 | `pnpm tsc --noEmit && pnpm build` | Dev server: classify artifact → verify MC appears → answer → verify score increments by 8 per scenario | DeepfakeDetector.tsx + modulo5/page.tsx only |

## Phase 1: Props & Page Wiring

- [x] 1.1 Update `DeepfakeDetector` Props interface — add `pregunta: string`, `opciones: string[]`, `respuestaCorrecta: number` to `components/module5/DeepfakeDetector.tsx`
- [x] 1.2 Update `modulo5/page.tsx` — pass `scenario.pregunta`, `scenario.opciones`, `scenario.respuestaCorrecta` to `<DeepfakeDetector>` in the `case 'detector'` branch
- [x] 1.3 Fix maxScore in `modulo5/page.tsx` — change `escenarios.length * 4` to `escenarios.length * 8` (each scenario now = 4 classify + 4 MC)

## Phase 2: Phase State Machine in DeepfakeDetector

- [x] 2.1 Add `Phase` type (`'classify' | 'mc'`) and `phase` state to DeepfakeDetector
- [x] 2.2 Add `mcAnswer: number | null` state for tracking selected MC option
- [x] 2.3 After classification feedback, transition to `phase='mc'` via "Siguiente" button — keep existing classification flow for `phase='classify'`
- [x] 2.4 Implement `handleMCAnswer(originalIndex)` — compare `originalIndex` against `respuestaCorrecta`, call `onScore(4)` if correct, play sound, set feedback

## Phase 3: MC Question UI

- [x] 3.1 Import `useQuizShuffle` into DeepfakeDetector
- [x] 3.2 Create `MCOption[]` — pair each option string with `originalIndex` (`{ text, originalIndex }[]`)
- [x] 3.3 Shuffle paired array via `useQuizShuffle(pairedOptions, \`mc-${currentIndex}\`)`
- [x] 3.4 Render MC phase: question text, shuffled option buttons with AnimatePresence animation, feedback on answer, "Siguiente →" / "Ver Resultados" button
- [x] 3.5 On "Siguiente" from MC phase: reset phase to `'classify'`, advance `currentIndex`, call `handleNext` logic

## Phase 4: Verification

- [x] 4.1 Run `pnpm tsc --noEmit` — confirm no type errors
- [x] 4.2 Run `pnpm build` — confirm clean production build
- [x] 4.3 Manual verification: classify artifact → MC appears inline → select correct answer → score shows +8 per scenario
- [x] 4.4 Verify `maxScore` matches actual possible score (4 scenarios × 8 = 32 deepfake pts)

## Risks

- **maxScore mismatch**: Current `escenarios.length * 4` must become `* 8` — easy to miss, breaks results screen scoring. (Mitigated by task 1.3)
- **Session-storage shuffle cache**: `useQuizShuffle` caches per key — `mc-${currentIndex}` ensures each scenario shuffles independently. No collision risk.
- **Framer Motion AnimatePresence**: Phase transitions must use `mode="wait"` and unique `key` per phase to animate correctly.
