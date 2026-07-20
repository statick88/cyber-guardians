# Design: MIA Agent — Interactive AI Guide

## Technical Approach

MIA is an additive, event-driven component that subscribes to HUDContext state changes via a custom `useMIA` hook. The hook implements a finite state machine mapping HUD events to 5 emotional states. The `MIAgent` component renders a floating avatar + speech bubble with Framer Motion spring animations and a CSS typewriter effect. No new npm dependencies — uses existing Framer Motion + Tailwind + `globals.css` patterns.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `useMIA` hook vs. context provider | Provider adds nesting; hook is simpler, single consumer | **Hook** — MIA is the sole consumer, no prop drilling needed |
| Event subscription via `useEffect` deps vs. custom EventEmitter | `useEffect` is simpler but less decoupled | **`useEffect` on HUD state** — HUD already batches state; custom emitter adds complexity for no benefit |
| Static JSON dialogues vs. template strings | JSON is rigid; templates allow dynamic interpolation | **Static JSON** — proposal explicitly excludes LLM; templates can be added later without breaking changes |
| `clip-path` polygon vs. SVG speech bubble | SVG is more flexible but heavier; clip-path is pure CSS | **`clip-path`** — matches comic-neon aesthetic, zero DOM overhead |

## Animation State Machine

### States & Transitions

```
IDLE ──────► EXCITED ──────► IDLE
  │               │
  ▼               ▼
SAMPLED_ERROR  MISSION_BRIEF ──► PROVIDING_CLUE
  │               │                    │
  └───────────────┴────────────────────┘
                  (cooldown → IDLE)
```

### Framer Motion Spring Configs

| Transition | Config | Rationale |
|------------|--------|-----------|
| IDLE → EXCITED | `{ type: 'spring', stiffness: 400, damping: 15 }` | Elastic bounce, high energy |
| IDLE → SAMPLED_ERROR | `{ type: 'spring', stiffness: 200, damping: 20 }` | Slower, concern response |
| Any → MISSION_BRIEF | `{ type: 'spring', stiffness: 300, damping: 25 }` | Confident entrance |
| Any → PROVIDING_CLUE | `{ type: 'spring', stiffness: 250, damping: 18 }` | Gentle reveal |
| Exit bubble | `{ opacity: 0, y: 8, scale: 0.95, duration: 0.15 }` | Quick fade-out |

### Avatar Animations per State

| State | Animation | CSS/Tailwind |
|-------|-----------|--------------|
| IDLE | Gentle breathing (scale 1→1.03→1) | `animate-float` (existing keyframe) |
| EXCITED | Pulse glow + scale 1→1.08 | `animate-pulse-neon` + Framer `scale` |
| SAMPLED_ERROR | Subtle shake + dim | Framer `x: [0,-2,2,0]` + `opacity: 0.7` |
| MISSION_BRIEF | Steady glow, confident pose | `animate-glow-pulse` (existing) |
| PROVIDING_CLUE | Thinking dots → reveal | 3-dot CSS animation before text |

### Typewriter Implementation

`useEffect` with `setInterval` at 25ms/character. State: `displayedChars: number`. Click-to-reveal: sets `displayedChars = text.length`. Cap: 2s max for any string. Prefers-reduced-motion: instant reveal.

## Data Flow

```
HUDContext (shieldHP, xp, completedChallenges)
    │
    ▼ useEffect dependencies
useMIA hook
    │
    ├─ Event Filter: compares prev vs current state
    │   ├─ shieldHP decreased → SAMPLED_ERROR (if > 0)
    │   ├─ shieldHP 0 → MISSION_BRIEF (critical)
    │   ├─ xp increased → EXCITED
    │   ├─ completedChallenges changed → EXCITED (longer duration)
    │   └─ No change → stays IDLE
    │
    ├─ Cooldown: 4s minimum between state changes
    │   (prevents rapid oscillation on multi-damage)
    │
    ├─ Dialogue Selector: random from pool[moduleId][emotion]
    │   └─ Fallback: pool['general'][emotion] if module has < 2 lines
    │
    └─ Returns { emotion, dialogue, triggerMIA, isTyping }
         │
         ▼
MIAgent.tsx renders:
    ├─ Avatar (emotion-specific animation)
    ├─ Bubble (AnimatePresence, clip-path polygon)
    └─ Typewriter text (useEffect interval)
```

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `types/mia.ts` | Create | `MIAEmotion`, `MIADialoguePool`, `MIAAgentState`, `MIAEvent` types |
| `hooks/useMIA.ts` | Create | HUD subscription, event→emotion mapping, cooldown logic, dialogue selection |
| `components/shared/MIAgent.tsx` | Create | Floating avatar, speech bubble, typewriter, AnimatePresence |
| `data/miaDialogues.json` | Create | `{ general: { IDLE: string[], EXCITED: string[], ... }, "0": { ... } }` |
| `app/layout.tsx` | Modify | Add `<MIAgent />` after `<HUD />` inside `<HUDProvider>` |
| `hooks/index.ts` | Modify | Add `export { useMIA } from './useMIA'` |

### Type Definitions (`types/mia.ts`)

```ts
export type MIAEmotion = 'IDLE' | 'EXCITED' | 'SAMPLED_ERROR' | 'MISSION_BRIEF' | 'PROVIDING_CLUE'

export interface MIADialoguePool {
  general: Record<MIAEmotion, string[]>
  [moduleId: number]: Partial<Record<MIAEmotion, string[]>>
}

export interface MIAAgentState {
  emotion: MIAEmotion
  dialogue: string
  isTyping: boolean
  lastTransition: number  // Date.now()
}

export type MIAEvent =
  | { type: 'SHIELD_DAMAGE'; amount: number }
  | { type: 'XP_GAIN'; amount: number }
  | { type: 'CHALLENGE_COMPLETE'; id: string }
  | { type: 'MANUAL_TRIGGER' }
```

## CSS/Animation Specifications

### Comic-Neon Bubble (clip-path polygon)

```css
clip-path: polygon(
  0 0,                          /* top-left */
  calc(100% - 12px) 0,          /* top-right before notch */
  100% 12px,                    /* notch point */
  100% 100%,                    /* bottom-right */
  20px 100%,                    /* bottom-left before spike */
  0 calc(100% - 8px)           /* spike */
);
```

### Neon Glow Effects

Per-emotion box-shadow (extends existing `tailwind.config.ts` shadow tokens):
- **IDLE**: `shadow-neon-cyan` (existing)
- **EXCITED**: `shadow-neon-emerald` (existing) + `0 0 20px rgba(0,230,118,0.6)`
- **SAMPLED_ERROR**: `shadow-neon-rose` (existing)
- **MISSION_BRIEF**: `shadow-neon-amber` (existing)
- **PROVIDING_CLUE**: `shadow-neon-magenta` (existing)

### Color Palette per State

| State | Border | Text | Avatar Glow |
|-------|--------|------|-------------|
| IDLE | `neon-cyan/30` | `slate-300` | `rgba(0,229,255,0.3)` |
| EXCITED | `neon-emerald/40` | `neon-emerald` | `rgba(0,230,118,0.5)` |
| SAMPLED_ERROR | `neon-rose/30` | `neon-rose` | `rgba(255,64,129,0.3)` |
| MISSION_BRIEF | `neon-amber/40` | `neon-amber` | `rgba(255,179,0,0.4)` |
| PROVIDING_CLUE | `neon-magenta/30` | `neon-magenta` | `rgba(255,45,123,0.3)` |

### Responsive Positioning

```
Desktop: fixed bottom-6 right-6, z-50
Mobile:  fixed bottom-4 right-4, z-50 (smaller avatar: 48px vs 64px)
```

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Pure additive — `<MIAgent />` is added to `layout.tsx` inside existing `<HUDProvider>`. No existing components modified beyond export barrel. Feature can be toggled by removing `<MIAgent />` from layout.

## Open Questions

- [ ] Should MIA respond to `setCurrentModule` with a MISSION_BRIEF dialogue, or only on explicit challenge start?
- [ ] Dialogue pool size per emotion per module: minimum 3 lines for acceptable randomness?
- [ ] Should `triggerMIA()` be exposed to other components (e.g., debrief dialogues) or kept internal?
