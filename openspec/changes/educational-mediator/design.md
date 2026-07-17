# Design: Educational Mediator Integration

## Technical Approach

Transform the punitive error model to a constructive learning mediation system by introducing a shared `EducationalMediator` component with a finite state machine, a custom hook for state management, and integration points in each module's game loop. The mediator pauses gameplay on error, presents Socratic questions via `MediatorPanel`, and resumes on dismissal. A separate `DebriefPanel` inserts metacognitive reflection before `ResultsScreen`.

All new components live in `components/shared/`. State is managed via `useReducer` (not `useState`) for complex state machine transitions. Feature-gated behind `NEXT_PUBLIC_EDUCATIONAL_MEDIATOR`.

## Architecture Decisions

| Decision | Option A | Option B | Decision |
|----------|----------|----------|----------|
| State machine | `useReducer` with discriminated union | XState | **useReducer** — no new dependency; machine is small (5 states) |
| Pause mechanism | Callback props (`onPause`/`onResume`) | React Context | **Context** — shared across HUD, module components, and mediator |
| Animation library | CSS transitions | framer-motion | **framer-motion** — already installed, used everywhere |
| Panel positioning | Fixed overlay | Sidebar slot | **Fixed overlay** — doesn't disrupt existing layouts |
| Data enrichment | Modify JSON files directly | Separate `pedagogical/` data layer | **Modify JSON** — keeps data colocated; optional fields preserve backward compat |
| Feature flag | Runtime config object | `process.env` | **process.env** — dead-code eliminated at build; zero bundle cost when off |

## State Machine

```
MediatorState = 'idle' | 'onIntro' | 'onTipRequested' | 'onErrorConstructive' | 'onMetaReflection'

         ┌──────────────────────────────────────────────────┐
         │                                                  │
         ▼                                                  │
      [idle] ──── module start ────► [onIntro]              │
         │                            │                     │
         │          user dismiss       │                     │
         │◄────────────────────────────┘                     │
         │                                                  │
         ▼                                                  │
    [onTipRequested] ◄── player requests hint               │
         │                            │                     │
         │     user dismiss / answer   │                     │
         │◄────────────────────────────┘                     │
         │                                                  │
         ▼                                                  │
  [onErrorConstructive] ◄── shield damage                   │
         │                            │                     │
         │  user answers / dismisses   │                     │
         │►── scaffold hint ──► resume ┘                    │
         │                                                  │
         ▼                                                  │
 [onMetaReflection] ◄── module completion                   │
         │                            │                     │
         │    debrief completed        │                     │
         │►── save to localStorage ──► [idle] ──────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `types/educational.ts` | Create | Core mediator types: `MediatorState`, `CognitiveConflict`, `ScaffoldingTip`, `DebriefPrompt`, `EducationalLayer` |
| `components/shared/EducationalMediator.tsx` | Create | Root mediator component — orchestrates panel visibility via `AnimatePresence` |
| `components/shared/MediatorPanel.tsx` | Create | Panel UI — Socratic questions, scaffolding hints, cognitive conflict display |
| `components/shared/DebriefPanel.tsx` | Create | Metacognitive debrief — sliders, micro-decisions, "Operator Logbook" |
| `hooks/useEducationalMediator.ts` | Create | `useReducer` state machine + localStorage persistence |
| `hooks/useGamePause.ts` | Create | Pause/resume context for game loops |
| `components/GamePauseProvider.tsx` | Create | Context provider wrapping all module games |
| `data/module1Data.json` | Modify | Add `educationalLayer` to 3 scenarios (sample) |
| `data/module2Data.json` | Modify | Add `educationalLayer` to 3 scenarios (sample) |
| `data/module3Data.json` | Modify | Add `educationalLayer` to 3 scenarios (sample) |
| `data/module4Data.json` | Modify | Add `educationalLayer` to 3 scenarios (sample) |
| `components/HUD.tsx` | Modify | Wrap `damageShield` with mediator pause trigger |
| `components/module1/CookieSweeper.tsx` | Modify | Call `triggerMediator('onErrorConstructive')` on cookie leak |
| `components/module2/PhoneticDecoder.tsx` | Modify | Call `triggerMediator('onErrorConstructive')` on wrong decision |
| `components/ResultsScreen.tsx` | Modify | Insert `DebriefPanel` before final results |

## Interfaces / Contracts

```typescript
// types/educational.ts

export type MediatorState =
  | 'idle'
  | 'onIntro'
  | 'onTipRequested'
  | 'onErrorConstructive'
  | 'onMetaReflection'

export type MediatorTrigger =
  | 'onError'
  | 'onTipRequest'
  | 'onIntro'
  | 'onModuleComplete'

export interface CognitiveConflict {
  question: string       // Socratic question — never the answer
  followUp: string       // Deeper prompt if player is stuck
  expectedInsight: string // Internal — not shown to player
}

export interface ScaffoldingTip {
  level: 'explicit' | 'guided' | 'implicit' | 'withdrawn'
  hint: string
  visualGuide?: string   // Optional holographic visual aid description
}

export interface DebriefPrompt {
  id: string
  question: string
  type: 'slider' | 'micro-decision' | 'open-reflection'
  options?: string[]
  minValue?: number      // For slider type
  maxValue?: number      // For slider type
}

export interface EducationalLayer {
  conflictQuestion: CognitiveConflict
  scaffoldingTip: ScaffoldingTip
  metacognitiveDebrief: DebriefPrompt[]
  mediatorHook: 'onError' | 'onProgress' | 'onCompletion'
}

export interface MediatorAction {
  type: 'TRIGGER' | 'DISMISS' | 'COMPLETE_DEBRIEF' | 'ANSWER'
  payload?: {
    trigger?: MediatorTrigger
    layer?: EducationalLayer
    answer?: string | number
  }
}

export interface MediatorContextValue {
  state: MediatorState
  currentLayer: EducationalLayer | null
  triggerMediator: (trigger: MediatorTrigger, layer?: EducationalLayer) => void
  dismissMediator: () => void
  answerMediator: (answer: string | number) => void
  completeDebrief: () => void
  isPaused: boolean
}

// GamePause context
export interface GamePauseContextValue {
  isPaused: boolean
  pauseGame: () => void
  resumeGame: () => void
  registerGame: (id: string, pause: () => void, resume: () => void) => void
  unregisterGame: (id: string) => void
}
```

## Data Flow

```
Module Game Loop                     Shared Layer
─────────────                       ────────────
CookieSweeper                       EducationalMediator
  │                                     │
  ├─ onShieldDamage(amount)             │
  │   └─► damageShield(amount)          │
  │       └─► HUD updates               │
  │                                     │
  ├─ triggerMediator('onError', layer)─►│
  │                                     ├─► useEducationalMediator (reducer)
  │   ┌─ game loop STOPS ◄──────────────│      │
  │   │                                 │      ├─► MediatorPanel renders
  │   │  player interacts ◄─────────────│      │
  │   │                                 │      │
  │   └─► dismissMediator() ────────────│      │
  │                                     │      ├─► state → 'idle'
  │   game loop RESUMES ◄───────────────│      │
  │                                     │
  ├─ game complete                      │
  │   └─► triggerMediator('onModuleComplete', layer)
  │                                     ├─► DebriefPanel renders
  │                                     │      │
  │                                     │      ├─► user completes debrief
  │                                     │      │
  │   └─► onContinue() ────────────────►│      └─► localStorage save
  │                                     │
  └─► ResultsScreen                     │
        └─ DebriefPanel already done    │
```

## Hooks Design

### `useEducationalMediator`

```typescript
// hooks/useEducationalMediator.ts
export function useEducationalMediator(): MediatorContextValue {
  // useReducer with MediatorAction discriminated union
  // localStorage key: 'cg_mediator_debrief_{moduleId}'
  // Persists: debrief answers, scaffolding level reached
  // Returns: state, currentLayer, triggerMediator, dismissMediator, etc.
}
```

### `useGamePause`

```typescript
// hooks/useGamePause.ts
// Provides: isPaused, pauseGame, resumeGame
// Game components call pauseGame() before triggering mediator
// Mediator calls resumeGame() on dismiss
// Each game registers via registerGame(id, pauseFn, resumeFn)
// Multiple games supported (only one active at a time)
```

## Animation Design

All panels use framer-motion `AnimatePresence` for enter/exit:

| Panel | Entry | Exit | Duration |
|-------|-------|------|----------|
| `MediatorPanel` | Slide from right + fade | Slide right + fade | 300ms ease-out |
| `DebriefPanel` | Scale from 0.95 + fade | Scale to 0.95 + fade | 250ms ease-out |
| Cognitive conflict question | Typewriter reveal (char by char) | — | 50ms per char |
| Scaffolding hint | Fade + subtle glow pulse | Fade | 200ms |

## Styling System

**Holographic Network Assistant theme:**
- Primary: `#00fff2` (cyan) for active state, borders, glows
- Secondary: `#ff00ff` (magenta) for highlights, error states
- Background: `rgba(10, 10, 26, 0.95)` — matches existing HUD
- Glow effects: `box-shadow: 0 0 15px rgba(0, 255, 242, 0.3)`
- Border: `border border-cyan-500/30`
- Text: `text-cyan-300` primary, `text-slate-400` secondary
- Font: monospace for "console" feel, matching existing HUD

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

**Phase 0** (types + data): Add `types/educational.ts` with optional `educationalLayer?` field on scenario types. Data files get new optional fields. Existing code unaffected — all new fields are `?` optional.

**Phase 1** (components): Create `components/shared/` directory and new components. Feature-gated — no integration yet.

**Phase 2** (integration): Wrap module games with `GamePauseProvider`. Modify `HUD.tsx` to expose pause. Add mediator triggers to minigames.

**Phase 3** (debrief): Insert `DebriefPanel` before `ResultsScreen`. Requires `DebriefPanel` to be complete.

**Rollback**: `NEXT_PUBLIC_EDUCATIONAL_MEDIATOR=false` disables all mediator UI. Components render children directly.

## Open Questions

- [ ] Should the mediator panel be dismissable via ESC key or only via UI buttons?
- [ ] How many scaffolding levels should withdraw per module? (Proposal says dynamic but no formula given)
- [ ] Should debrief data be exportable (e.g., JSON download for instructor review)?
