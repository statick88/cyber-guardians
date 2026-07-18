# Proposal: Pedagogical 10/10 Enhancement

## Status: COMPLETED

**Completed**: 2026-07-18
**PRs**: #2 (merged), #3 (merged)
**Tests**: 64/64 passing

---

## 1. Problem Statement

CyberGuardians scores 7.25/10 pedagogically. Three critical gaps prevent reaching 10/10:

1. **Explicit Instruction (4/10)**: Students jump into activities without concept introduction or worked examples. The `capaEducativa` data exists in module JSON but isn't surfaced before activities begin.

2. **Assessment Depth (5/10)**: Only closed-response assessment exists. No open-ended questions, no formative feedback during activities, and NotebookPanel reflection data isn't used for learning portfolios.

3. **Adaptability (5/10)**: Scaffolding levels are computed by `useScaffolding.ts` but never used to change content difficulty or learning paths. The system measures struggle but doesn't respond to it.

## 2. Current State

**Architecture**: EducationalMediator (5-state FSM) + EducationalPanel + DebriefDialog + TipBadge + NotebookPanel

**Data Flow**: Module JSON (`capaEducativa`) → EducationalLayer → Mediator FSM → UI components

**Scaffolding**: `determineLevel()` computes level from errorCount/correctStreak, but `getCurrentTip()` only returns generic hints — never adapts activity content.

**Assessment**: DebriefDialog supports slider, micro-decision, and open-reflection prompts. NotebookEntry stores reflections but no portfolio aggregation exists.

## 3. Proposed Solution

### Area 1: Explicit Instruction Layer (+1.5 points)

**New component**: `ConceptCard` — shows before each activity type

- Renders `capaEducativa.scaffoldingTip` as a visual concept introduction
- Shows worked example based on `activityType` (e.g., email analysis walkthrough)
- Uses `conflictQuestion.contradictingEvidence` as teaching material

**New component**: `WorkedExample` — step-by-step demonstration

- Extracted from existing `capaEducativa` data
- Each `ActivityType` gets a worked example template
- Shown once per activity type, skippable

**New hook**: `useExplicitInstruction`

- Tracks which activity types have been introduced
- Returns whether to show ConceptCard for current scenario
- Persists introduction state to localStorage

### Area 2: Formative Assessment System (+1.0 points)

**Enhanced DebriefDialog**: Add open-ended question type with rubric-based evaluation

- New `DebriefPromptType`: `'open-ended-with-rubric'`
- Rubric defined in `capaEducativa.metacognitiveDebrief`
- Simple keyword matching for immediate feedback (not AI grading)

**New component**: `FormativeFeedback` — inline feedback during activities

- Triggered on `onErrorConstructive` state
- Uses `conflictQuestion.expectedInsight` to provide targeted feedback
- Shows progress toward mastery (e.g., "2 of 3 concepts understood")

**New hook**: `usePortfolio`

- Aggregates NotebookEntry data across scenarios
- Computes competency scores from debrief responses
- Stores portfolio in localStorage, exports as JSON

### Area 3: Adaptive Content System (+0.5 points)

**Enhanced useScaffolding**: Use level to modify content presentation

- `explicit` level: Show additional hints, simplify options, slow down
- `guided` level: Show fewer hints, standard difficulty
- `implicit` level: Remove hints, increase complexity
- `withdrawn` level: Challenge mode, no assistance

**New component**: `AdaptiveDifficulty` — wraps activity content

- Reads scaffolding level from context
- Adjusts visible options, time limits, or hint availability
- No content changes — only presentation adaptation

**New hook**: `useAdaptivePath`

- Tracks performance across scenarios
- Suggests next scenario based on competency gaps
- Provides personalized learning path recommendations

## 4. Scope

### 4.1 In Scope

- ConceptCard component for explicit instruction
- WorkedExample component with activity-type templates
- useExplicitInstruction hook for introduction tracking
- Enhanced DebriefDialog with open-ended-with-rubric type
- FormativeFeedback component for inline assessment
- usePortfolio hook for competency aggregation
- AdaptiveDifficulty wrapper component
- Enhanced useScaffolding with level-based content adaptation
- useAdaptivePath hook for learning path recommendations
- Integration with existing EducationalMediator FSM
- Feature flag: `NEXT_PUBLIC_EDUCATIONAL_MEDIATOR` (existing)

### 4.2 Out of Scope

- **Collaborative Learning**: Multiplayer, peer discussion, social learning (high-effort, separate change)
- **AI-powered assessment**: LLM-based essay grading (future consideration)
- **Real-time collaboration**: Shared notebooks, team challenges (future consideration)
- **Backend persistence**: Server-side portfolio storage (uses localStorage)
- **Content authoring tools**: GUI for creating worked examples (content in JSON)

## 5. User Stories

### Explicit Instruction

**US-1**: As a student, I want to see a concept introduction before starting an activity so that I understand what I'm about to learn.
- **Acceptance**: ConceptCard appears on first encounter with each ActivityType
- **Acceptance**: Card shows key concepts from capaEducativa data
- **Acceptance**: Student can dismiss or skip

**US-2**: As a student, I want to see a worked example of the activity so that I know what success looks like.
- **Acceptance**: WorkedExample shows step-by-step walkthrough
- **Acceptance**: Example uses real data from module JSON
- **Acceptance**: Example is skippable after first view

### Formative Assessment

**US-3**: As a student, I want to answer open-ended questions during activities so that I can demonstrate deeper understanding.
- **Acceptance**: Open-ended prompts appear in DebriefDialog
- **Acceptance**: Rubric-based feedback is provided immediately
- **Acceptance**: Responses are stored in NotebookEntry

**US-4**: As a student, I want to see my learning portfolio so that I can track my progress across modules.
- **Acceptance**: Portfolio shows competency scores per module
- **Acceptance**: Portfolio aggregates reflection data
- **Acceptance**: Portfolio can be exported as JSON

### Adaptive Content

**US-5**: As a student, I want the difficulty to adapt to my performance so that I'm neither bored nor overwhelmed.
- **Acceptance**: Scaffolding level changes visible hints/complexity
- **Acceptance**: Adaptation is based on errorCount/correctStreak
- **Acceptance**: Adaptation is transparent (student sees difficulty indicator)

**US-6**: As a student, I want personalized learning path recommendations so that I focus on my weak areas.
- **Acceptance**: System suggests next scenario based on competency gaps
- **Acceptance**: Recommendations update after each debrief
- **Acceptance**: Student can accept or ignore recommendations

## 6. Acceptance Criteria

### Pedagogical Score Targets

| Dimension | Current | Target | How Measured |
|-----------|---------|--------|--------------|
| Explicit Instruction | 4/10 | 8/10 | ConceptCard + WorkedExample present for all ActivityTypes |
| Assessment Depth | 5/10 | 9/10 | Open-ended questions + rubric feedback + portfolio |
| Adaptability | 5/10 | 9/10 | Scaffolding level affects content presentation |
| Collaborative | 3/10 | 3/10 | Deferred (out of scope) |

### Technical Acceptance

- [ ] All new components have TypeScript types (zero `any`)
- [ ] Feature-gated behind `NEXT_PUBLIC_EDUCATIONAL_MEDIATOR`
- [ ] localStorage persistence for portfolio data
- [ ] All existing tests pass
- [ ] New components have unit tests
- [ ] Bundle size increase < 15KB gzipped

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cognitive overload from too much instruction | Med | High | Limit ConceptCard to first encounter; make all introductions skippable |
| Rubric-based feedback feels robotic | Med | Med | Use empathetic language; allow "skip feedback" option |
| Adaptation feels unpredictable | Low | High | Show difficulty indicator; explain why content changed |
| localStorage quota exceeded | Low | Med | Implement cleanup policy; cap portfolio size |
| Breaking existing mediator flow | Low | High | Integration tests; feature flag fallback |

## 8. Dependencies

### Internal Dependencies

1. **capaEducativa data completeness** — All module JSON files must have complete `capaEducativa` sections
2. **Existing mediator FSM** — New states must integrate with current state machine
3. **NotebookEntry structure** — Portfolio hook depends on existing reflection storage

### External Dependencies

1. **Framer Motion** — Already used for animations (no new dependency)
2. **React 18** — Already in use (no new dependency)

### Prerequisite Work

1. Audit `capaEducativa` data across all modules for completeness
2. Define rubric templates for each `CompetencyTag`
3. Design difficulty adaptation rules for each `ActivityType`

## 9. Effort Estimation

| Area | Components | Estimation | Priority |
|------|------------|------------|----------|
| Explicit Instruction | ConceptCard, WorkedExample, useExplicitInstruction | 3-4 days | P0 |
| Formative Assessment | Enhanced DebriefDialog, FormativeFeedback, usePortfolio | 4-5 days | P0 |
| Adaptive Content | AdaptiveDifficulty, enhanced useScaffolding, useAdaptivePath | 2-3 days | P1 |
| Integration & Testing | FSM integration, tests, documentation | 2-3 days | P0 |
| **Total** | | **11-15 days** | |

## 10. Success Metrics

### Quantitative

- Pedagogical score: 7.25 → 9.0+ (target 10/10)
- Activity completion rate: baseline → +15%
- Debrief completion rate: baseline → +20%
- Portfolio export rate: 0% → 30% of students

### Qualitative

- Students report "I understood what I was learning before starting" (80%+)
- Students report "The difficulty adjusted to my level" (70%+)
- Students report "I could see my progress across modules" (75%+)

### Technical

- Zero `any` types in new code
- 100% feature-flagged (no behavior change when disabled)
- Bundle size increase < 15KB gzipped
- All existing tests pass
