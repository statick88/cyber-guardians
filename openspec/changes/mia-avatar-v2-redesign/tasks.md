# Tasks: mia-avatar-v2-redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~340 (63 dialogue entries = ~190, code = ~150) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

---

## Phase 1: Foundation — Types and Hook

- [ ] 1.1 `types/mia.ts`: Add `'CORRECT' | 'INCORRECT' | 'THINKING'` to `MIAEmotion` union
- [ ] 1.2 `types/mia.ts`: Add `source?: 'hud' | 'quiz'` param to `UseMIAReturn.triggerMIA`
- [ ] 1.3 `hooks/useMIA.ts`: Add `COOLDOWN_QUIZ_MS = 1500` constant
- [ ] 1.4 `hooks/useMIA.ts`: Update `triggerMIA` to accept `source` param and use `source === 'quiz' ? COOLDOWN_QUIZ_MS : COOLDOWN_MS` for cooldown

## Phase 2: Visual — EMOTION_STYLES and Avatar

- [ ] 2.1 `components/mia/MIAAgent.tsx`: Add CORRECT (green #22c55e), INCORRECT (red #ef4444), THINKING (amber #f59e0b) entries to `EMOTION_STYLES`
- [ ] 2.2 `components/mia/MIAAgent.tsx`: Add `correct`, `incorrect`, `thinking` entries to `avatarVariants`
- [ ] 2.3 `components/mia/MIAAgent.tsx`: Add cases to `getAvatarVariant` switch for new emotions

## Phase 3: Dialogues

- [ ] 3.1 `data/miaDialogues.json`: Add 21 CORRECT entries (3 per module × 7 modules)
- [ ] 3.2 `data/miaDialogues.json`: Add 21 INCORRECT entries (3 per module × 7 modules)
- [ ] 3.3 `data/miaDialogues.json`: Add 21 THINKING entries (3 per module × 7 modules)

## Phase 4: Quiz Component Props

- [ ] 4.1 `components/ScenarioCard.tsx`: Add `onMIAEmotion?` prop; call on correct/incorrect
- [ ] 4.2 `components/module5/DeepfakeDetector.tsx`: Add `onMIAEmotion?` prop; call before `onScore`
- [ ] 4.3 `components/module1/DragDropActivity.tsx`: Add `onMIAEmotion?` prop
- [ ] 4.4 `components/module2/DragDropDefense.tsx`: Add `onMIAEmotion?` prop
- [ ] 4.5 `components/module3/SeñalesDragDrop.tsx`: Add `onMIAEmotion?` prop
- [ ] 4.6 `components/module1/MicroActivities.tsx`: Add `onMIAEmotion?` prop
- [ ] 4.7 `components/module2/MicroActivities.tsx`: Add `onMIAEmotion?` prop
- [ ] 4.8 `components/module3/MicroActivities.tsx`: Add `onMIAEmotion?` prop
- [ ] 4.9 `components/module4/MicroActivities.tsx`: Add `onMIAEmotion?` prop
- [ ] 4.10 `components/module5/MicroActivities.tsx`: Add `onMIAEmotion?` prop
- [ ] 4.11 `components/module6/MicroActivities.tsx`: Add `onMIAEmotion?` prop
- [ ] 4.12 `components/MicroActivity.tsx`: Add `onMIAEmotion?` prop (if completion events warrant it)

## Phase 5: Module Page Wiring

- [ ] 5.1 `app/modulo0/` (Modulo0Game or page): Import `useMIA`, pass `triggerMIA` as `onMIAEmotion` to `ScenarioCard` and `MicroActivity`
- [ ] 5.2 `app/modulo1/`: Import `useMIA`, wire to `DragDropActivity` + `MicroActivities`
- [ ] 5.3 `app/modulo2/page.tsx`: Import `useMIA`, wire to children
- [ ] 5.4 `app/modulo3/page.tsx`: Import `useMIA`, wire to `SeñalesDragDrop` + `MicroActivities`
- [ ] 5.5 `app/modulo4/page.tsx`: Import `useMIA`, wire to children
- [ ] 5.6 `app/modulo5/page.tsx`: Import `useMIA`, wire to `DeepfakeDetector` + `MicroActivities`
- [ ] 5.7 `app/modulo6/page.tsx`: Import `useMIA`, wire to children

## Phase 6: Testing

- [ ] 6.1 Unit test: `useMIA` quiz cooldown (1.5s) vs HUD cooldown (3s)
- [ ] 6.2 Unit test: `selectDialogue` fallback chain with CORRECT/INCORRECT/THINKING
- [ ] 6.3 Unit test: `getAvatarVariant` returns correct variant for all 8 emotions
- [ ] 6.4 Integration test: ScenarioCard fires `onMIAEmotion` on answer
- [ ] 6.5 Verify TypeScript compiles with strict mode (exhaustive Record check)
