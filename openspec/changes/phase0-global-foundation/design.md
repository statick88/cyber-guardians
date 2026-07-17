# Design: Phase 0 — Global Foundation

## Technical Approach

Establish a persistent HUD layer and centralized audio synthesis hook that every module page inherits through React Context. The HUD reads shield HP, autonomy level, and XP from localStorage (existing `cg_2026_*` keys) and exposes `damageShield()` / `addXP()` mutators that minigames call directly. Audio context is a module-level singleton that defers creation until the first user gesture, with mute state persisted via the existing `cg_2026_audio_muted` key. All new types live in a single `lib/gameTypes.ts` to avoid circular imports.

## Architecture Decisions

| # | Decision | Option A | Option B | Choice | Rationale |
|---|----------|----------|----------|--------|-----------|
| 1 | HUD state sharing | React Context in layout | Custom event bus | **Context** | Simplest, fully typed, no external deps. Modules call `useHUD()` to mutate. |
| 2 | AudioContext lifecycle | Create on first click | Create muted, unmute on gesture | **First click** | Avoids suspended-context edge cases; `ensureContext()` in existing `soundEffects.ts` already handles this pattern. |
| 3 | Shield damage comms | Context `damageShield()` | Props drilling | **Context** | Minigames are deep in the tree; props drilling would require 3+ intermediate components. |
| 4 | Mobile HUD | Show all metrics | Collapse to shield + autonomy only | **Collapse** | 375px screens can't fit CPU/Network bars without overflow. |
| 5 | Animation layer | framer-motion for everything | CSS for glow, framer for state | **Hybrid** | CSS `@keyframes` for perpetual neon glow is cheaper than JS-driven animation. framer-motion handles enter/exit transitions. |
| 6 | Reduced motion | Ignore `prefers-reduced-motion` | Respect it | **Respect** | Accessibility requirement; disable all animations when media query matches. |

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│  app/layout.tsx                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  <HUDProvider>                                │  │
│  │    ┌─────────┐    ┌──────────────────────┐    │  │
│  │    │  HUD    │    │  {children} (pages)   │    │  │
│  │    │  bar    │    │                        │    │  │
│  │    └────┬────┘    │  useHUD() ──→ mutate   │    │  │
│  │         │         └──────────────────────────┘  │  │
│  │         ▼                                       │  │
│  │    reads localStorage ◄── modules write via     │  │
│  │    cg_2026_module*          damageShield/addXP  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

         ┌──────────────────┐
         │  useAudioSynth() │  ← module-level singleton
         │  AudioContext     │
         │  masterGain       │
         └────────┬─────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
 playClick   playSuccess   playFailure   (etc.)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `lib/gameTypes.ts` | **Create** | Pure type definitions: `HUDState`, `HUDContextValue`, `ShieldLevel`, `AutonomyLevel`, `AudioSynthConfig` |
| `hooks/useAudioSynth.ts` | **Create** | Thin hook wrapping `soundEffects.ts` with React state for mute toggling and initialization |
| `components/HUD.tsx` | **Create** | Persistent top bar: shield HP bar, autonomy level badge, XP counter, module indicator |
| `components/HUDProvider.tsx` | **Create** | React Context provider that reads/writes localStorage, exposes mutators |
| `app/layout.tsx` | **Modify** | Wrap `{children}` with `<HUDProvider>`; move `<VolumeControl>` into HUD bar |
| `app/globals.css` | **Modify** | Append grid pattern, HUD-specific neon utilities, reduced-motion overrides |

## Interfaces / Contracts

```typescript
// lib/gameTypes.ts

export type ShieldLevel = 'full' | 'high' | 'medium' | 'low' | 'critical'
export type AutonomyLevel = 'novice' | 'defender' | 'guardian' | 'elite'

export interface HUDState {
  shieldHP: number          // 0-100
  maxShieldHP: number       // always 100
  autonomyLevel: AutonomyLevel
  xp: number
  currentModule: number | null  // 0-4 or null (home)
}

export interface HUDContextValue extends HUDState {
  damageShield: (amount: number) => void
  healShield: (amount: number) => void
  addXP: (amount: number) => void
  setCurrentModule: (id: number | null) => void
  resetHUD: () => void
}

export interface AudioSynthConfig {
  muted: boolean
  onToggle: (muted: boolean) => void
}
```

```typescript
// hooks/useAudioSynth.ts — interface only
export function useAudioSynth(): AudioSynthConfig
// Returns { muted, onToggle } — wraps existing soundEffects.ts functions
```

## Component Design: HUD

```
HUD (fixed, top, z-40)
├── Shield HP bar (framer-motion width animation)
├── Autonomy level badge (neon-colored per level)
├── XP counter (animate number on change)
└── [hidden on mobile < 640px]:
    ├── CPU visualization (decorative pulse)
    └── Network activity (decorative dots)
```

**Responsive behavior:**
- `≥ 640px`: Full bar with all 4 metrics
- `< 640px`: Shield HP + Autonomy only, collapsed height (48px → 36px)

**Props:** None — fully self-contained via Context.

## Audio System Design

The existing `lib/soundEffects.ts` already implements the singleton pattern with `getAudioContext()`. The new `hooks/useAudioSynth.ts` adds:

1. **React state bridge**: `useState` for `muted` boolean, synced with localStorage
2. **Initialization**: Calls `initAudio()` in a `useEffect` on mount
3. **Toggle handler**: Calls `setAudioMuted()` + updates local state
4. **No new AudioContext creation** — reuses existing singleton

```typescript
// hooks/useAudioSynth.ts (sketch)
'use client'
import { useState, useEffect, useCallback } from 'react'
import { isAudioMuted, setAudioMuted, initAudio } from '@/lib/soundEffects'

export function useAudioSynth() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    initAudio()
    setMuted(isAudioMuted())
  }, [])

  const onToggle = useCallback((next: boolean) => {
    setMuted(next)
    setAudioMuted(next)
  }, [])

  return { muted, onToggle }
}
```

## Integration Points

### layout.tsx changes
```diff
+ import HUDProvider from '@/components/HUDProvider'
+ import HUD from '@/components/HUD'

  export default function RootLayout({ children }) {
    return (
      <html lang="es" className="dark">
        <body>
+         <HUDProvider>
+           <HUD />
            {children}
+         </HUDProvider>
-         <VolumeControl />
        </body>
      </html>
    )
  }
```

### globals.css additions
```css
/* Grid pattern background */
.cyber-grid {
  background-image:
    linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* HUD-specific neon pulse */
@keyframes shield-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Reduced motion overrides */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `useAudioSynth` hook returns correct mute state | Render hook with `@testing-library/react-hooks`, verify initial state |
| Unit | HUD renders shield HP bar with correct width | Render `<HUD>` inside `<HUDProvider>`, check element attributes |
| Unit | `damageShield()` clamps to 0 | Call `damageShield(150)` on HP=100, verify HP=0 |
| Integration | Module page can call `useHUD().damageShield()` | Render a test page inside provider, trigger damage, verify HUD updates |
| E2E | Shield HP decreases on wrong answer | Play module0 scenario, verify HUD reflects damage |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No data migration required. HUD reads existing `cg_2026_module*` keys. New keys (`cg_2026_hud_state`) are additive. Phase 0 is the foundation — no breaking changes to existing modules.

## Open Questions

- [ ] Should the HUD persist `currentModule` across page reloads, or derive it from the URL path? (Recommend: derive from URL to avoid stale state.)
- [ ] Should `resetHUD()` clear all module progress, or only HUD-specific state? (Recommend: HUD-only; module data stays in its own keys.)
