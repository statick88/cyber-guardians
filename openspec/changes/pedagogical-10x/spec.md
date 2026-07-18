# Delta: Pedagogical 10x Enhancement

## Purpose

Close three pedagogical gaps — explicit instruction (4/10 → 8/10), assessment depth (5/10 → 9/10), and adaptability (5/10 → 9/10) — by adding 6 new components and 3 new hooks that integrate with the existing EducationalMediator FSM.

**Change**: `pedagogical-10x`
**Feature Gate**: `NEXT_PUBLIC_EDUCATIONAL_MEDIATOR` (existing)
**Total Scope**: 9 components/hooks across 3 areas

---

## Type Extensions

### Modified: `types/educational.ts`

```typescript
// ─── New Debrief Prompt Type ────────────────────────────────────────────────

export type DebriefPromptType =
  | 'slider'
  | 'micro-decision'
  | 'open-reflection'
  | 'open-ended-with-rubric'  // NEW

// ─── Rubric for Open-Ended Assessment ───────────────────────────────────────

export interface RubricCriterion {
  /** Keyword or phrase to match in student response */
  keyword: string
  /** Points awarded for matching this criterion */
  points: number
  /** Feedback shown when criterion is met */
  feedback: string
}

export interface AssessmentRubric {
  /** Rubric criteria (simple keyword matching) */
  criteria: RubricCriterion[]
  /** Maximum achievable score */
  maxScore: number
  /** Feedback template: shown after all criteria evaluated */
  feedbackTemplate: string
}

// ─── Portfolio Types ────────────────────────────────────────────────────────

export type CompetencyTag =
  | 'email-analysis'
  | 'url-inspection'
  | 'phishing-sim'
  | 'digital-defense'
  | 'metadata-extraction'
  | 'cookie-sweeping'

export interface CompetencyScore {
  tag: CompetencyTag
  /** Score 0–100 */
  score: number
  /** Number of scenarios attempted */
  attempts: number
  /** Timestamp of last update */
  lastUpdated: number
}

export interface PortfolioEntry {
  scenarioId: string
  moduleName: string
  competencyTag: CompetencyTag
  /** Debrief responses */
  responses: Record<string, unknown>
  /** Rubric score if applicable */
  rubricScore?: number
  /** Timestamp */
  timestamp: number
}

export interface Portfolio {
  /** Competency scores aggregated across all entries */
  competencies: Record<CompetencyTag, CompetencyScore>
  /** All portfolio entries */
  entries: PortfolioEntry[]
  /** Last export timestamp */
  lastExported?: number
}

// ─── Scaffolding Adaptation ─────────────────────────────────────────────────

export interface ScaffoldingAdaptation {
  /** Scaffolding level */
  level: ScaffoldingLevel
  /** Show additional hints before activity */
  showExtraHints: boolean
  /** Simplify activity options (reduce choices) */
  simplifyOptions: boolean
  /** Show difficulty indicator to student */
  showDifficultyIndicator: boolean
  /** Enable challenge mode (no assistance) */
  challengeMode: boolean
}

// ─── Learning Path Recommendation ───────────────────────────────────────────

export interface LearningPathRecommendation {
  /** Recommended next scenario ID */
  scenarioId: string
  /** Reason for recommendation */
  reason: string
  /** Competency tag this addresses */
  targetCompetency: CompetencyTag
  /** Priority 1 (highest) – 5 */
  priority: number
}
```

---

## Area 1: Explicit Instruction Layer

### Component: `ConceptCard`

**Purpose**: Show concept introduction before each activity type, surfacing `capaEducativa` data.

**Interface**:
```typescript
interface ConceptCardProps {
  /** Activity type being introduced */
  activityType: ActivityType
  /** Educational layer with concept data */
  educationalLayer: EducationalLayer
  /** Called when student dismisses or starts activity */
  onDismiss: () => void
  /** Called when student requests worked example */
  onViewExample: () => void
}
```

**Behavior**:
- Renders `educationalLayer.conflictQuestion.question` as the core concept
- Shows `educationalLayer.conflictQuestion.followUp` as context
- Displays `educationalLayer.conflictQuestion.contradictingEvidence` as teaching material
- Includes a "Ver ejemplo" button that triggers `onViewExample`
- Includes a "Comenzar" button that triggers `onDismiss`
- Uses framer-motion for entry/exit animation
- Styled with `glass-card neon-border` consistent with existing UI

**Integration**:
- Shown when `useExplicitInstruction.shouldShow(activityType)` returns `true`
- Renders inside `EducationalMediator` when `mediator.state === 'onIntro'`

---

### Component: `WorkedExample`

**Purpose**: Step-by-step demonstration extracted from `capaEducativa` data.

**Interface**:
```typescript
interface WorkedExampleProps {
  /** Activity type for worked example template */
  activityType: ActivityType
  /** Educational layer with example data */
  educationalLayer: EducationalLayer
  /** Called when student finishes viewing */
  onDismiss: () => void
}

/** Template for worked example per activity type */
interface WorkedExampleTemplate {
  title: string
  steps: Array<{
    label: string
    description: string
    /** Optional code snippet or data example */
    code?: string
  }>
  /** Key takeaway shown at end */
  takeaway: string
}
```

**Behavior**:
- Maps `activityType` to a `WorkedExampleTemplate`
- Each template has 3–5 steps with descriptions
- Uses `conflictQuestion.expectedInsight` as the takeaway
- Progress indicator shows current step
- "Siguiente" / "Anterior" navigation between steps
- "Entendido" button dismisses the component
- Template data is hardcoded per `ActivityType` (not AI-generated)

**ActivityType → Template Mapping**:
| ActivityType | Example Focus |
|---|---|
| `analisis-email` | Identifying phishing indicators in email headers |
| `inspeccion-url` | Breaking down URL components for suspicious patterns |
| `phishing-simulated` | Evaluating a simulated phishing page |
| `defensa-digital` | Protecting personal information online |

**Integration**:
- Shown after `ConceptCard` when student clicks "Ver ejemplo"
- Tracks view state via `useExplicitInstruction`

---

### Hook: `useExplicitInstruction`

**Purpose**: Track which activity types have been introduced, persist state to localStorage.

**Interface**:
```typescript
interface UseExplicitInstructionReturn {
  /** Check if a given activity type has been introduced */
  shouldShow: (activityType: ActivityType) => boolean
  /** Mark an activity type as introduced */
  markIntroduced: (activityType: ActivityType) => void
  /** Check if worked example has been viewed */
  hasViewedExample: (activityType: ActivityType) => boolean
  /** Mark worked example as viewed */
  markExampleViewed: (activityType: ActivityType) => void
  /** Reset all introduction state (for testing) */
  resetAll: () => void
}
```

**Behavior**:
- Persists `Set<ActivityType>` to localStorage under key `cg_introduced_types`
- Persists `Set<ActivityType>` for example views under key `cg_viewed_examples`
- `shouldShow` returns `true` if activity type not in introduced set
- `markIntroduced` adds to introduced set and persists
- Handles SSR gracefully (returns `true` for all on server)
- JSON serialization: `Set` → array → JSON → localStorage

**Integration**:
- Used by `ConceptCard` to decide visibility
- Used by `EducationalMediator` to conditionally show intro flow

---

## Area 2: Formative Assessment System

### Modified: `DebriefDialog`

**Enhancement**: Add `open-ended-with-rubric` prompt type.

**New Prompt Type Behavior**:
- Renders textarea (same as `open-reflection`)
- After student submits response, evaluates against `AssessmentRubric.criteria`
- Simple keyword matching: if response contains `criterion.keyword`, award `criterion.points`
- Shows immediate feedback per matched criterion
- Shows total score / max score at end
- Stores rubric score in response alongside text

**New Props** (added to `DebriefDialogProps`):
```typescript
interface DebriefDialogProps {
  // ... existing props
  /** Optional rubrics per prompt (keyed by storageKey) */
  rubrics?: Record<string, AssessmentRubric>
}
```

**Rendering Logic**:
```typescript
// In DebriefDialog, for open-ended-with-rubric:
if (currentPrompt.type === 'open-ended-with-rubric') {
  // Render textarea (same as open-reflection)
  // On submit: evaluate rubric, show feedback, store score
}
```

**Integration**:
- Rubrics defined in `capaEducativa.metacognitiveDebrief`
- Passed via `educationalLayer.metacognitiveDebrief.rubrics`

---

### Component: `FormativeFeedback`

**Purpose**: Inline feedback during activities, triggered on `onErrorConstructive`.

**Interface**:
```typescript
interface FormativeFeedbackProps {
  /** Educational layer with conflict question */
  educationalLayer: EducationalLayer
  /** Scaffolding level for feedback tone */
  scaffoldingLevel: ScaffoldingLevel
  /** Number of errors so far */
  errorCount: number
  /** Mastery progress (concepts understood / total) */
  masteryProgress: { understood: number; total: number }
  /** Called when feedback is dismissed */
  onDismiss: () => void
}
```

**Behavior**:
- Shows `conflictQuestion.expectedInsight` as targeted feedback
- Adapts tone based on `scaffoldingLevel`:
  - `explicit`: "Recuerda que..." (gentle reminder)
  - `guided`: "Piensa en..." (guided question)
  - `implicit`: "Observa..." (minimal prompt)
  - `withdrawn`: No feedback shown
- Shows mastery progress: "2 de 3 conceptos comprendidos"
- Auto-dismiss after 10 seconds or manual dismiss
- Renders inside `EducationalPanel` when state is `onErrorConstructive`

**Integration**:
- Replaces plain conflict question in `EducationalPanel` when `scaffoldingLevel` is `explicit` or `guided`
- Falls back to existing behavior for `implicit`/`withdrawn`

---

### Hook: `usePortfolio`

**Purpose**: Aggregate NotebookEntry data into competency scores.

**Interface**:
```typescript
interface UsePortfolioReturn {
  /** Current portfolio */
  portfolio: Portfolio
  /** Add a new portfolio entry from debrief */
  addEntry: (entry: Omit<PortfolioEntry, 'timestamp'>) => void
  /** Get score for a specific competency */
  getCompetencyScore: (tag: CompetencyTag) => number
  /** Get all competency scores */
  getAllScores: () => Record<CompetencyTag, CompetencyScore>
  /** Export portfolio as JSON string */
  exportJSON: () => string
  /** Clear all portfolio data */
  clearPortfolio: () => void
}
```

**Behavior**:
- Persists `Portfolio` to localStorage under key `cg_portfolio`
- `addEntry` appends to entries and recomputes competency scores
- Score computation: average of rubric scores for each `CompetencyTag`
- If no rubric score, uses `selfAssessment * 20` (converted to 0–100)
- `exportJSON` returns pretty-printed JSON with `lastExported` timestamp
- Handles SSR gracefully (empty portfolio on server)
- Caps entries at 200 (oldest trimmed first)

**Integration**:
- Called from `EducationalMediator` on `onDebriefComplete`
- Reads `NotebookEntry[]` via `useNotebook` for reflection data
- Consumed by `AdaptivePath` for learning recommendations

---

## Area 3: Adaptive Content System

### Enhanced: `useScaffolding`

**Enhancement**: Return `ScaffoldingAdaptation` object alongside existing tip.

**New Export**:
```typescript
export function getScaffoldingAdaptation(
  level: ScaffoldingLevel
): ScaffoldingAdaptation
```

**Behavior**:
| Level | showExtraHints | simplifyOptions | showDifficultyIndicator | challengeMode |
|---|---|---|---|---|
| `explicit` | true | true | true | false |
| `guided` | false | false | true | false |
| `implicit` | false | false | false | false |
| `withdrawn` | false | false | false | true |

**Integration**:
- Called from `AdaptiveDifficulty` component
- Pure function, no side effects

---

### Component: `AdaptiveDifficulty`

**Purpose**: Wrap activity content and adapt presentation based on scaffolding level.

**Interface**:
```typescript
interface AdaptiveDifficultyProps {
  /** Current scaffolding level */
  level: ScaffoldingLevel
  /** Activity type for adaptation rules */
  activityType: ActivityType
  /** Children to adapt */
  children: React.ReactNode
}
```

**Behavior**:
- Reads `ScaffoldingAdaptation` from `getScaffoldingAdaptation(level)`
- Applies CSS class modifiers:
  - `explicit`: Adds `opacity-90` to options, shows "💡 Modo guiado" indicator
  - `guided`: Shows "📊 Dificultad adaptativa" indicator
  - `implicit`: No modifiers
  - `withdrawn`: Shows "🏆 Modo desafío" indicator
- Does NOT modify content or options — only presentation
- Shows difficulty indicator badge when `showDifficultyIndicator` is true

**Integration**:
- Wraps activity content in `Module1Game` and other module games
- Reads scaffolding level from `useEducationalMediator` context

---

### Hook: `useAdaptivePath`

**Purpose**: Track performance and suggest next scenario based on competency gaps.

**Interface**:
```typescript
interface UseAdaptivePathReturn {
  /** Get top N recommendations */
  getRecommendations: (count?: number) => LearningPathRecommendation[]
  /** Update recommendations after scenario completion */
  updateAfterScenario: (
    competencyTag: CompetencyTag,
    score: number
  ) => void
  /** Get weakest competency */
  getWeakestCompetency: () => CompetencyTag | null
}
```

**Behavior**:
- Reads portfolio from `usePortfolio`
- Computes competency gaps: low score = high gap
- `getRecommendations` returns scenarios targeting weakest competencies
- `updateAfterScenario` triggers recomputation
- Recommendations are deterministic (same portfolio → same recommendations)
- Empty recommendations when no portfolio data exists

**Integration**:
- Called from `EducationalMediator` after debrief completion
- Recommendations shown in "Siguiente escenario" suggestion card

---

## Integration: EducationalMediator Enhancements

### Modified: `components/mediator/EducationalMediator.tsx`

**New Props**:
```typescript
interface EducationalMediatorProps {
  // ... existing props
  /** Whether to enable pedagogical-10x features */
  enablePedagogical10x?: boolean
}
```

**Enhanced Flow**:
```
idle → onIntro (with ConceptCard if enablePedagogical10x)
  ↓
onIntro → [ConceptCard] → [WorkedExample] → idle
  ↓
onErrorConstructive → [FormativeFeedback] → idle
  ↓
onMetaReflection → [DebriefDialog with rubric prompts] → onDebriefComplete
  ↓
onDebriefComplete → [usePortfolio.addEntry] → [useAdaptivePath.updateAfterScenario]
```

**Conditional Rendering**:
- If `enablePedagogical10x === false`, behavior is identical to current
- If `enablePedagogical10x === true`, injects new components into FSM states

---

## ADDED Requirements

### Requirement: Concept Introduction Before Activity

The system MUST show a ConceptCard before the student's first encounter with each `ActivityType`.

#### Scenario: First encounter with activity type
- GIVEN the student has not seen a ConceptCard for `analisis-email`
- WHEN the student navigates to an `analisis-email` scenario
- THEN ConceptCard renders with `capaEducativa.conflictQuestion.question`
- AND the student can click "Comenzar" to dismiss

#### Scenario: Repeat encounter with activity type
- GIVEN the student has already seen a ConceptCard for `analisis-email`
- WHEN the student navigates to another `analisis-email` scenario
- THEN ConceptCard does NOT render
- AND the activity starts immediately

#### Scenario: ConceptCard dismissal persists across sessions
- GIVEN the student dismissed ConceptCard for `inspeccion-url` in a previous session
- WHEN the student starts a new session and encounters `inspeccion-url`
- THEN ConceptCard does NOT render

---

### Requirement: Worked Example Demonstration

The system MUST provide a step-by-step worked example for each `ActivityType`.

#### Scenario: Student requests worked example
- GIVEN ConceptCard is visible for `analisis-email`
- WHEN the student clicks "Ver ejemplo"
- THEN WorkedExample renders with 3–5 steps
- AND the student can navigate between steps

#### Scenario: Worked example viewed tracking
- GIVEN the student has viewed the worked example for `analisis-email`
- WHEN the student encounters `analisis-email` again
- THEN the "Ver ejemplo" option is replaced with "Ya visto ✓"

#### Scenario: Worked example uses real data
- GIVEN WorkedExample is shown for `analisis-email`
- WHEN the student views the steps
- THEN steps reference actual email analysis concepts from `capaEducativa`

---

### Requirement: Open-Ended Assessment with Rubric

The system MUST support open-ended questions with rubric-based evaluation in DebriefDialog.

#### Scenario: Rubric prompt in debrief
- GIVEN a DebriefDialog prompt has type `open-ended-with-rubric`
- WHEN the student sees the prompt
- THEN a textarea is rendered with the prompt text
- AND the student can type a free-text response

#### Scenario: Rubric evaluation on submit
- GIVEN the student submitted a response to a rubric prompt
- WHEN the rubric criteria are evaluated
- THEN matched criteria award points
- AND feedback is shown per matched criterion
- AND total score / max score is displayed

#### Scenario: No criteria matched
- GIVEN the student submitted a response with no matching criteria
- WHEN the rubric is evaluated
- THEN the feedback template is shown
- AND score is 0 / maxScore

---

### Requirement: Formative Feedback During Activities

The system MUST show targeted feedback during activities when the student makes errors.

#### Scenario: Error triggers formative feedback
- GIVEN the student made an error in an activity
- WHEN the mediator enters `onErrorConstructive` state
- THEN FormativeFeedback renders with `conflictQuestion.expectedInsight`
- AND the feedback tone matches the current `scaffoldingLevel`

#### Scenario: Mastery progress display
- GIVEN the student has understood 2 of 3 concepts
- WHEN FormativeFeedback renders
- THEN the progress indicator shows "2 de 3 conceptos comprendidos"

#### Scenario: Withdrawn level suppresses feedback
- GIVEN the scaffolding level is `withdrawn`
- WHEN the student makes an error
- THEN no FormativeFeedback is shown

---

### Requirement: Learning Portfolio

The system MUST aggregate scenario completions into a competency portfolio.

#### Scenario: Portfolio entry added on debrief completion
- GIVEN the student completed a debrief for `email-001`
- WHEN `onDebriefComplete` fires
- THEN a PortfolioEntry is added to the portfolio
- AND competency score for the entry's tag is recomputed

#### Scenario: Portfolio persistence across sessions
- GIVEN the student has portfolio entries from previous sessions
- WHEN the student starts a new session
- THEN all previous entries are available
- AND competency scores are accurate

#### Scenario: Portfolio export as JSON
- GIVEN the student has completed 3 scenarios
- WHEN the student clicks "Exportar portafolio"
- THEN a JSON string is returned with all entries and competency scores
- AND `lastExported` timestamp is set

---

### Requirement: Adaptive Scaffolding Content

The system MUST adapt activity presentation based on scaffolding level.

#### Scenario: Explicit level shows extra hints
- GIVEN the scaffolding level is `explicit`
- WHEN an activity renders inside `AdaptiveDifficulty`
- THEN a "💡 Modo guiado" indicator is visible
- AND additional hint elements are shown

#### Scenario: Withdrawn level enables challenge mode
- GIVEN the scaffolding level is `withdrawn`
- WHEN an activity renders inside `AdaptiveDifficulty`
- THEN a "🏆 Modo desafío" indicator is visible
- AND no hint elements are shown

#### Scenario: Difficulty indicator transparency
- GIVEN the scaffolding level is `explicit` or `guided`
- WHEN the activity renders
- THEN a difficulty indicator badge is visible
- AND the badge explains the current mode

---

### Requirement: Adaptive Learning Path

The system MUST recommend next scenarios based on competency gaps.

#### Scenario: Recommendations target weakest competency
- GIVEN the student has lowest score in `url-inspection`
- WHEN `getRecommendations(1)` is called
- THEN the recommendation targets `url-inspection`
- AND the reason explains the gap

#### Scenario: Recommendations update after completion
- GIVEN the student scored 40/100 on `email-analysis`
- WHEN `updateAfterScenario('email-analysis', 40)` is called
- THEN subsequent recommendations reflect the new score

#### Scenario: Empty portfolio yields no recommendations
- GIVEN the student has no portfolio entries
- WHEN `getRecommendations()` is called
- THEN an empty array is returned

---

## MODIFIED Requirements

### Requirement: Mediator FSM State Machine

The EducationalMediator FSM MUST integrate pedagogical-10x components when `enablePedagogical10x` is true.

(Previously: FSM only renders EducationalPanel, TipBadge, and DebriefDialog)

#### Scenario: Pedagogical-10x disabled
- GIVEN `enablePedagogical10x` is `false`
- WHEN the mediator enters `onIntro` state
- THEN only `EducationalPanel` renders (current behavior)

#### Scenario: Pedagogical-10x enabled with intro
- GIVEN `enablePedagogical10x` is `true`
- WHEN the mediator enters `onIntro` state
- THEN `ConceptCard` renders instead of `EducationalPanel` intro text
- AND after dismissal, `WorkedExample` option is available

#### Scenario: Pedagogical-10x enabled with error
- GIVEN `enablePedagogical10x` is `true`
- WHEN the mediator enters `onErrorConstructive` state
- THEN `FormativeFeedback` renders alongside conflict question
- AND feedback tone matches scaffolding level

---

## REMOVED Requirements

None. All existing requirements remain unchanged when `enablePedagogical10x` is `false`.

---

## RENAMED Requirements

None.

---

## Coverage Summary

| Area | Requirements | Scenarios | Happy Path | Edge Cases |
|---|---|---|---|---|
| Explicit Instruction | 3 | 8 | ✅ | ✅ (repeat, persistence, real data) |
| Formative Assessment | 3 | 9 | ✅ | ✅ (no match, withdrawn level, export) |
| Adaptive Content | 3 | 6 | ✅ | ✅ (empty portfolio, withdrawn mode) |
| Mediator Integration | 1 | 3 | ✅ | ✅ (disabled flag) |
| **Total** | **10** | **26** | **✅** | **✅** |
