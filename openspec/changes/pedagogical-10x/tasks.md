# Tasks: Pedagogical 10x Enhancement

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 750–900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Types + scaffolding adaptation | PR 1 (~130 lines) | `npx tsc --noEmit` | N/A — pure types and pure function | Revert `types/educational.ts` and `hooks/useScaffolding.ts` |
| 2 | useExplicitInstruction + ConceptCard + WorkedExample | PR 2 (~340 lines) | `npx vitest run useExplicitInstruction` | Render ConceptCard with mock EducationalLayer | Remove `hooks/useExplicitInstruction.ts`, `ConceptCard.tsx`, `WorkedExample.tsx` |
| 3 | usePortfolio + useAdaptivePath + FormativeFeedback + DebriefDialog enhancement | PR 3 (~350 lines) | `npx vitest run usePortfolio` | Mock debrief responses, verify localStorage | Remove `hooks/usePortfolio.ts`, `hooks/useAdaptivePath.ts`, `FormativeFeedback.tsx`; revert `DebriefDialog.tsx` |
| 4 | AdaptiveDifficulty + EducationalMediator integration | PR 4 (~200 lines) | `npx vitest run EducationalMediator` | Render mediator with `enablePedagogical10x={true}` | Revert `EducationalMediator.tsx`, remove `AdaptiveDifficulty.tsx` |
| 5 | PortfolioSummary + index exports | PR 5 (~100 lines) | `npx vitest run PortfolioSummary` | Render with mock portfolio data | Remove `PortfolioSummary.tsx`, revert `index.ts` |

## Phase 1: Type Definitions

- [x] 1.1 **S** Add `open-ended-with-rubric` to `DebriefPromptType` union in `types/educational.ts`
- [x] 1.2 **S** Add `RubricCriterion` interface (keyword, points, feedback) to `types/educational.ts`
- [x] 1.3 **S** Add `AssessmentRubric` interface (criteria, maxScore, feedbackTemplate) to `types/educational.ts`
- [x] 1.4 **S** Add skill-focused `CompetencyTag` type alias (email-analysis, url-inspection, etc.) — separate from existing pedagogy-focused CompetencyTag; consider name `SkillCompetencyTag` to avoid collision
- [x] 1.5 **S** Add `CompetencyScore` interface (tag, score, attempts, lastUpdated) to `types/educational.ts`
- [x] 1.6 **S** Add `PortfolioEntry` interface (scenarioId, moduleName, competencyTag, responses, rubricScore?, timestamp) to `types/educational.ts`
- [x] 1.7 **S** Add `Portfolio` interface (competencies, entries, lastExported?) to `types/educational.ts`
- [x] 1.8 **S** Add `ScaffoldingAdaptation` interface (level, showExtraHints, simplifyOptions, showDifficultyIndicator, challengeMode) to `types/educational.ts`
- [x] 1.9 **S** Add `LearningPathRecommendation` interface (scenarioId, reason, targetCompetency, priority) to `types/educational.ts`
- [x] 1.10 **S** Add `rubrics?: Record<string, AssessmentRubric>` to `DebriefDialogProps` in `types/educational.ts`
- [x] 1.11 **S** Add `enablePedagogical10x?: boolean` to `EducationalMediatorProps` in `types/educational.ts`

## Phase 2: Scaffolding Adaptation

- [x] 2.1 **S** Add `getScaffoldingAdaptation(level: ScaffoldingLevel): ScaffoldingAdaptation` pure function to `hooks/useScaffolding.ts`
- [x] 2.2 **S** Verify level→flags mapping matches spec: explicit=(true,true,true,false), guided=(false,false,true,false), implicit=(false,false,false,false), withdrawn=(false,false,false,true)

## Phase 3: Explicit Instruction (PR 2)

- [x] 3.1 **M** Create `hooks/useExplicitInstruction.ts` — `shouldShow(activityType)`, `markIntroduced(activityType)`, `hasViewedExample(activityType)`, `markExampleViewed(activityType)`, `resetAll()` with localStorage persistence under `cg_introduced_types` and `cg_viewed_examples`; SSR guard
- [x] 3.2 **M** Create `components/mediator/ConceptCard.tsx` — renders `educationalLayer.conflictQuestion.question` as title, `followUp` as context, `contradictingEvidence` as teaching material; "Ver ejemplo" + "Comenzar" buttons; framer-motion entry/exit; glass-card neon-border styling
- [x] 3.3 **L** Create `components/mediator/WorkedExample.tsx` — `WorkedExampleTemplate` type with 3–5 steps per ActivityType; hardcoded templates for email_analysis, url_inspection, phishing_scenario, digital-defense; step navigation (Siguiente/Anterior); "Entendido" dismiss; progress indicator
- [x] 3.4 **S** Create worked example template data map: `Record<ActivityType, WorkedExampleTemplate>` with real capaEducativa-derived content for at least 4 activity types
- [ ] 3.5 **S** Unit test: `useExplicitInstruction` — verify localStorage round-trip, SSR returns true for all, resetAll clears state
- [ ] 3.6 **S** Unit test: `ConceptCard` — renders question, shows buttons, calls onDismiss/onViewExample

## Phase 4: Formative Assessment (PR 3)

- [ ] 4.1 **M** Create `hooks/usePortfolio.ts` — `portfolio` state, `addEntry(entry)`, `getCompetencyScore(tag)`, `getAllScores()`, `exportJSON()`, `clearPortfolio()`; localStorage persistence under `cg_portfolio`; SSR guard; cap entries at 200
- [ ] 4.2 **M** Create `hooks/useAdaptivePath.ts` — `getRecommendations(count?)`, `updateAfterScenario(tag, score)`, `getWeakestCompetency()`; reads from `usePortfolio`; deterministic ordering by competency gap
- [ ] 4.3 **M** Create `components/mediator/FormativeFeedback.tsx` — renders `conflictQuestion.expectedInsight`; tone adapts per scaffoldingLevel (explicit: "Recuerda que...", guided: "Piensa en...", implicit: "Observa...", withdrawn: no render); mastery progress display; auto-dismiss 10s
- [ ] 4.4 **M** Enhance `components/mediator/DebriefDialog.tsx` — add `rubrics` prop; handle `open-ended-with-rubric` prompt type: render textarea, evaluate keyword matching on submit, show per-criterion feedback, show score/maxScore
- [ ] 4.5 **S** Unit test: `usePortfolio` — verify score computation (rubric average or selfAssessment fallback), entry cap at 200, exportJSON includes lastExported
- [ ] 4.6 **S** Unit test: `useAdaptivePath` — verify weakest-first ordering, empty portfolio returns empty array, updateAfterScenario triggers recomputation
- [ ] 4.7 **S** Unit test: DebriefDialog rubric evaluation — mock rubric with 2 criteria, verify matched criteria award points, unmatched shows feedbackTemplate

## Phase 5: Adaptive Content + Integration (PR 4)

- [x] 5.1 **M** Create `components/mediator/AdaptiveDifficulty.tsx` — reads `getScaffoldingAdaptation(level)`, applies CSS class modifiers (opacity-90 for explicit), renders difficulty indicator badges ("💡 Modo guiado", "📊 Dificultad adaptativa", "🏆 Modo desafío"), wraps children
- [x] 5.2 **M** Modify `components/mediator/EducationalMediator.tsx` — add `enablePedagogical10x` prop (default false); conditionally render ConceptCard on `onIntro` state; conditionally render FormativeFeedback on `onErrorConstructive` state; integrate usePortfolio.addEntry and useAdaptivePath.updateAfterScenario on debrief complete
- [x] 5.3 **S** Verify `enablePedagogical10x={false}` produces identical behavior to current mediator (no regressions)
- [ ] 5.4 **S** Unit test: EducationalMediator with 10x enabled renders ConceptCard on onIntro
- [ ] 5.5 **S** Unit test: EducationalMediator with 10x disabled does NOT render ConceptCard

## Phase 6: Portfolio UI + Cleanup (PR 5)

- [ ] 6.1 **M** Create `components/mediator/PortfolioSummary.tsx` — competency score grid (tag, score, attempts), export button calling `usePortfolio.exportJSON()`, glass-card styling
- [ ] 6.2 **S** Update `components/mediator/index.ts` to export ConceptCard, WorkedExample, FormativeFeedback, AdaptiveDifficulty, PortfolioSummary
- [ ] 6.3 **S** Update `hooks/index.ts` to export useExplicitInstruction, usePortfolio, useAdaptivePath
- [ ] 6.4 **S** Verify TypeScript compiles with zero `any` types in all new code

## Dependency Map

```
Phase 1 (Types) ──────────────────────────────────┐
Phase 2 (Scaffolding) ────────────────────────────┤
                                                    ├──► Phase 3 (Explicit Instruction)
                                                    │
                                                    ├──► Phase 4 (Formative Assessment)
                                                    │         │
                                                    │         ▼
                                                    │    Phase 5 (Adaptive + Integration)
                                                    │         │
                                                    │         ▼
                                                    └──► Phase 6 (Portfolio UI + Cleanup)
```

- **Phase 1+2** must complete first (types and pure function)
- **Phase 3** depends on Phase 1 (uses new types)
- **Phase 4** depends on Phase 1 (uses new types)
- **Phase 5** depends on Phase 2, 3, and 4 (integrates all components)
- **Phase 6** depends on Phase 4 (PortfolioSummary uses usePortfolio)

## Critical Path

```
Phase 1 → Phase 3 → Phase 5 → Phase 6
                ↘
Phase 2 → Phase 4 ↗
```

**Critical path**: Phase 1 → Phase 3 (explicit instruction) → Phase 5 (integration) → Phase 6 (portfolio UI)

**Parallelizable**: Phase 2 (scaffolding) can run alongside Phase 3. Phase 4 can start as soon as Phase 1 completes (portfolio hooks don't need explicit instruction components).

## Implementation Order

1. **PR 1**: Types + scaffolding adaptation (Phase 1 + 2) — foundation for everything
2. **PR 2**: Explicit instruction (Phase 3) — useExplicitInstruction, ConceptCard, WorkedExample
3. **PR 3**: Formative assessment (Phase 4) — usePortfolio, useAdaptivePath, FormativeFeedback, DebriefDialog enhancement
4. **PR 4**: Adaptive content + integration (Phase 5) — AdaptiveDifficulty, EducationalMediator modification
5. **PR 5**: Portfolio UI + cleanup (Phase 6) — PortfolioSummary, exports, verification

## PR Descriptions

### PR 1: Add pedagogical-10x type definitions and scaffolding adaptation
- Adds ~8 new interfaces/types to `types/educational.ts`
- Adds `getScaffoldingAdaptation` pure function to `hooks/useScaffolding.ts`
- Zero behavioral changes — all additions are backward-compatible
- Verification: `npx tsc --noEmit` passes

### PR 2: Add explicit instruction layer (ConceptCard + WorkedExample)
- New hook: `useExplicitInstruction` with localStorage persistence
- New component: `ConceptCard` for concept introduction before activities
- New component: `WorkedExample` with step-by-step templates per ActivityType
- Not yet integrated into mediator (feature-gated behind Phase 5)
- Verification: render ConceptCard with mock data, navigate WorkedExample steps

### PR 3: Add formative assessment system (Portfolio + Feedback + Rubrics)
- New hook: `usePortfolio` with competency score aggregation and JSON export
- New hook: `useAdaptivePath` with competency-gap-based recommendations
- New component: `FormativeFeedback` with scaffolding-aware tone
- Enhanced: `DebriefDialog` with `open-ended-with-rubric` prompt type
- Verification: portfolio round-trips through localStorage, rubric evaluation matches criteria

### PR 4: Add adaptive content and mediator integration
- New component: `AdaptiveDifficulty` wrapper with CSS class modifiers
- Modified: `EducationalMediator` with `enablePedagogical10x` prop
- All 10x features now render when prop is true
- Verification: mediator renders correctly with flag on and off

### PR 5: Add portfolio summary UI and finalize exports
- New component: `PortfolioSummary` with competency grid and export button
- Updated barrel exports in `components/mediator/index.ts` and `hooks/index.ts`
- Final TypeScript verification (zero `any` types)
- Verification: full TypeScript compilation, all existing tests pass
