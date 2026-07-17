# Tasks: CyberSentry Module 3 Redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 400-600 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Types + Data → PR 2: Components → PR 3: Page Integration |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Types + Data | PR 1 | TypeScript compilation | N/A - no runtime | types/module3.ts, data/module3Data.json |
| 2 | Components | PR 2 | Component rendering | Manual UI testing | components/module3/* |
| 3 | Page Integration | PR 3 | Full activity flow | Manual testing | app/modulo3/page.tsx |

## Phase 1: Types and Data

- [ ] 1.1 Create new types in `types/module3.ts` (CriminalRecruitmentCase, MoneyMuleScenario, CyberExtortionCase, PsychologicalManipulationScenario)
- [ ] 1.2 Update `data/module3Data.json` with new categories and scenarios
- [ ] 1.3 Verify TypeScript compilation passes

## Phase 2: Components

- [ ] 2.1 Create `components/module3/CriminalRecruitmentDetector.tsx` with props interface
- [ ] 2.2 Create `components/module3/MoneyMuleIdentifier.tsx` with props interface
- [ ] 2.3 Create `components/module3/CyberExtortionResponse.tsx` with props interface
- [ ] 2.4 Create `components/module3/PsychologicalManipulation.tsx` with props interface

## Phase 3: Page Integration

- [ ] 3.1 Update `app/modulo3/page.tsx` to import new components
- [ ] 3.2 Update activity flow to use new component names
- [ ] 3.3 Verify scoring system works (200 points total, 70% threshold)
- [ ] 3.4 Test complete activity flow end-to-end

## Phase 4: Verification

- [ ] 4.1 Manual testing of all 5 activities
- [ ] 4.2 Verify shared component compatibility (WelcomeScreen, GameProgress, ResultsScreen)
- [ ] 4.3 Verify storage key `cg_2026_module3` works correctly