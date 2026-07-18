# Design: Pedagogical 10x Enhancement

## Technical Approach

Close three pedagogical gaps (explicit instruction, assessment depth, adaptability) by extending the existing EducationalMediator FSM with 6 new components, 3 new hooks, and type additions to `types/educational.ts`. All new features are behind the existing `NEXT_PUBLIC_EDUCATIONAL_MEDIATOR` flag via a new `enablePedagogical10x` prop on `EducationalMediator`. When disabled, behavior is identical to current.

Follows the established pattern: `useReducer` with discriminated unions, `glass-card neon-border` styling, framer-motion animations, localStorage persistence with SSR guards.

## Architecture Decisions

| Decision | Option A | Option B | Decision |
|----------|----------|----------|----------|
| Rubric evaluation | Keyword matching | LLM-based grading | **Keyword matching** — zero latency, no API dependency, deterministic |
| Portfolio storage | localStorage | IndexedDB | **localStorage** — consistent with existing pattern (NotebookEntry, mediator debrief) |
| Adaptive content | Modify activity data | CSS/class modifiers only | **CSS modifiers** — spec says "no content changes, only presentation" |
| Learning path | Dynamic scenario generation | Static recommendation list | **Static list** — deterministic, no AI dependency, predictable |
| Competency tags | Reuse existing CompetencyTag | New tag set per activity type | **New tag set** — existing tags are pedagogy-focused (metacognitive_regulation); new tags are skill-focused (email-analysis) |

## Component Architecture

```
EducationalMediator (modified)
├── ConceptCard          ← renders on onIntro when enablePedagogical10x
│   └── WorkedExample    ← shown via "Ver ejemplo" button
├── FormativeFeedback    ← renders on onErrorConstructive when scaffolding is explicit/guided
├── AdaptiveDifficulty   ← wraps activity content, applies CSS modifiers
├── PortfolioSummary     ← renders in results phase, reads from usePortfolio
└── DebriefDialog        ← enhanced with open-ended-with-rubric prompt type
    └── OpenEndedAssessment ← textarea + rubric evaluation (inline in DebriefDialog)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `types/educational.ts` | Modify | Add `open-ended-with-rubric` to DebriefPromptType; add RubricCriterion, AssessmentRubric, CompetencyScore, PortfolioEntry, Portfolio, ScaffoldingAdaptation, LearningPathRecommendation types |
| `hooks/useScaffolding.ts` | Modify | Add `getScaffoldingAdaptation(level): ScaffoldingAdaptation` pure function |
| `hooks/useExplicitInstruction.ts` | Create | Track introduced activity types + viewed examples, persist to localStorage |
| `hooks/usePortfolio.ts` | Create | Aggregate competency scores, persist Portfolio to localStorage, export JSON |
| `hooks/useAdaptivePath.ts` | Create | Read portfolio, compute competency gaps, return recommendations |
| `components/mediator/ConceptCard.tsx` | Create | Concept intro before activity, renders conflictQuestion data |
| `components/mediator/WorkedExample.tsx` | Create | Step-by-step walkthrough with hardcoded templates per ActivityType |
| `components/mediator/FormativeFeedback.tsx` | Create | Inline error feedback with scaffolding-aware tone |
| `components/mediator/AdaptiveDifficulty.tsx` | Create | Wrapper applying CSS class modifiers based on scaffolding level |
| `components/mediator/PortfolioSummary.tsx` | Create | Competency score grid with export button |
| `components/mediator/EducationalMediator.tsx` | Modify | Add `enablePedagogical10x` prop; conditionally render ConceptCard/FormativeFeedback |
| `components/mediator/DebriefDialog.tsx` | Modify | Add `rubrics` prop; handle `open-ended-with-rubric` prompt type |

## Interfaces / Contracts

```typescript
// New types in types/educational.ts

export type DebriefPromptType =
  | 'slider' | 'micro-decision' | 'open-reflection'
  | 'open-ended-with-rubric'  // NEW

export interface RubricCriterion {
  keyword: string
  points: number
  feedback: string
}

export interface AssessmentRubric {
  criteria: RubricCriterion[]
  maxScore: number
  feedbackTemplate: string
}

export type CompetencyTag =
  | 'email-analysis' | 'url-inspection' | 'phishing-sim'
  | 'digital-defense' | 'metadata-extraction' | 'cookie-sweeping'

export interface CompetencyScore {
  tag: CompetencyTag
  score: number        // 0–100
  attempts: number
  lastUpdated: number
}

export interface PortfolioEntry {
  scenarioId: string
  moduleName: string
  competencyTag: CompetencyTag
  responses: Record<string, unknown>
  rubricScore?: number
  timestamp: number
}

export interface Portfolio {
  competencies: Record<CompetencyTag, CompetencyScore>
  entries: PortfolioEntry[]
  lastExported?: number
}

export interface ScaffoldingAdaptation {
  level: ScaffoldingLevel
  showExtraHints: boolean
  simplifyOptions: boolean
  showDifficultyIndicator: boolean
  challengeMode: boolean
}

export interface LearningPathRecommendation {
  scenarioId: string
  reason: string
  targetCompetency: CompetencyTag
  priority: number  // 1 (highest) – 5
}
```

## Data Flow

```
Module Game Loop                    Pedagogical-10x Layer
──────────────                      ──────────────────────
EducationalMediator                 useExplicitInstruction
  │                                     │
  ├─ triggerMediator('onIntro') ────► shouldShow(activityType)?
  │                                     │
  │   ┌─ ConceptCard renders ◄───── yes │
  │   │   "Ver ejemplo" click          │
  │   │   └─► WorkedExample            │
  │   │   "Comenzar" click             │
  │   └─► markIntroduced()             │
  │                                     │
  ├─ triggerMediator('onError') ────► FormativeFeedback
  │                                     │ (tone from scaffoldingLevel)
  │                                     │
  ├─ triggerMediator('onModuleComplete')
  │                                     │
  │   DebriefDialog                    │
  │   └─ open-ended-with-rubric        │
  │       └─► rubric evaluation        │
  │                                     │
  │   onDebriefComplete ────────────► usePortfolio.addEntry
  │                                     │
  │   useAdaptivePath ◄──────────── usePortfolio (competencies)
  │   └─ getRecommendations()          │
  │                                     │
  └─ AdaptiveDifficulty                │
      └─ wraps activity content        │
          (CSS modifiers only)         │
```

## Enhanced Mediator Flow

```
idle ──module start──► onIntro
                         │
                    ConceptCard (10x)
                         │
                    WorkedExample (optional)
                         │
                    dismiss ──► idle
                         │
onTipRequested ◄── hint request
                         │
                    dismiss ──► idle
                         │
onErrorConstructive ◄── error
                         │
                    FormativeFeedback (10x)
                         │
                    answer ──► idle
                         │
onMetaReflection ◄── module complete
                         │
                    DebriefDialog + rubrics (10x)
                         │
                    usePortfolio.addEntry (10x)
                         │
                    useAdaptivePath.update (10x)
                         │
                    completeDebrief ──► idle
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `getScaffoldingAdaptation` returns correct flags per level | Pure function, 4 assertions |
| Unit | `useExplicitInstruction` localStorage persistence | Render hook, verify set/get/reset |
| Unit | `usePortfolio` score computation | Mock entries, verify competency averaging |
| Unit | `useAdaptivePath` recommendation ordering | Mock portfolio, verify weakest-first |
| Unit | Rubric keyword matching in DebriefDialog | Mock rubric, verify score/feedback |
| Integration | ConceptCard shown only on first encounter | Render with hook, verify conditional |
| Integration | EducationalMediator 10x prop gates all new components | Render with flag on/off |
| E2E | Full activity flow: ConceptCard → activity → debrief → portfolio | Playwright scenario |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

**Phase 1** (types): Add new types to `types/educational.ts`. All fields optional — zero breaking changes.

**Phase 2** (hooks): Create 3 new hooks + `getScaffoldingAdaptation`. Pure additions, no existing code modified.

**Phase 3** (components): Create 6 new components. Feature-gated — no rendering until Phase 4.

**Phase 4** (integration): Add `enablePedagogical10x` prop to `EducationalMediator`. Default `false`. Components render only when `true`.

**Phase 5** (enhancement): Add `open-ended-with-rubric` to `DebriefDialog`. Add `rubrics` prop.

**Rollback**: Set `enablePedagogical10x={false}` or `NEXT_PUBLIC_EDUCATIONAL_MEDIATOR=false`. All 10x features disappear; existing mediator unchanged.

## Open Questions

- [ ] Should ConceptCard use the `conflictQuestion.followUp` as subtitle, or reserve it for WorkedExample?
- [ ] How should `usePortfolio` handle competency tag mapping when a scenario touches multiple competencies?
- [ ] Should `AdaptiveDifficulty` modify the DOM (opacity, class) or just render a wrapper div with a badge?
