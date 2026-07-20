# Proposal: MIA Agent — Interactive AI Guide

## Intent

CyberGuardians has gamification (HUD, XP, shields) and educational scaffolding (mediator, debrief), but no **socioemotional presence**. Students navigating cybersecurity challenges alone lack a guide that reacts to their emotional state — celebrating wins, softening failures, and nudging when stuck. MIA fills this gap as an always-visible animated agent that adapts to gameplay events in real time.

## Scope

### In Scope
- `types/mia.ts` — `MIAEmotion`, `MIADialogueSchema`, `MIAAgentState` types (zero `any`)
- `hooks/useMIA.ts` — connects to HUDContext, listens to `damageShield`, `addXP`, `completeChallenge`, hint button; exposes `emotion`, `dialogue`, `triggerMIA()`
- `components/shared/MIAgent.tsx` — floating avatar (bottom-right), CSS/Framer Motion animated, comic-neon bubble with typewriter effect
- `data/miaDialogues.json` — dialogue bank segmented by module × emotion (5 states × modules)
- 5 MIA emotional states: IDLE, EXCITED, SAMPLED_ERROR, MISSION_BRIEF, PROVIDING_CLUE
- Framer Motion spring transitions, elastic scaling, chromatic pulsation
- Cleanup on route changes (no memory leaks)

### Out of Scope
- Real AI/LLM integration (dialogues are static JSON, not generated)
- Voice/audio output
- Mobile-responsive repositioning (desktop-first for v1)
- Persistence of MIA interaction history
- Integration with external chatbot APIs

## Capabilities

### New Capabilities
- `mia-agent`: Core MIA component, hook, types, and animation system
- `mia-dialogues`: Dialogue data schema and content bank by module/emotion

### Modified Capabilities
- None — MIA is additive, does not change existing HUD, mediator, or game state specs

## Approach

1. Define types in `types/mia.ts` — discriminated union for emotions, dialogue schema matching module structure
2. Build `useMIA` hook — subscribes to HUDContext via `useEffect`, maps game events to emotions with debounce timers, exposes `triggerMIA()` for explicit requests
3. Build `MIAgent.tsx` — `motion.div` with clip-path angular container, neon cyan border, CSS-animated avatar (no images), `AnimatePresence` for bubble enter/exit, ultra-fast typewriter via `useEffect` interval
4. Create `miaDialogues.json` — structured by `{moduleId: {emotion: string[]}}` for deterministic fallback
5. Wire into `app/layout.tsx` alongside existing `<HUD />`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `types/mia.ts` | New | MIA type definitions |
| `hooks/useMIA.ts` | New | Event listener hook connecting HUD → MIA |
| `components/shared/MIAgent.tsx` | New | Floating animated agent component |
| `data/miaDialogues.json` | New | Dialogue content bank |
| `app/layout.tsx` | Modified | Add `<MIAgent />` after `<HUD />` |
| `hooks/index.ts` | Modified | Export `useMIA` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Animation jank on low-end devices | Medium | Respect `prefers-reduced-motion`, CSS fallbacks |
| Typewriter effect blocks reading | Low | Cap at 30ms/char, allow click-to-reveal |
| Dialogue fatigue (repetition) | Medium | Shuffle within emotion pool, cooldown timers |
| Memory leaks from event listeners | Low | Cleanup in `useEffect` return, route change handler |

## Rollback Plan

Remove `<MIAgent />` from `layout.tsx`, delete `components/shared/MIAgent.tsx`, `hooks/useMIA.ts`, `types/mia.ts`, `data/miaDialogues.json`. Remove export from `hooks/index.ts`. No existing behavior is modified — pure additive feature.

## Dependencies

- Framer Motion (already installed)
- HUDContext from `components/HUDProvider.tsx` (existing)
- No new npm packages required

## Success Criteria

- [ ] MIA renders in bottom-right corner across all routes
- [ ] Emotion state transitions within 500ms of shield damage / XP gain / challenge completion
- [ ] Typewriter effect completes dialogue in < 2s for longest string
- [ ] Zero console errors on route navigation
- [ ] `prefers-reduced-motion` disables all animations gracefully
- [ ] All types pass TypeScript strict mode with zero `any`
