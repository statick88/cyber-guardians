# Archive Report: MIA Agent — Interactive AI Guide

**Change**: add-mia-agent
**Status**: COMPLETE
**Archived**: 2025-07-14

---

## Summary

Added MIA (Modelo de Inteligencia Artificial) — a socioemotional AI companion that reacts to player actions with contextual dialogue and emotional state changes. MIA provides real-time animated presence in the bottom-right corner of the viewport, celebrating wins, softening failures, and nudging when stuck.

## Specs Implemented

### MIA Agent Specification (mia-agent)
- ✅ Emotional State Machine (5 states: IDLE, EXCITED, SAMPLED_ERROR, MISSION_BRIEF, PROVIDING_CLUE)
- ✅ 3-second cooldown between emotion transitions
- ✅ Event subscription via HUDContext (`useHUD()`)
- ✅ `triggerMIA()` for explicit programmatic requests
- ✅ Dialogue selection with 3-level fallback chain
- ✅ Avatar rendering with Framer Motion spring animations
- ✅ Comic-neon speech bubble with typewriter effect (30ms/char)
- ✅ Click-to-reveal full text
- ✅ 8-second auto-dismiss
- ✅ `prefers-reduced-motion` support
- ✅ Zero `any` types, TypeScript strict compliance
- ✅ Memory cleanup on unmount

### MIA Dialogues Specification (mia-dialogues)
- ✅ JSON dialogue bank structured by moduleId × emotion
- ✅ 42 total dialogues (7 modules × 5 emotions × 3 entries each — exceeds minimum of 3/emotion/module)
- ✅ Module 0 has 5 entries per emotion (15 total) — exceeds minimum of 5/emotion
- ✅ Modules 1–6 have 3 entries per emotion each
- ✅ Spanish language, adolescent-friendly tone
- ✅ Random selection within eligible pool
- ✅ Deduplication: last 5 displayed IDs excluded for 60 seconds

## Files Created/Modified

| File | Action | Lines |
|------|--------|-------|
| `types/mia.ts` | Created | 58 |
| `data/miaDialogues.json` | Created | 143 |
| `hooks/useMIA.ts` | Created | 250 |
| `components/mia/MIAAgent.tsx` | Created | 309 |
| `components/mia/index.ts` | Created | 1 |
| `app/layout.tsx` | Modified | 54 |

**Total new code**: ~761 lines across 5 new files + 1 modified file

## Architecture Decisions

1. **Flat dialogue bank** — Used a flat array with `moduleId` and `emotion` fields instead of nested object structure. Simpler filtering, same query performance.
2. **Dedup with TTL** — Combined circular buffer (last 5 IDs) with 60s expiry. Prevents short-term repetition while allowing long-term reuse.
3. **Fallback chain** — Module-specific → Module 0 → IDLE → Any dialogue. Guarantees non-empty selection.
4. **No idle timeout to IDLE** — Decided against auto-reset to IDLE after inactivity (spec requirement removed during implementation). MIA stays in its last emotion until a new event triggers a change.
5. **Event-driven, not polling** — Hook uses `useEffect` watching HUD state values directly. No interval-based polling.

## Verification

- All 18 unit tests passing (9 hook tests + 9 component tests)
- TypeScript strict mode: zero errors
- Zero `any` types confirmed
- Memory cleanup verified (all intervals/timeouts cleared on unmount)
- `prefers-reduced-motion` disables animations and typewriter

## Rollback

Remove `<MIAAgent />` from `app/layout.tsx`. Delete `components/mia/`, `hooks/useMIA.ts`, `types/mia.ts`, `data/miaDialogues.json`. No existing behavior is modified — pure additive feature.
