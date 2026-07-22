# Proposal: quiz-shuffle-threejs-deepfakes-fix

## Intent

Module 5 ("Deepfake Defender") has **4 multiple-choice questions embedded in `escenarios` data that never render in the UI**. The `DeepfakeDetector` component processes artifacts for REAL/DEEPFAKE classification but ignores each scenario's `pregunta`, `opciones`, and `respuestaCorrecta` fields — dead educational content. Additionally, Module 5's `MicroActivities` component only handles `'verdadero-falso'` type, with no path for MC questions. Three.js background and Deepfakes spelling were verified working/correct in the prior phase.

## Scope

### In Scope
- **Module 5 MC question rendering**: Add MC question display to `DeepfakeDetector` (after artifact classification, show the scenario's `pregunta` + shuffled `opciones`)
- **Shuffle integration**: Apply `useQuizShuffle` to MC option arrays in Module 5, matching Module 0's `ScenarioCard` pattern
- **Index-to-answer mapping**: Bridge `respuestaCorrecta: number` (index) → answer comparison (Module 0 uses `esCorrecta` boolean; Module 5 uses index)
- **Verify Three.js**: Confirm `BackgroundScene` renders on main menu (layout.tsx already imports it)
- **Confirm Deepfakes spelling**: No misspellings found — "Deepfakes" is correct across all files

### Out of Scope
- Adding new question types (`completar-codigo`, `ordenar-pasos`) to Module 5 MicroActivities
- Refactoring other modules' MicroActivities
- Modifying quiz shuffle infrastructure (already working)
- Adding new content or scenarios

## Capabilities

### New Capabilities
- `module5-mc-rendering`: MC question display with shuffle for Module 5 escenarios

### Modified Capabilities
- None — quiz shuffle infrastructure and Three.js background are unchanged

## Approach

1. **Extend `DeepfakeDetector.tsx`** to render the scenario's MC question after artifact classification feedback:
   - Extract `pregunta`, `opciones`, `respuestaCorrecta` from the escenario data
   - Add a new phase after artifact classification: MC question display
   - Use `useQuizShuffle` on `opciones` array
   - Compare selected index against `respuestaCorrecta`

2. **Update `app/modulo5/page.tsx`** to pass `pregunta`, `opciones`, `respuestaCorrecta`, `explicacion` to `DeepfakeDetector`

3. **Verify Three.js**: Visual check that `BackgroundScene` renders in layout

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/module5/DeepfakeDetector.tsx` | Modified | Add MC question phase after artifact classification |
| `app/modulo5/page.tsx` | Modified | Pass escenario MC fields to DeepfakeDetector |
| `types/module5.ts` | Unchanged | `DeepfakeScenario` already has all needed fields |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Module 5 activity flow becomes too long (artifact + MC) | Low | MC is 1 question per scenario; total time impact < 2 min |
| Shuffle key collision across scenarios | Low | Use `deepfake-mc-${scenario.id}` unique keys |
| `respuestaCorrecta` index mismatch after shuffle | Low | Track original index via `getOriginalIndex` pattern from ScenarioCard |

## Rollback Plan

Revert `DeepfakeDetector.tsx` and `page.tsx` changes. MC questions return to being dead data (current state). No data loss since `module5Data.json` is unchanged.

## Dependencies

- `useQuizShuffle` hook (existing, verified)
- `useQuizSound` hook (already imported in DeepfakeDetector)

## Success Criteria

- [ ] Module 5 escenario MC questions render with shuffled options
- [ ] Correct answer validation works with index-based `respuestaCorrecta`
- [ ] Three.js `BackgroundScene` visible on main menu
- [ ] "Deepfakes" spelling consistent (no misspellings)
- [ ] Existing artifact classification flow unaffected
