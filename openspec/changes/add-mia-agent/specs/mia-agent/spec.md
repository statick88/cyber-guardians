# MIA Agent Specification

## Purpose

MIA (Modelo de Inteligencia Artificial) is a socioemotional AI agent that provides real-time animated presence and contextual dialogue in response to gameplay events. It fills the gap between gamification (HUD, XP, shields) and emotional support — celebrating wins, softening failures, and nudging when stuck.

## Requirements

### Requirement: Emotional State Machine

The system MUST maintain exactly 5 emotional states: `IDLE`, `EXCITED`, `SAMPLED_ERROR`, `MISSION_BRIEF`, `PROVIDING_CLUE`.

The system MUST transition between states based on HUD events with a minimum 3-second cooldown between transitions to prevent flickering.

The system MUST default to `IDLE` on mount and after cooldown expiry.

#### Scenario: Shield damage triggers error state

- GIVEN MIA is in any state
- WHEN `damageShield` fires from HUDContext
- THEN MIA transitions to `SAMPLED_ERROR`
- AND the cooldown timer resets to 3 seconds

#### Scenario: XP gain triggers excited state

- GIVEN MIA is in any state
- WHEN `addXP` fires from HUDContext with amount > 0
- THEN MIA transitions to `EXCITED`
- AND the cooldown timer resets to 3 seconds

#### Scenario: Challenge completion triggers excited state

- GIVEN MIA is in any state
- WHEN `completeChallenge` fires from HUDContext
- THEN MIA transitions to `EXCITED`
- AND the cooldown timer resets to 3 seconds

#### Scenario: Cooldown prevents rapid re-triggering

- GIVEN MIA just transitioned to `EXCITED` 1 second ago
- WHEN `damageShield` fires
- THEN MIA remains in `EXCITED`
- AND the cooldown timer is NOT reset

#### Scenario: Idle timeout returns to IDLE

- GIVEN MIA is in any non-IDLE state
- WHEN 10 seconds pass with no触发 events
- THEN MIA transitions to `IDLE`

### Requirement: Event Subscription via HUDContext

The system MUST subscribe to HUDContext using `useHUD()` hook from `components/HUDProvider.tsx`.

The system MUST listen to `damageShield`, `addXP`, `completeChallenge`, and `setCurrentModule` changes.

The system MUST clean up all subscriptions on unmount with zero memory leaks.

#### Scenario: Hook subscribes to HUD events

- GIVEN `useMIA()` is called within a component mounted inside `HUDProvider`
- WHEN HUD state changes (shield damage, XP gain, challenge completion)
- THEN the hook receives the updated values
- AND no stale closures persist after unmount

#### Scenario: Hook returns stable references

- GIVEN `useMIA()` is called multiple times in the same render
- WHEN the hook returns `emotion`, `dialogue`, `triggerMIA`
- THEN all returned references are referentially stable (useCallback/useMemo)

### Requirement: triggerMIA for Explicit Requests

The system MUST expose a `triggerMIA(emotion: MIAEmotion)` function that allows programmatic state changes (e.g., from hint buttons).

The system MUST respect the cooldown timer even for explicit triggers.

#### Scenario: Explicit trigger respects cooldown

- GIVEN MIA just transitioned 1 second ago
- WHEN `triggerMIA('MISSION_BRIEF')` is called
- THEN the trigger is ignored
- AND MIA remains in current state

#### Scenario: Explicit trigger works after cooldown

- GIVEN MIA last transitioned 5 seconds ago
- WHEN `triggerMIA('PROVIDING_CLUE')` is called
- THEN MIA transitions to `PROVIDING_CLUE`
- AND the cooldown timer resets

### Requirement: Dialogue Selection

The system MUST select a random dialogue from the dialogue bank matching `(currentModule, emotion)`.

The system MUST fall back to `moduleId: 0` (general) if no module-specific dialogue exists.

The system MUST fall back to `emotion: IDLE` if no dialogue exists for the requested emotion.

#### Scenario: Module-specific dialogue selected

- GIVEN `currentModule` is 2 and emotion is `EXCITED`
- WHEN dialogue is selected
- THEN a random entry from `miaDialogues[2].EXCited` is returned

#### Scenario: Fallback to general dialogue

- GIVEN `currentModule` is 3 and emotion is `PROVIDING_CLUE`
- AND `miaDialogues[3]` has no `PROVIDING_CLUE` entries
- WHEN dialogue is selected
- THEN a random entry from `miaDialogues[0].PROVIDING_CLUE` is returned

#### Scenario: Final fallback to IDLE

- GIVEN `currentModule` is null and emotion is `SAMPLED_ERROR`
- AND `miaDialogues[0]` has no `SAMPLED_ERROR` entries
- WHEN dialogue is selected
- THEN a random entry from `miaDialogues[0].IDLE` is returned

### Requirement: Avatar Rendering

The system MUST render a CSS-only animated avatar (no external images) in the bottom-right corner of the viewport.

The system MUST use Framer Motion for spring-based transitions between emotional states.

The system MUST respect `prefers-reduced-motion` by disabling animations and using instant state changes.

#### Scenario: Avatar renders on mount

- GIVEN the app is loaded
- WHEN `MIAgent` mounts in `layout.tsx`
- THEN a floating avatar element appears in bottom-right
- AND the avatar has a neon cyan border glow

#### Scenario: Emotion changes animate avatar

- GIVEN MIA is in `IDLE` state
- WHEN emotion transitions to `EXCITED`
- THEN the avatar pulses with elastic scaling
- AND the border color shifts to neon emerald
- AND the transition completes in under 500ms

#### Scenario: Reduced motion disables animations

- GIVEN the OS has `prefers-reduced-motion: reduce` enabled
- WHEN emotion transitions
- THEN state changes are instant (no spring animations)
- AND the typewriter effect is replaced by full text display

### Requirement: Bubble and Typewriter

The system MUST display a comic-neon speech bubble above the avatar when dialogue is present.

The system MUST render dialogue text using a typewriter effect at 30ms per character.

The system MUST allow click-to-reveal (clicking the bubble shows full text instantly).

The system MUST hide the bubble after 8 seconds or on next emotion change.

#### Scenario: Bubble appears on emotion change

- GIVEN MIA transitions to `EXCITED`
- WHEN the new emotion has dialogue
- THEN a speech bubble appears above the avatar
- AND text begins typewriting at 30ms/char

#### Scenario: Click reveals full text

- GIVEN the bubble is typewriting
- WHEN the user clicks the bubble
- THEN the full text is displayed instantly
- AND the typewriter interval is cleared

#### Scenario: Bubble auto-hides after timeout

- GIVEN the bubble is visible
- WHEN 8 seconds pass
- THEN the bubble fades out
- AND the dialogue state is cleared

### Requirement: Non-Functional Constraints

The system MUST use zero `any` types — all types explicitly defined in `types/mia.ts`.

The system MUST complete emotion transitions within 500ms of triggering event.

The system MUST NOT introduce memory leaks — all `useEffect` cleanups must clear intervals, timeouts, and subscriptions.

The system MUST be client-only (`'use client'` directive).

#### Scenario: TypeScript strict compliance

- GIVEN the project has `strict: true` in tsconfig
- WHEN `types/mia.ts`, `hooks/useMIA.ts`, `components/shared/MIAgent.tsx` are compiled
- THEN zero TypeScript errors
- AND zero `any` types in the output

#### Scenario: Memory cleanup on unmount

- GIVEN `MIAgent` is mounted
- WHEN the component unmounts (route change)
- THEN all intervals, timeouts, and subscriptions are cleared
- AND no console errors appear

## Integration Points

| Component | Integration | Direction |
|-----------|------------|-----------|
| `HUDProvider` | `useHUD()` hook | Reads: shieldHP, xp, completedChallenges, currentModule |
| `app/layout.tsx` | `<MIAgent />` mount | MIA renders inside HUDProvider tree |
| `hooks/index.ts` | Barrel export | `useMIA` exported alongside existing hooks |
| `types/mia.ts` | Type definitions | Imported by hook, component, and dialogue system |

## Animation Specifications

| Emotion | Avatar Scale | Border Color | Bubble Style |
|---------|-------------|--------------|--------------|
| IDLE | 1.0 (rest) | neon-cyan | Subtle pulse, low opacity |
| EXCITED | 1.0 → 1.15 elastic | neon-emerald | Bounce-in, high energy |
| SAMPLED_ERROR | 1.0 → 0.95 shake | neon-rose | Alert style, red tint |
| MISSION_BRIEF | 1.0 (stable) | neon-amber | Focus style, amber glow |
| PROVIDING_CLUE | 1.0 → 1.05 gentle | neon-magenta | Mystery style, magenta tint |
