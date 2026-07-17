# Audio Synth Hook Specification

## Purpose

Reactive audio hook wrapping the existing `lib/soundEffects.ts` Web Audio API oscillators. Provides game-specific sound effects (hover, success, failure, warning) with mute state persisted to localStorage.

## Requirements

### Requirement: Hook Interface

The `useAudioSynth` hook SHALL return an object with 7 sound functions, `isMuted` boolean, and `toggleMute` function.

#### Scenario: Hook initializes correctly

- GIVEN a component mounts with `useAudioSynth()`
- WHEN the hook initializes
- THEN it returns playHover, playSuccess, playFailure, playWarning, playClick, playLevelUp, playAlarm functions
- AND it returns isMuted boolean and toggleMute function

---

### Requirement: Hover Micro-Bip

The hook SHALL provide `playHover()` that plays a short frequency sweep from 800Hz to 1200Hz over 50ms using a sine oscillator.

#### Scenario: Hover sound plays

- GIVEN the user hovers over an interactive element
- WHEN playHover() is called
- THEN a 50ms sine sweep from 800Hz to 1200Hz plays at low volume (0.15)

#### Scenario: Hover sound when muted

- GIVEN audio is muted
- WHEN playHover() is called
- THEN no sound is produced

---

### Requirement: Success Arpeggio

The hook SHALL provide `playSuccess()` that plays a harmonic ascending arpeggio (C4→E4→G4→C5) at 100ms per note using sine oscillators.

#### Scenario: Success sound plays

- GIVEN a minigame is completed successfully
- WHEN playSuccess() is called
- THEN a 4-note ascending arpeggio plays at 0.3 gain

---

### Requirement: Failure Siren

The hook SHALL provide `playFailure()` that plays a descending sweep from 800Hz to 200Hz over 300ms using a sawtooth oscillator with lowpass filter.

#### Scenario: Failure sound plays

- GIVEN a minigame attempt fails
- WHEN playFailure() is called
- THEN a descending siren plays at 0.25 gain

---

### Requirement: Warning Pulse

The hook SHALL provide `playWarning()` that plays a 440Hz square wave on/off at 120BPM (250ms on, 250ms off) while shield HP is below 30%.

#### Scenario: Warning sound at low shield

- GIVEN shieldHP is 20
- WHEN playWarning() is called
- THEN a pulsing 440Hz tone plays at 120BPM

#### Scenario: Warning sound stops on mute

- GIVEN audio is muted during warning playback
- WHEN toggleMute() is called
- THEN the warning pulse stops immediately

---

### Requirement: Delegation to Existing Sounds

The hook SHALL delegate playClick, playLevelUp, and playAlarm to the existing `lib/soundEffects.ts` functions. No reimplementation.

#### Scenario: Click delegates

- GIVEN playClick() is called
- WHEN the hook processes the call
- THEN the existing `playClick()` from soundEffects.ts executes

#### Scenario: LevelUp delegates

- GIVEN playLevelUp() is called
- WHEN the hook processes the call
- THEN the existing `playLevelUp()` from soundEffects.ts executes

---

### Requirement: Mute State Persistence

The hook SHALL persist mute state to localStorage under key `cg_2026_audio_muted`. On mount, it reads this key to initialize `isMuted`.

#### Scenario: Mute toggled and page refreshed

- GIVEN user toggles mute on
- WHEN the page refreshes
- THEN isMuted is true on hook initialization

#### Scenario: First visit

- GIVEN no localStorage key exists
- WHEN the app loads for the first time
- THEN isMuted defaults to false (unmuted)

---

### Requirement: AudioContext Browser Policy

The hook SHALL defer AudioContext creation until the first user interaction (click/tap) to comply with browser autoplay policies. If no interaction has occurred, sound functions become no-ops.

#### Scenario: Sound before user interaction

- GIVEN no user click/tap has occurred
- WHEN playClick() is called
- THEN no sound plays (no-op)

#### Scenario: Sound after user interaction

- GIVEN a user has clicked somewhere on the page
- WHEN playClick() is called
- THEN the sound plays normally

---

### Requirement: SSR Safety

The hook SHALL be safe for server-side rendering. All Web Audio API calls MUST be guarded with `typeof window !== 'undefined'` checks.

#### Scenario: Hook called during SSR

- GIVEN the component is rendering on the server
- WHEN useAudioSynth() initializes
- THEN no Web Audio API calls are made
- AND isMuted defaults to false
