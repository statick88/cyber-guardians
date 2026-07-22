# Design: mia-avatar-v2-redesign

## Technical Approach

Extend MIA's existing emotion system (5 emotions → 8) by modifying four layers: type system, hook logic, visual component, and dialogue bank. Quiz components gain an optional callback prop; parent module pages wire it via `useMIA().triggerMIA`. No new libraries required — Framer Motion and existing patterns handle all animations.

## Architecture Decisions

### Decision: Dual cooldown (1.5s quiz / 3s HUD)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single 3s cooldown | Simple, but quiz feels sluggish (student waits 3s between reactions) | Rejected |
| Per-emotion cooldowns | Complex state tracking, hard to maintain | Rejected |
| Dual source-based cooldown | Simple: `source === 'quiz' ? 1500 : 3000`, one `lastEmotionChange` ref | **Chosen** |

### Decision: `onMIAEmotion` optional prop vs. Context/proxy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| React Context provider | Quiz components would import context, breaking isolation | Rejected |
| Global event bus | Decouples too much, hard to trace, testing nightmare | Rejected |
| Optional callback prop | Simple, composable, opt-in, no new imports for quiz components | **Chosen** |

### Decision: THINKING state without dedicated cooldown exemption

| Option | Tradeoff | Decision |
|--------|----------|----------|
| THINKING bypasses cooldown | Risk of rapid CORRECT→THINKING→CORRECT churn | Rejected |
| THINKING uses same 1.5s quiz cooldown | Prevents spam, quiz components fire THINKING only for genuine delays | **Chosen** |
| Remove THINKING from quiz flow | Loses MIA personality during processing | Rejected |

## Data Flow

```
Quiz Component                    useMIA Hook                    MIAAgent
─────────────                    ───────────                    ────────
onMIAEmotion('CORRECT')    →    triggerMIA(emotion, moduleId,  →  setEmotion('CORRECT')
                                 'quiz')                         selectDialogue('CORRECT', moduleId)
                                                                 setIsVisible(true)
                                                                         │
                                                          ┌──────────────┘
                                                          ▼
                                                  EMOTION_STYLES[emotion]
                                                  → border, glow, label, emoji
                                                          │
                                                          ▼
                                                  MiaAvatar(color, size, pulse)
                                                  → animated glow halo
```

## File Changes

| File | Action | What Changes |
|------|--------|-------------|
| `types/mia.ts` | Modify | Add `CORRECT`, `INCORRECT`, `THINKING` to `MIAEmotion` union; add `source?` param to `UseMIAReturn.triggerMIA` |
| `hooks/useMIA.ts` | Modify | Add `COOLDOWN_QUIZ_MS = 1500`; update `triggerMIA` signature to accept `source?: 'hud' | 'quiz'`; apply source-based cooldown |
| `components/mia/MIAAgent.tsx` | Modify | Add 3 entries to `EMOTION_STYLES`; add 3 entries to `avatarVariants`; update `getAvatarVariant` switch |
| `components/mia/MiaAvatar.tsx` | No change | Existing `color`, `pulse`, `glow` props already support new emotions |
| `data/miaDialogues.json` | Modify | Add 63 dialogue entries (3 emotions × 7 modules × 3 entries) |
| `components/ScenarioCard.tsx` | Modify | Add `onMIAEmotion?: MIAEmotionCallback` to props; call `onMIAEmotion?.('CORRECT' or 'INCORRECT')` on answer |
| `components/module5/DeepfakeDetector.tsx` | Modify | Add `onMIAEmotion?` prop; call before `onScore` |
| `components/module1/DragDropActivity.tsx` | Modify | Add `onMIAEmotion?` prop; call on correct/incorrect |
| `components/module2/DragDropDefense.tsx` | Modify | Add `onMIAEmotion?` prop |
| `components/module3/SeñalesDragDrop.tsx` | Modify | Add `onMIAEmotion?` prop |
| `components/module1/MicroActivities.tsx` | Modify | Add `onMIAEmotion?` prop |
| `components/module2/MicroActivities.tsx` | Modify | Add `onMIAEmotion?` prop |
| `components/module3/MicroActivities.tsx` | Modify | Add `onMIAEmotion?` prop |
| `components/module4/MicroActivities.tsx` | Modify | Add `onMIAEmotion?` prop |
| `components/module5/MicroActivities.tsx` | Modify | Add `onMIAEmotion?` prop |
| `components/module6/MicroActivities.tsx` | Modify | Add `onMIAEmotion?` prop |
| `components/MicroActivity.tsx` | Modify | Add `onMIAEmotion?` prop (if completion events warrant it) |
| `app/modulo0/` (Modulo0Game or page) | Modify | Import `useMIA`, pass `triggerMIA` to `ScenarioCard`, `MicroActivity` |
| `app/modulo1/` | Modify | Import `useMIA`, pass `triggerMIA` to children |
| `app/modulo2/page.tsx` | Modify | Import `useMIA`, pass `triggerMIA` to children |
| `app/modulo3/page.tsx` | Modify | Import `useMIA`, pass `triggerMIA` to children |
| `app/modulo4/page.tsx` | Modify | Import `useMIA`, pass `triggerMIA` to children |
| `app/modulo5/page.tsx` | Modify | Import `useMIA`, pass `triggerMIA` to `DeepfakeDetector`, `MicroActivities` |
| `app/modulo6/page.tsx` | Modify | Import `useMIA`, pass `triggerMIA` to children |

**Totals**: ~25 files modified, 0 new files, 0 deleted.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `useMIA` cooldown behavior (quiz vs HUD sources) | Vitest + renderHook; mock `useHUD` |
| Unit | `selectDialogue` fallback chain with new emotions | Vitest; mock dialogueBank |
| Unit | `getAvatarVariant` returns correct variant for all 8 emotions | Vitest; switch exhaustiveness |
| Integration | Quiz component fires `onMIAEmotion` on answer | Vitest; render `ScenarioCard` with mock callback |
| Integration | Module page wires `triggerMIA` to quiz children | Vitest; render page with mocked `useMIA` |
| Visual | Avatar glow color changes per emotion | Manual or Storybook (existing setup) |
| E2E | Student answers quiz → MIA reacts visually | Playwright/Cypress (existing e2e infra) |

## Migration / Rollout

No migration required. Changes are purely additive:
- New emotions are additions to an existing union type
- `onMIAEmotion` is optional — components without it work identically
- Dialogue entries append to existing JSON array
- No database, no API, no feature flags needed

**Rollout**: Deploy all changes together. The system degrades gracefully — if a quiz component hasn't been wired yet, MIA simply doesn't react to that quiz.

## Open Questions

- [ ] Should `MicroActivity` (module 0 ordering puzzle) fire THINKING during puzzle assembly, or just CORRECT/INCORRECT on completion?
- [ ] Module 4 `QuizAMF.tsx` — does it have score events? Need to verify before wiring.
- [ ] `DragDropDefense` (module 2) — confirm score event pattern matches `DragDropActivity`.
