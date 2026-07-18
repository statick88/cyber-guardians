# Archive: pedagogical-10x

| Field | Value |
|-------|-------|
| Change | pedagogical-10x |
| Status | COMPLETED |
| Date | 2026-07-18 |
| PRs | #2 (merged), #3 (merged) |
| Tests | 64/64 passing |

## Summary

Close three pedagogical gaps — explicit instruction (4→8/10), assessment depth (5→9/10), and adaptability (5→9/10) — by adding 6 components and 3 hooks behind the `enablePedagogical10x` flag on `EducationalMediator`.

## Files Created

- `components/mediator/ConceptCard.tsx` — Concept introduction before activities
- `components/mediator/WorkedExample.tsx` — Step-by-step demonstration per ActivityType
- `components/mediator/FormativeFeedback.tsx` — Inline error feedback with scaffolding-aware tone
- `components/mediator/AdaptiveDifficulty.tsx` — Wrapper applying CSS class modifiers per scaffolding level
- `components/mediator/PortfolioSummary.tsx` — Competency score grid with export button
- `hooks/useExplicitInstruction.ts` — Track introduced activity types, persist to localStorage
- `hooks/usePortfolio.ts` — Aggregate competency scores, persist Portfolio to localStorage
- `hooks/useAdaptivePath.ts` — Recommend next scenarios based on competency gaps

## Files Modified

- `types/educational.ts` — Added RubricCriterion, AssessmentRubric, CompetencyScore, PortfolioEntry, Portfolio, ScaffoldingAdaptation, LearningPathRecommendation types
- `hooks/useScaffolding.ts` — Added `getScaffoldingAdaptation()` pure function
- `components/mediator/EducationalMediator.tsx` — Added `enablePedagogical10x` prop; conditionally renders ConceptCard/FormativeFeedback
- `components/mediator/DebriefDialog.tsx` — Added `open-ended-with-rubric` prompt type with rubric evaluation
- `components/mediator/index.ts` — Exports new components
- `hooks/index.ts` — Exports new hooks

## Tests

- `components/mediator/__tests__/ConceptCard.test.tsx`
- `components/mediator/__tests__/FormativeFeedback.test.tsx`
- `components/mediator/__tests__/DebriefDialog.rubric.test.ts`
- `components/mediator/__tests__/EducationalMediator.pedagogical-10x.test.tsx`
- `hooks/__tests__/useExplicitInstruction.test.ts`
- `hooks/__tests__/usePortfolio.test.ts`
- `hooks/__tests__/useAdaptivePath.test.ts`
