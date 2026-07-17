# Game State Types Specification

## Purpose

Shared TypeScript type definitions for the Console Edition game loop. Defines game phases, HUD state, module game state, and minigame configuration. All types are in English; no runtime code — pure type declarations.

## Requirements

### Requirement: GamePhase Type

The system SHALL export a `GamePhase` string literal type with values: `'MENU' | 'BRIEFING' | 'MINIGAMES' | 'FEEDBACK' | 'RESULTS' | 'GRADUATION'`.

#### Scenario: Valid phase values

- GIVEN a module game loop
- WHEN phase transitions occur
- THEN the phase value is one of the 6 defined GamePhase literals

#### Scenario: Invalid phase value

- GIVEN a TypeScript compiler check
- WHEN an invalid phase string is assigned
- THEN a compile-time error is raised

---

### Requirement: HUDState Interface

The system SHALL export a `HUDState` interface with fields: `shieldHP: number`, `autonomyLevel: number`, `cpuUsage: number`, `networkActivity: number`, `isShieldDamaged: boolean`.

#### Scenario: HUDState construction

- GIVEN a new module game starts
- WHEN HUDState is initialized
- THEN shieldHP defaults to 100, cpuUsage to 0, networkActivity to 0, isShieldDamaged to false

#### Scenario: HUDState immutability

- GIVEN a HUDState object
- WHEN passed to HUD component
- THEN the component reads values without mutation

---

### Requirement: ModuleGameState Interface

The system SHALL export a `ModuleGameState` interface with fields: `phase: GamePhase`, `currentMinigame: number`, `totalMinigames: number`, `score: number`, `maxScore: number`, `hud: HUDState`, `startTime: number`, `endTime?: number`.

#### Scenario: Game state at start

- GIVEN a module is launched
- WHEN ModuleGameState is created
- THEN phase is 'MENU', currentMinigame is 0, score is 0, endTime is undefined

#### Scenario: Game state after completion

- GIVEN all minigames are completed
- WHEN ModuleGameState updates
- THEN phase is 'RESULTS', endTime is set to current timestamp

---

### Requirement: MinigameConfig Interface

The system SHALL export a `MinigameConfig` interface with fields: `id: string`, `name: string`, `description: string`, `briefingText: string`, `feedbackText: string`, `maxScore: number`, `timeLimit?: number`, `difficulty: 'beginner' | 'intermediate' | 'advanced'`.

#### Scenario: Minigame with time limit

- GIVEN a minigame has a 60-second time limit
- WHEN MinigameConfig is defined
- THEN timeLimit is 60

#### Scenario: Minigame without time limit

- GIVEN a minigame has no time limit
- WHEN MinigameConfig is defined
- THEN timeLimit is undefined

---

### Requirement: Difficulty Enum Values

The system SHALL restrict difficulty to three values: `'beginner'`, `'intermediate'`, `'advanced'`. No other values are permitted.

#### Scenario: Valid difficulty

- GIVEN a minigame config
- WHEN difficulty is set to 'beginner'
- THEN TypeScript accepts the value

#### Scenario: Invalid difficulty

- GIVEN a TypeScript compiler check
- WHEN difficulty is set to 'expert'
- THEN a compile-time error is raised

---

### Requirement: No `any` Types

The system SHALL NOT use the `any` type anywhere in `lib/gameTypes.ts`. All types MUST be explicit.

#### Scenario: Code review check

- GIVEN a grep for `any` in gameTypes.ts
- WHEN the file is scanned
- THEN zero matches are found

---

### Requirement: Module Compatibility

The system SHALL ensure `ModuleGameState` is compatible with all 4 module pages (modulo1–modulo4). Each module MAY extend ModuleGameState with module-specific fields via interface extension.

#### Scenario: Module 1 extends game state

- GIVEN Module 1 needs a `cookieCount` field
- WHEN ModuleGameState is extended
- THEN the extension adds `cookieCount: number` without breaking base interface

---

### Requirement: Export Convention

The system SHALL use named exports for all types in `lib/gameTypes.ts`. No default exports.

#### Scenario: Import pattern

- GIVEN a component needs HUDState
- WHEN importing from '@/lib/gameTypes'
- THEN the import is `import { HUDState } from '@/lib/gameTypes'`
