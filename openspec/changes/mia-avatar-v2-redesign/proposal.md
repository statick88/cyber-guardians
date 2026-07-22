# Proposal: mia-avatar-v2-redesign

## Intent

MIA's avatar is visually generic (purple hair, headset, no personality) and, critically, **completely disconnected from quiz interactions**. The `triggerMIA()` function is exposed by `useMIA` but never called by any quiz component — MIA only reacts to HUD-level events (shield damage, XP gain). Students complete quizzes in silence while MIA sits idle. This redesign brings MIA to life as a reactive quiz companion: new avatar design, animated glow halo, and three new emotions (CORRECT, INCORRECT, THINKING) that quiz components actually trigger.

## Scope

### In Scope
1. **Avatar v2 SVG**: Long flowing purple hair (#9d4edd), tech headband (magenta/cyan), expressive eyes, smiling face, ~60px default
2. **Animated glow halo**: Drop-shadow/box-shadow responding to active state via Framer Motion
3. **Three new emotions**: `CORRECT`, `INCORRECT`, `THINKING` — extend `MIAEmotion` type
4. **Quiz → MIA wiring**: Add `onMIAEmotion?` callback to quiz component interfaces; wire via parent module components
5. **Dialogue entries**: Add CORRECT/INCORRECT/THINKING dialogues for modules 0–6
6. **EMOTION_STYLES expansion**: Visual mapping for new emotions (border, glow, label, emoji, color)

### Out of Scope
- Modifying quiz scoring logic or difficulty
- Changing MIA's HUD-driven behavior (shield/XP triggers remain as-is)
- Adding new quiz component types
- Redesigning the speech bubble or typewriter system
- Mobile responsiveness changes

## Capabilities

### New Capabilities
- `mia-quiz-reactivity`: Wiring quiz components to MIA emotion system via callback prop pattern

### Modified Capabilities
- `mia-agent`: Extend emotion state machine with 3 new states (CORRECT, INCORRECT, THINKING); add triggerMIA call from quiz callbacks; reduce cooldown from 3s to 1.5s for quiz responses
- `mia-dialogues`: Add CORRECT/INCORRECT/THINKING dialogue entries per module; extend dialogue bank schema

## Approach

1. Extend `MIAEmotion` type in `types/mia.ts` with `CORRECT | INCORRECT | THINKING`
2. Add `EMOTION_STYLES` entries in `MIAAgent.tsx` for new emotions
3. Replace `MiaAvatar.tsx` SVG with v2 design (same viewBox 120×120, same props interface)
4. Add Framer Motion animated glow halo to avatar container
5. Add optional `onMIAEmotion?: (emotion: MIAEmotion) => void` to quiz component interfaces
6. Wire quiz components: DeepfakeDetector, DragDropActivity, ScenarioChallenge, MicroActivities fire `onMIAEmotion('CORRECT'|'INCORRECT')` on score; Thinking state triggers on loading/processing phases
7. Add dialogue entries to `miaDialogues.json` for new emotions × modules 0–6
8. Reduce cooldown from 3s → 1.5s for quiz-triggered emotions (keep 3s for HUD events)

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/mia/MiaAvatar.tsx` | Modified | Complete SVG redesign — new hair, headband, eyes |
| `components/mia/MIAAgent.tsx` | Modified | Add CORRECT/INCORRECT/THINKING to EMOTION_STYLES; animated glow halo |
| `types/mia.ts` | Modified | Extend MIAEmotion union type |
| `hooks/useMIA.ts` | Modified | Add separate cooldown for quiz vs HUD triggers |
| `data/miaDialogues.json` | Modified | Add ~63 new dialogue entries (3 emotions × 7 modules × 3 entries) |
| `components/quiz/*.tsx` (12 files) | Modified | Add onMIAEmotion prop, call it on score events |
| `components/modules/*.tsx` | Modified | Wire onMIAEmotion callback from useMIA to quiz children |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| 12 quiz component modifications are repetitive | High | Mechanical changes — batch in single PR; use consistent pattern |
| Cooldown 1.5s too short → rapid flickering | Medium | Test with rapid quiz answers; can increase to 2s |
| Quiz components missing onMIAEmotion prop breaks build | Low | TypeScript strict mode catches missing props at compile time |
| New SVG breaks existing avatar proportions | Low | Keep same viewBox (120×120) and props interface |

## Rollback Plan

1. Revert `types/mia.ts` to original 5-emotion union
2. Revert `MiaAvatar.tsx` to v1 SVG
3. Remove `onMIAEmotion` prop from quiz interfaces
4. Remove new dialogue entries from `miaDialogues.json`
5. Remove EMOTION_STYLES entries for new emotions
6. All changes are component-level — no data migration needed

## Dependencies

- None — all changes are self-contained within existing MIA and quiz component tree

## Success Criteria

- [ ] MiaAvatar renders v2 design (long purple hair, tech headband) at 60px default
- [ ] Animated glow halo responds to emotion transitions
- [ ] CORRECT/INCORRECT/THINKING emotions visible in MIAAgent UI
- [ ] Quiz components call `onMIAEmotion` on score events
- [ ] MIA responds to correct/incorrect answers with appropriate emotion + dialogue
- [ ] TypeScript strict: zero errors, zero `any` types
- [ ] Existing HUD-driven MIA behavior unchanged (shield/XP triggers still work)
- [ ] Dialogue bank has ≥3 entries per new emotion per module
