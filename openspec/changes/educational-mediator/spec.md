# Educational Mediator — Delta Specification

## Change: `educational-mediator`
## Mode: hybrid (Engram + filesystem)

---

## 1. Educational Type System (`types/educational.ts`)

### ADDED: Capability `educational-type-system`

The system SHALL export a new file `types/educational.ts` containing all mediator-related types. All types are in English. Zero `any` types. Static-export safe.

#### Requirement: Mediator State Union

The system SHALL define a `MediatorState` discriminated union for the mediator state machine.

```typescript
export type MediatorState =
  | 'idle'
  | 'onIntro'
  | 'onTipRequested'
  | 'onErrorConstructive'
  | 'onMetaReflection'
```

**State semantics:**
- `idle` — Mediator is dormant. No panel visible.
- `onIntro` — Mediator introduces a scenario with contextual framing before the player acts.
- `onTipRequested` — Player explicitly requests a hint; scaffolding tip is shown.
- `onErrorConstructive` — Player made an error; cognitive conflict question is presented before damage.
- `onMetaReflection` — Debrief mode; player reflects on their strategy.

#### Requirement: CognitiveConflict Interface

The system SHALL define a `CognitiveConflict` interface used when errors occur.

```typescript
export interface CognitiveConflict {
  /** Socratic question posed to the player — never contains the answer */
  question: string
  /** Follow-up prompt if player does not respond within 10s */
  followUp: string
  /** Internal only — the insight the question guides toward (not shown to player) */
  expectedInsight: string
}
```

**Scenario: First error on URLInspector**
- GIVEN player classifies a phishing URL as "segura"
- WHEN the error triggers the mediator
- THEN `CognitiveConflict.question` is displayed (e.g., "¿Qué dominio real está oculto detrás de esa ruta?")
- AND `CognitiveConflict.followUp` appears after 10s if no interaction
- AND `CognitiveConflict.expectedInsight` is NEVER rendered in the UI

#### Requirement: ScaffoldingTip Interface

The system SHALL define a `ScaffoldingTip` interface with four progressive withdrawal levels.

```typescript
export type ScaffoldingLevel = 'explicit' | 'guided' | 'implicit' | 'withdrawn'

export interface ScaffoldingTip {
  /** Current scaffolding level — controls verbosity */
  level: ScaffoldingLevel
  /** The hint text shown to the player */
  hint: string
  /** Optional URL/path to a visual diagram or animation */
  visualGuide?: string
}
```

**Level progression rules:**
| Level | Behavior | When Used |
|-------|----------|-----------|
| `explicit` | Full step-by-step walkthrough | First error in a scenario type |
| `guided` | Points to the area of interest without naming it | Second error in same scenario type |
| `implicit` | General strategy reminder, no specifics | Third+ error in same scenario type |
| `withdrawn` | No scaffolding — player has demonstrated competence | After 2+ correct answers in a row for that scenario type |

**Scenario: Scaffolding withdrawal after progress**
- GIVEN player has made 1 explicit error on email analysis and received `explicit` level scaffolding
- WHEN player answers the next email correctly
- AND THEN makes another error on a different email
- THEN `ScaffoldingTip.level` SHALL be `guided` (not `explicit`)
- AND `ScaffoldingTip.hint` SHALL reference the general approach, not the specific email

#### Requirement: DebriefPrompt Interface

The system SHALL define a `DebriefPrompt` interface with a discriminated union for prompt type.

```typescript
export type DebriefPromptType = 'slider' | 'micro-decision' | 'open-reflection'

export interface DebriefPrompt {
  /** The question shown to the player */
  question: string
  /** Controls which UI component renders */
  type: DebriefPromptType
  /** For 'micro-decision' type: the available options */
  options?: string[]
  /** For 'slider' type: min/max labels */
  sliderLabels?: { min: string; max: string }
  /** Storage key for localStorage persistence */
  storageKey: string
}
```

**Scenario: Slider debrief**
- GIVEN the debrief panel shows a `DebriefPrompt` with `type: 'slider'`
- WHEN the slider component renders
- THEN it displays `sliderLabels.min` on the left and `sliderLabels.max` on the right
- AND the selected value persists to `localStorage` under `storageKey`

#### Requirement: EducationalLayer Interface

The system SHALL define an `EducationalLayer` interface that enriches each scenario.

```typescript
export interface EducationalLayer {
  /** Cognitive conflict question for error moments */
  conflictQuestion: CognitiveConflict
  /** Scaffolding hint with level progression */
  scaffoldingTip: ScaffoldingTip
  /** Array of debrief prompts shown after scenario completion */
  metacognitiveDebrief: DebriefPrompt[]
  /** When this layer's mediator should activate */
  mediatorHook: 'onError' | 'onProgress' | 'onCompletion'
}
```

#### Requirement: MediatorEvent Type

The system SHALL define a `MediatorEvent` type for state transitions.

```typescript
export type MediatorEvent =
  | { type: 'INTRO_REQUESTED'; scenarioId: string }
  | { type: 'TIP_REQUESTED'; scenarioId: string; attemptCount: number }
  | { type: 'ERROR_OCCURRED'; scenarioId: string; correctAnswer: string; playerAnswer: string }
  | { type: 'PLAYER_RESPONDED'; scenarioId: string; response: 'reflected' | 'skipped' | 'retry' }
  | { type: 'DEBRIEF_STARTED'; scenarioId: string }
  | { type: 'DEBRIEF_COMPLETED'; scenarioId: string; responses: Record<string, unknown> }
  | { type: 'TIMEOUT'; scenarioId: string }
  | { type: 'DISMISSED' }
```

#### Requirement: ScaffoldingProgress Interface

The system SHALL define a `ScaffoldingProgress` interface for tracking scaffold withdrawal per scenario type.

```typescript
export interface ScaffoldingProgress {
  /** Scenario type key (e.g., 'url-analysis', 'email-analysis', 'vishing') */
  scenarioType: string
  /** Number of errors made for this scenario type */
  errorCount: number
  /** Number of consecutive correct answers */
  correctStreak: number
  /** Current scaffolding level based on progress */
  currentLevel: ScaffoldingLevel
  /** Total times scaffolding has been shown */
  timesScaffolded: number
}
```

**Scenario: Tracking across session**
- GIVEN `ScaffoldingProgress` for `scenarioType: 'url-analysis'` has `errorCount: 2, correctStreak: 0`
- WHEN player answers a URL question correctly
- THEN `correctStreak` increments to 1
- AND if `correctStreak >= 2`, `currentLevel` transitions to `withdrawn`
- AND `timesScaffolded` is NOT incremented (only increments when scaffolding is shown)

#### Requirement: EmotionalRegulationState Interface

The system SHALL define an `EmotionalRegulationState` interface for the vishing module panic bar.

```typescript
export interface EmotionalRegulationState {
  /** Current panic level 0–100 (0 = calm, 100 = full panic) */
  panicLevel: number
  /** Whether the panic bar is in warning state (>70) */
  isWarning: boolean
  /** Whether the panic bar is in critical state (>90) */
  isCritical: boolean
  /** Number of calming actions player has taken */
  calmingActions: number
  /** Power asymmetry score: negative = attacker dominant, positive = player dominant */
  powerBalance: number
  /** Timestamp of last panic change */
  lastPanicChange: number
}
```

**Scenario: Panic bar escalation**
- GIVEN `EmotionalRegulationState` with `panicLevel: 40`
- WHEN player chooses a non-calming response in vishing
- THEN `panicLevel` increases by 15–25 (based on scenario severity)
- AND if `panicLevel > 70`, `isWarning` becomes `true`
- AND if `panicLevel > 90`, `isCritical` becomes `true` and shield damage triggers

---

## 2. Data Schema Transformation

### ADDED: Capability `pedagogical-data-schema`

The system SHALL enrich existing module data files with pedagogical content layers.

#### Requirement: EducationalLayer Addition to Scenario Types

Every scenario type across all four modules SHALL gain an optional `educationalLayer` field. The field is optional (`?`) to maintain backward compatibility.

**Module 1 — `URLItem` (types/module1.ts):**
```typescript
export interface URLItem {
  // ... existing fields unchanged ...
  explicacion: string           // KEPT as fallback
  educationalLayer?: EducationalLayer  // NEW
}
```

**Module 1 — `Escenario` (types/module1.ts):**
```typescript
export interface Escenario {
  // ... existing fields unchanged ...
  explicacion: string           // KEPT as fallback
  educationalLayer?: EducationalLayer  // NEW
}
```

**Module 2 — `IdentityTheftScenario` (types/module2.ts):**
```typescript
export interface IdentityTheftScenario {
  // ... existing fields unchanged ...
  explicacion: string           // KEPT as fallback
  educationalLayer?: EducationalLayer  // NEW
}
```

**Module 2 — `VishingCall` (types/module2.ts):**
```typescript
export interface VishingCall {
  // ... existing fields unchanged ...
  educationalLayer?: EducationalLayer  // NEW
  emotionalRegulation?: {
    initialPanic: number
    panicIncrementPerWrong: number
    calmingDecrement: number
    criticalThreshold: number
  }
}
```

**Module 3 — `EscenarioChat` (types/module3.ts):**
```typescript
export interface EscenarioChat {
  // ... existing fields unchanged ...
  educationalLayer?: EducationalLayer  // NEW
}
```

**Module 3 — `EscenarioExtorsion` (types/module3.ts):**
```typescript
export interface EscenarioExtorsion {
  // ... existing fields unchanged ...
  explicacion: string           // KEPT as fallback
  educationalLayer?: EducationalLayer  // NEW
}
```

**Module 4 — `CryptoChallenge` (types/module4.ts):**
```typescript
export interface CryptoChallenge {
  // ... existing fields unchanged ...
  explicacion: string           // KEPT as fallback
  educationalLayer?: EducationalLayer  // NEW
}
```

**Module 4 — `HardeningScenario` (types/module4.ts):**
```typescript
export interface HardeningScenario {
  // ... existing fields unchanged ...
  explicacion: string           // KEPT as fallback
  educationalLayer?: EducationalLayer  // NEW
}
```

#### Requirement: Backward Compatibility with `explicacion` Fallback

The system SHALL NOT remove the existing `explicacion` field from any interface. When `educationalLayer` is `undefined` or absent, the mediator component SHALL fall back to displaying `explicacion` as the explanation text.

**Scenario: Old data without educational layer**
- GIVEN a module data file where a scenario has no `educationalLayer` field
- WHEN the mediator attempts to render for that scenario
- THEN the mediator SHALL remain in `idle` state (no panel shown)
- AND the existing `explicacion` flow continues unchanged

#### Requirement: Data File Enrichment Structure

Each module data file SHALL be enriched with pedagogical content following this exact structure per scenario.

**Example: `data/module1Data.json` — URLItem enrichment:**
```json
{
  "id": "url-001",
  "urlCompleta": "https://secure-banking-login.phishing-site.com/auth?ref=secure",
  "componentes": { "...": "..." },
  "elementoSuspeito": "ref=secure in parameters",
  "classificacao": "phishing",
  "explicacion": "El dominio phishing-site.com no es el banco real...",
  "pontos": 100,
  "educationalLayer": {
    "conflictQuestion": {
      "question": "¿Por qué un sitio legítimo necesitaría auto-declararse 'seguro' en sus parámetros de URL?",
      "followUp": "Piensa en los sitios bancarios reales que conoces. ¿Alguna vez has visto 'ref=secure' en sus URLs?",
      "expectedInsight": "Los sitios legítimos no necesitan proclamar su seguridad en la URL; eso es una táctica de phishing."
    },
    "scaffoldingTip": {
      "level": "explicit",
      "hint": "Observa el parámetro 'ref=secure' en la URL. ¿Qué intenta comunicar el atacante?",
      "visualGuide": "/guides/url-parameters-anatomy.svg"
    },
    "metacognitiveDebrief": [
      {
        "question": "¿Qué tan seguro/a te sentías al tomar esta decisión?",
        "type": "slider",
        "sliderLabels": { "min": "Muy inseguro/a", "max": "Muy seguro/a" },
        "storageKey": "url-001-confidence"
      },
      {
        "question": "¿Qué estrategia usaste para analizar esta URL?",
        "type": "micro-decision",
        "options": [
          "Revisé el dominio completo",
          "Busqué parámetros sospechosos",
          "Comparé con URLs que conozco",
          "No sabía por dónde empezar"
        ],
        "storageKey": "url-001-strategy"
      }
    ],
    "mediatorHook": "onError"
  }
}
```

**Requirement: conflictQuestion per scenario**

Every scenario with an `educationalLayer` SHALL have a `conflictQuestion` with:
- `question`: A Socratic question in Spanish that does NOT reveal the answer
- `followUp`: A secondary prompt in Spanish that appears after 10s of inactivity
- `expectedInsight`: Internal-only text (English or Spanish) that describes the learning objective

**Requirement: scaffoldingTip per scenario**

Every scenario with an `educationalLayer` SHALL have a `scaffoldingTip` with:
- `level`: Initial scaffolding level (typically `explicit` for first scenario of a type)
- `hint`: A hint in Spanish that guides without solving
- `visualGuide`: Optional path to an SVG/PNG diagram

**Requirement: metacognitiveDebrief per scenario**

Every scenario with an `educationalLayer` SHALL have a `metacognitiveDebrief` array with 2–4 `DebriefPrompt` entries. Each prompt SHALL have a unique `storageKey`.

**Requirement: Minimum Enrichment Per Module**

Each module data file SHALL have `educationalLayer` on at least 3 representative scenarios:
- Module 1: 1 URLItem + 1 Escenario + 1 Escenario (SMS/web)
- Module 2: 1 IdentityTheftScenario + 1 VishingCall + 1 TwoFactorScenario
- Module 3: 1 EscenarioChat + 1 ActividadMula + 1 EscenarioExtorsion
- Module 4: 1 CryptoChallenge + 1 HardeningScenario + 1 IntegrityCheck

---

## 3. EducationalMediator Component

### ADDED: Capability `educational-mediator`

The system SHALL create a core mediator component with a finite state machine, Socratic questioning interface, and "Holographic Network Assistant" visual theme.

#### Requirement: State Machine Transitions

The mediator state machine SHALL follow these transition rules:

```
idle ──INTRO_REQUESTED──→ onIntro
onIntro ──PLAYER_RESPONDED──→ idle
onIntro ──TIMEOUT (30s)──→ idle

idle ──TIP_REQUESTED──→ onTipRequested
onTipRequested ──PLAYER_RESPONDED──→ idle
onTipRequested ──TIMEOUT (30s)──→ idle

idle ──ERROR_OCCURRED──→ onErrorConstructive
onErrorConstructive ──PLAYER_RESPONDED (retry)──→ idle
onErrorConstructive ──PLAYER_RESPONDED (reflected)──→ idle
onErrorConstructive ──PLAYER_RESPONDED (skipped)──→ idle
onErrorConstructive ──TIMEOUT (30s)──→ idle

idle ──DEBRIEF_STARTED──→ onMetaReflection
onMetaReflection ──DEBRIEF_COMPLETED──→ idle
onMetaReflection ──TIMEOUT (60s)──→ idle
```

**Scenario: Error → mediator → resume**
- GIVEN the mediator is in `idle` state
- WHEN an `ERROR_OCCURRED` event fires with `scenarioId: 'url-003'`
- THEN the mediator transitions to `onErrorConstructive`
- AND the `CognitiveConflict.question` for `url-003` is displayed
- AND a 30-second countdown timer starts
- WHEN the player responds or timeout fires
- THEN the mediator transitions back to `idle`

#### Requirement: Props Interface

```typescript
export interface EducationalMediatorProps {
  /** Current mediator state */
  state: MediatorState
  /** Educational layer for the current scenario (undefined = no content) */
  educationalLayer?: EducationalLayer
  /** Scaffolding progress for the current scenario type */
  scaffoldingProgress?: ScaffoldingProgress
  /** Callback when player responds to mediator */
  onRespond: (event: MediatorEvent) => void
  /** Callback to dismiss the mediator */
  onDismiss: () => void
  /** Optional: the player's incorrect answer (for onErrorConstructive state) */
  playerAnswer?: string
  /** Optional: the correct answer (never shown directly — used for follow-up logic) */
  correctAnswer?: string
}
```

#### Requirement: Render Rules Per State

| State | UI Element | Spanish Label | Visual |
|-------|-----------|---------------|--------|
| `idle` | Nothing rendered | — | — |
| `onIntro` | Panel slides in from right | "Asistente de Red Holográfico" | Cyan/magenta glow border |
| `onTipRequested` | Tip card with optional visual guide | "Pista Táctica" | Holographic shimmer |
| `onErrorConstructive` | Conflict question panel | "Reflexión Táctica de Seguridad" | Pulsing amber border |
| `onMetaReflection` | Debrief panel with sliders/decisions | "Bitácora del Operador" | Calm blue gradient |

#### Requirement: Spanish UI Text

All user-facing text in the mediator component SHALL be in Spanish. The following strings are REQUIRED:

| Key | Spanish Text |
|-----|-------------|
| `panelTitle.intro` | "Asistente de Red Holográfico" |
| `panelTitle.tip` | "Pista Táctica" |
| `panelTitle.error` | "Reflexión Táctica de Seguridad" |
| `panelTitle.debrief` | "Bitácora del Operador" |
| `button.reflect` | "Reflexionar" |
| `button.retry` | "Intentar de nuevo" |
| `button.skip` | "Continuar sin responder" |
| `button.next` | "Siguiente" |
| `button.dismiss` | "Cerrar" |
| `timer.warning` | "Tiempo restante: {n}s" |
| `timer.expired` | "Tiempo agotado — continuando..." |
| `scaffolding.label` | "Análisis asistido disponible" |
| `error.reducedScore` | "Puntuación reducida por segundo intento" |
| `debrief.save` | "Guardar en bitácora" |
| `debrief.skip` | "Omitir reflexión" |

#### Requirement: Visual Theme

The mediator panel SHALL use the "Holographic Network Assistant" theme:
- Background: `bg-[#0a0a1a]/95 backdrop-blur-md`
- Border: `border-cyan-500/30` (idle/intro), `border-amber-500/40` (error), `border-blue-500/30` (debrief)
- Glow: `shadow-[0_0_20px_rgba(6,182,212,0.15)]` (cyan glow)
- Text: `text-cyan-300` for headings, `text-slate-300` for body
- Panel width: `w-80` (320px) on desktop, full-width on mobile
- Panel position: Fixed right sidebar, below HUD bar (top: 48px)
- Animation: `framer-motion` slide-in from right, 300ms ease-out

#### Requirement: Socratic Questioning

The mediator component SHALL never display the correct answer directly. When the player responds:
- If `response: 'retry'` → Show `scaffoldingTip` at next level, do NOT reveal answer
- If `response: 'reflected'` → Show `expectedInsight` as a confirmation ("¡Exacto! Has identificado...")
- If `response: 'skipped'` → Show `explicacion` from the scenario data as fallback explanation

---

## 4. Shield Damage Integration

### MODIFIED: Capability `shield-damage-flow`

The existing shield damage flow SHALL be modified to inject a mediator pause before HP reduction.

#### Requirement: Integration Point in HUDProvider

The `HUDProvider` component currently exposes `damageShield(amount: number)`. The system SHALL NOT modify the `HUDProvider` interface directly. Instead, the mediator integration SHALL happen at the call site in each minigame component.

**Current flow (no mediator):**
```
Player error → damageShield(amount) → HP reduced → red flash
```

**New flow (with mediator):**
```
Player error → mediator pause → player reflects →
  IF retry: damageShield(amount × 0.5) → HP reduced (half) → resume
  IF skip:  damageShield(amount) → HP reduced (full) → resume
  IF timeout: damageShield(amount) → HP reduced (full) → resume
```

#### Requirement: Pause Flow in Minigames

Each minigame component SHALL implement the pause flow by:
1. Intercepting the error condition BEFORE calling `damageShield()`
2. Setting local state `isMediatorActive: true`
3. Rendering `<EducationalMediator>` with `state: 'onErrorConstructive'`
4. Pausing the game timer (if applicable)
5. On mediator resolution, calling `damageShield()` with appropriate amount
6. Setting `isMediatorActive: false` and resuming the game

**Scenario: CookieSweeper cookie leak**
- GIVEN a cookie in `CookieSweeper` reaches the shield (leak)
- WHEN the leak is detected in the game loop
- THEN the game pauses (game loop interval cleared)
- AND the mediator panel opens with the `CognitiveConflict` for the current scenario
- WHEN the player reflects and chooses "retry"
- THEN `damageShield(damagePerLeak × 0.5)` is called
- AND the game resumes (game loop interval restarted)

#### Requirement: Score Impact on Second Chance

When the player chooses "retry" after an error:
- Shield damage SHALL be reduced by 50% (`amount × 0.5`)
- XP earned for the scenario SHALL be reduced by 25% (if the player eventually answers correctly)
- The reduced score SHALL be indicated with a Spanish label: "Puntuación reducida por segundo intento"

#### Requirement: Timeout Behavior

Each mediator state SHALL have an auto-continue timeout:
- `onErrorConstructive`: 30 seconds → auto-dismiss, full damage applied
- `onTipRequested`: 30 seconds → auto-dismiss
- `onIntro`: 30 seconds → auto-dismiss
- `onMetaReflection`: 60 seconds → auto-dismiss

When timeout fires:
- The mediator transitions to `idle`
- Full shield damage is applied (no reduction)
- A brief toast message appears: "Tiempo agotado — continuando..."

#### Requirement: Affected Minigame Components

The following components SHALL implement the mediator pause flow:

| Component | File Path | Error Trigger |
|-----------|-----------|---------------|
| CookieSweeper | `components/module1/CookieSweeper.tsx` | Cookie leaks through shield |
| MetadataExtractor | `components/module1/MetadataExtractor.tsx` | Confidential image sent without purge |
| EmailDeconstructor | `components/module2/EmailDeconstructor.tsx` | Email auto-executes (panic timer) |
| PhoneticDecoder | `components/module2/PhoneticDecoder.tsx` | Wrong vishing decision |

---

## 5. Pedagogical Mediation Notebook

### MODIFIED: Capability `module1-scenarios`

The right column in URLInspector and EmailDeconstructor SHALL transform from "Telemetry" display to "Pedagogical Mediation Notebook".

#### Requirement: Notebook Transformation in URLInspector

**Current layout (URLInspector):**
```
[URL Analysis Main Area] [Right Column: Component Breakdown]
```

**New layout:**
```
[URL Analysis Main Area] [Right Column: Bitácora de Mediación Pedagógica]
```

The right column SHALL display:
1. **Header**: "Bitácora de Mediación Pedagógica" with a holographic icon
2. **Inductive Questions**: Clickable items derived from the scenario's `educationalLayer.conflictQuestion`
3. **Exploration State**: Each question tracks `isExplored: boolean`
4. **Terminal Output**: Clicking a question outputs the answer in the existing terminal-style UI

**Scenario: Clicking an inductive question**
- GIVEN the URLInspector right column shows "Bitácora de Mediación Pedagógica"
- WHEN the player clicks on an inductive question item
- THEN the question text appears in the terminal output area
- AND a "Respuesta del sistema" response appears with guidance (from `scaffoldingTip.hint`)
- AND the item's `isExplored` state becomes `true` (visual feedback: checkmark)

#### Requirement: Inductive Question Generation

The right column SHALL generate inductive questions from the scenario data:
- Primary question: `educationalLayer.conflictQuestion.question`
- Secondary question: Derived from `URLItem.componentes.parametros` analysis
- Tertiary question: Generic URL safety question (reused across scenarios)

**Question bank (reusable across URL scenarios):**
```typescript
const URL_INDUCTIVE_QUESTIONS: Array<{
  id: string
  question: string
  derivesFrom: string  // property path in URLItem
}> = [
  {
    id: 'domain-analysis',
    question: '¿El dominio coincide con la organización que dice representar?',
    derivesFrom: 'componentes.dominio'
  },
  {
    id: 'parameter-analysis',
    question: '¿Los parámetros de la URL son consistentes con un sitio legítimo?',
    derivesFrom: 'componentes.parametros'
  },
  {
    id: 'security-indicators',
    question: '¿Qué indica la presencia de sellos de seguridad en la URL?',
    derivesFrom: 'elementoSuspeito'
  }
]
```

#### Requirement: Click-to-Explore Interaction Model

The interaction model SHALL follow this pattern:
1. Right column lists clickable question items (styled as holographic cards)
2. Clicking a question → item expands → shows question text
3. A "Consultar" button triggers the response
4. Response appears in terminal-style output below the question
5. Item collapses and shows a `✓` indicator

#### Requirement: Notebook in EmailDeconstructor

The same notebook pattern SHALL apply to `EmailDeconstructor`:
- Right column replaces anomaly list with "Bitácora de Mediación Pedagógica"
- Questions are derived from `SimulatedEmail.anomalies` and `educationalLayer`
- Clicking a question outputs email-specific guidance in the terminal

**Email-specific question bank:**
```typescript
const EMAIL_INDUCTIVE_QUESTIONS: Array<{
  id: string
  question: string
  derivesFrom: string
}> = [
  {
    id: 'sender-analysis',
    question: '¿La dirección del remitente coincide con el nombre mostrado?',
    derivesFrom: 'fromAddress'
  },
  {
    id: 'header-analysis',
    question: '¿Los registros SPF/DKIM/DMARC pasan la verificación?',
    derivesFrom: 'spfResult'
  },
  {
    id: 'urgency-detection',
    question: '¿El email crea una sensación de urgencia artificial?',
    derivesFrom: 'bodyHtml'
  }
]
```

---

## 6. Metacognitive Debrief

### ADDED: Capability `metacognitive-debrief`

The system SHALL create a pre-results "Operator Logbook" micro-activity that promotes self-regulated learning.

#### Requirement: DebriefPanel Component

A new `DebriefPanel` component SHALL be created at `components/shared/DebriefPanel.tsx`.

**Props interface:**
```typescript
export interface DebriefPanelProps {
  /** Debrief prompts for the completed scenario */
  prompts: DebriefPrompt[]
  /** Callback when all prompts are answered */
  onComplete: (responses: Record<string, unknown>) => void
  /** Callback to skip the debrief */
  onSkip: () => void
  /** Module name for display */
  moduleName: string
}
```

#### Requirement: Pre-Results Integration

Each module's `ResultsScreen` SHALL be modified to show `DebriefPanel` BEFORE the final results.

**Modified flow:**
```
Module completes → DebriefPanel (Operator Logbook) → ResultsScreen (scores)
```

**Scenario: Module 1 completion**
- GIVEN the player completes the last activity in Module 1
- WHEN the module transitions to results
- THEN the `DebriefPanel` is shown first with the module's debrief prompts
- AND the player can answer or skip
- WHEN the debrief completes or is skipped
- THEN the `ResultsScreen` displays with scores and confetti

#### Requirement: Slider Components for Confidence

The `DebriefPanel` SHALL render slider prompts using Radix UI's `Slider` component (already installed).

**Slider configuration:**
- Track: `bg-slate-700` with `bg-cyan-500` fill
- Thumb: `w-4 h-4 rounded-full bg-cyan-400 border-2 border-cyan-300`
- Labels: `sliderLabels.min` on left, `sliderLabels.max` on right
- Range: 0–100, step 1
- Default: 50 (neutral)
- Value display: `{value}%` in cyan text

#### Requirement: Micro-Decision Components for Strategy

The `DebriefPanel` SHALL render micro-decision prompts as a button group.

**Button group configuration:**
- Layout: Vertical stack of `options` buttons
- Style: `bg-slate-800 border border-slate-600 text-slate-300` (unselected)
- Selected: `bg-cyan-500/20 border-cyan-500 text-cyan-300`
- Only one option can be selected at a time
- Selection triggers `storageKey` persistence

#### Requirement: Data Persistence to localStorage

All debrief responses SHALL be persisted to `localStorage` under the key pattern:
```
cg_debrief_{moduleId}_{storageKey}
```

**Storage schema:**
```typescript
interface DebriefStorage {
  moduleId: number
  scenarioId: string
  storageKey: string
  value: number | string  // slider value or selected option text
  timestamp: number       // Date.now()
}
```

**Scenario: Slider persistence**
- GIVEN a `DebriefPrompt` with `storageKey: 'url-001-confidence'` and `type: 'slider'`
- WHEN the player moves the slider to 72
- THEN `localStorage.setItem('cg_debrief_1_url-001-confidence', JSON.stringify({ moduleId: 1, scenarioId: 'url-001', storageKey: 'url-001-confidence', value: 72, timestamp: Date.now() }))` is called
- AND the value persists across page refreshes

#### Requirement: Operator Logbook Visual Metaphor

The DebriefPanel SHALL use the "Bitácora del Operador" (Operator Logbook) visual metaphor:
- Background: `bg-[#0a0a1a]/95` with a subtle notebook texture (CSS pattern)
- Header icon: `BookOpen` from lucide-react
- Header text: "Bitácora del Operador"
- Sub-header: "Module name — Reflexión del operador"
- Footer: Two buttons — "Guardar en bitácora" (primary) and "Omitir reflexión" (secondary)

---

## 7. Emotional Regulation (PhoneticDecoder)

### MODIFIED: Capability `module2-scenarios`

The `PhoneticDecoder` vishing module SHALL integrate emotional regulation mechanics linked to conversational choices.

#### Requirement: Panic Bar Mechanics

The `PhoneticDecoder` SHALL render a "Panic Bar" (Barras de Pánico) that responds to player choices.

**Panic bar behavior:**
- Visual: Horizontal bar at the top of the vishing transcript area
- Color: Green (0–30) → Yellow (31–60) → Orange (61–80) → Red (81–100)
- Label: "Nivel de Pánico" with percentage
- Animation: Pulsing glow when `isWarning: true`, shake when `isCritical: true`

**Panic level changes:**
| Action | Panic Change | Power Balance Change |
|--------|-------------|---------------------|
| Player chooses safe option | -15 to -20 | +10 |
| Player chooses unsafe option | +15 to +25 | -15 |
| Player identifies red flag | -10 | +20 |
| Player takes too long (>15s) | +5 per 5s | -5 per 5s |
| Player asks clarifying question | -5 | +5 |

#### Requirement: Power Asymmetry Reversal

The vishing module SHALL track a `powerBalance` score that represents who controls the conversation.

**Power balance mechanics:**
- Initial state: `powerBalance: -20` (attacker has advantage — they initiated, they have a script)
- Each player action shifts the balance
- When `powerBalance > 0`: Player is "disarming" the attacker — attacker script becomes less confident
- When `powerBalance > 30`: Attacker starts to falter — transcript shows hesitation
- When `powerBalance < -40`: Attacker is dominant — panic bar rises faster

**Scenario: Power reversal through red flag identification**
- GIVEN `powerBalance: -20` and the attacker is mid-script
- WHEN the player clicks on a red flag phrase "necesito tus datos ahora"
- THEN `powerBalance` increases by 20 (to 0)
- AND the next attacker line shows hesitation (e.g., "Bueno, solo necesito confirmar...")
- AND `panicLevel` decreases by 10

#### Requirement: Integration with VishingChoice

Each `VishingChoice` in `VishingDecisionPoint` SHALL include panic and power impact:

```typescript
export interface VishingChoice {
  // ... existing fields unchanged ...
  /** Panic level delta when this choice is selected */
  panicDelta: number          // NEW
  /** Power balance delta when this choice is selected */
  powerBalanceDelta: number   // NEW
}
```

---

## 8. Acceptance Criteria (per Capability)

### Capability: `educational-type-system`

- [ ] `types/educational.ts` compiles with `strict: true` and zero `any` types
- [ ] All 8 interfaces/types are exported: `MediatorState`, `CognitiveConflict`, `ScaffoldingTip`, `ScaffoldingLevel`, `DebriefPrompt`, `DebriefPromptType`, `EducationalLayer`, `MediatorEvent`, `ScaffoldingProgress`, `EmotionalRegulationState`
- [ ] `MediatorState` has exactly 5 states: `idle`, `onIntro`, `onTipRequested`, `onErrorConstructive`, `onMetaReflection`
- [ ] `ScaffoldingLevel` has exactly 4 levels: `explicit`, `guided`, `implicit`, `withdrawn`
- [ ] `DebriefPromptType` has exactly 3 types: `slider`, `micro-decision`, `open-reflection`
- [ ] `MediatorEvent` is a discriminated union with `type` field

### Capability: `pedagogical-data-schema`

- [ ] All 4 module data files compile without errors after adding `educationalLayer`
- [ ] `explicacion` field is preserved in all interfaces (backward compatibility)
- [ ] At least 3 scenarios per module have `educationalLayer` populated
- [ ] Each `educationalLayer` has all 4 required fields: `conflictQuestion`, `scaffoldingTip`, `metacognitiveDebrief`, `mediatorHook`
- [ ] Every `conflictQuestion.question` does NOT contain the answer
- [ ] Every `metacognitiveDebrief` entry has a unique `storageKey`
- [ ] `pnpm build` succeeds with `output: 'export'` static generation

### Capability: `educational-mediator`

- [ ] `EducationalMediator.tsx` renders correctly in all 5 states
- [ ] State transitions follow the documented state machine (no invalid transitions)
- [ ] Panel slides in from right with framer-motion animation (300ms)
- [ ] Panel auto-dismisses after 30s timeout (60s for debrief)
- [ ] All UI text is in Spanish
- [ ] Socratic questioning: correct answer is NEVER displayed directly
- [ ] "Holographic Network Assistant" visual theme: cyan/magenta glow, dark background
- [ ] Panel is dismissable via "Cerrar" button
- [ ] Responsive: full-width on mobile, 320px sidebar on desktop

### Capability: `shield-damage-flow`

- [ ] Error in CookieSweeper triggers mediator pause before HP reduction
- [ ] Error in MetadataExtractor triggers mediator pause before HP reduction
- [ ] Error in EmailDeconstructor triggers mediator pause before HP reduction
- [ ] Error in PhoneticDecoder triggers mediator pause before HP reduction
- [ ] Game timer pauses during mediator interaction
- [ ] "Retry" choice applies 50% shield damage
- [ ] "Skip" choice applies 100% shield damage
- [ ] Timeout applies 100% shield damage
- [ ] Score reduction label appears: "Puntuación reducida por segundo intento"
- [ ] Game resumes cleanly after mediator dismissal

### Capability: `module1-scenarios` (Notebook)

- [ ] URLInspector right column displays "Bitácora de Mediación Pedagógica"
- [ ] At least 3 inductive questions are shown per URL scenario
- [ ] Clicking a question shows it in the terminal output
- [ ] "Consultar" button triggers the response display
- [ ] Explored questions show a `✓` indicator
- [ ] EmailDeconstructor right column displays the same notebook pattern
- [ ] Email-specific inductive questions are derived from email anomalies

### Capability: `module2-scenarios` (Emotional Regulation)

- [ ] Panic bar renders above the vishing transcript
- [ ] Panic bar color changes: green → yellow → orange → red
- [ ] Safe choices reduce panic by 15–20
- [ ] Unsafe choices increase panic by 15–25
- [ ] Red flag identification reduces panic by 10 and increases power balance by 20
- [ ] `powerBalance` starts at -20 (attacker advantage)
- [ ] When `powerBalance > 0`, attacker transcript shows hesitation
- [ ] When `powerBalance < -40`, panic rises faster
- [ ] Panic bar pulses when `isWarning: true`
- [ ] Panic bar shakes when `isCritical: true`

### Capability: `metacognitive-debrief`

- [ ] `DebriefPanel` renders slider prompts with Radix UI Slider
- [ ] `DebriefPanel` renders micro-decision prompts as button groups
- [ ] All responses persist to `localStorage` with correct key pattern
- [ ] "Bitácora del Operador" visual theme is applied
- [ ] "Guardar en bitácora" button saves and advances
- [ ] "Omitir reflexión" button skips and advances
- [ ] Module 1–4 ResultsScreen shows debrief before scores
- [ ] Debrief panel displays module name and "Reflexión del operador" sub-header

### Capability: `module3-scenarios`

- [ ] At least 3 scenarios in Module 3 have `educationalLayer` populated
- [ ] Chat scenarios include `conflictQuestion` about recruitment manipulation tactics
- [ ] Mule scenarios include `conflictQuestion` about financial red flags
- [ ] Extortion scenarios include `conflictQuestion` about response strategies

### Capability: `module4-scenarios`

- [ ] At least 3 scenarios in Module 4 have `educationalLayer` populated
- [ ] Crypto challenges include `conflictQuestion` about cipher identification
- [ ] Hardening scenarios include `conflictQuestion` about security configuration
- [ ] Integrity checks include `conflictQuestion` about checksum verification

---

## Cross-Cutting: Hooks

### ADDED: `useEducationalMediator` Hook

A new hook SHALL be created at `hooks/useEducationalMediator.ts`.

```typescript
export function useEducationalMediator(scenarioType: string) {
  return {
    /** Current mediator state */
    state: MediatorState
    /** Current scaffolding progress for this scenario type */
    scaffoldingProgress: ScaffoldingProgress
    /** Start the intro for a scenario */
    startIntro: (scenarioId: string) => void
    /** Request a tip for a scenario */
    requestTip: (scenarioId: string) => void
    /** Trigger error mediation */
    triggerError: (scenarioId: string, correctAnswer: string, playerAnswer: string) => void
    /** Start the debrief */
    startDebrief: (scenarioId: string) => void
    /** Respond to the mediator */
    respond: (event: MediatorEvent) => void
    /** Dismiss the mediator */
    dismiss: () => void
    /** Whether the mediator is currently active (any non-idle state) */
    isActive: boolean
  }
}
```

---

## Cross-Cutting: Dependencies

No new npm dependencies required. All integrations use existing packages:
- `framer-motion` (already installed) — panel animations
- `Radix UI Slider` (already available via `@radix-ui/react-slider`) — debrief sliders
- `lucide-react` (already installed) — mediator icons (`Shield`, `BookOpen`, `HelpCircle`, `AlertTriangle`)
- `localStorage` (built-in) — debrief persistence

---

## Cross-Cutting: File Inventory

| File | Action | Lines Est. |
|------|--------|-----------|
| `types/educational.ts` | Create | ~80 |
| `types/module1.ts` | Modify (add `educationalLayer?`) | +2 |
| `types/module2.ts` | Modify (add `educationalLayer?`) | +4 |
| `types/module3.ts` | Modify (add `educationalLayer?`) | +2 |
| `types/module4.ts` | Modify (add `educationalLayer?`) | +2 |
| `components/shared/EducationalMediator.tsx` | Create | ~200 |
| `components/shared/MediatorPanel.tsx` | Create | ~120 |
| `components/shared/DebriefPanel.tsx` | Create | ~150 |
| `hooks/useEducationalMediator.ts` | Create | ~100 |
| `components/module1/CookieSweeper.tsx` | Modify (pause flow) | +30 |
| `components/module1/MetadataExtractor.tsx` | Modify (pause flow) | +30 |
| `components/module1/URLInspector.tsx` | Modify (notebook) | +60 |
| `components/module2/EmailDeconstructor.tsx` | Modify (notebook + pause) | +60 |
| `components/module2/PhoneticDecoder.tsx` | Modify (panic bar + pause) | +80 |
| `components/ResultsScreen.tsx` | Modify (debrief gate) | +40 |
| `data/module1Data.json` | Modify (enrich 3 scenarios) | +60 |
| `data/module2Data.json` | Modify (enrich 3 scenarios) | +60 |
| `data/module3Data.json` | Modify (enrich 3 scenarios) | +60 |
| `data/module4Data.json` | Modify (enrich 3 scenarios) | +60 |
| **Total** | | **~1,200** |
