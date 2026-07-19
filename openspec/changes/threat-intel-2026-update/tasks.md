# Tasks: Threat Intelligence 2026 Update

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,670 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | single-pr |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Base | Focused test command | Runtime harness | Rollback boundary |
|------|------|------|----------------------|-----------------|-------------------|
| 1 | Foundation types | feature/threat-intel-2026 | `tsc --noEmit` | N/A — types only | types/module5.ts, types/module6.ts, lib/gameTypes.ts |
| 2 | Module 5 Deepfake Defender | PR 1 branch | `tsc --noEmit` + manual page load | `pnpm build` + browser modulo5 | app/modulo5/, components/module5/, data/module5Data.json |
| 3 | Module 6 Crypto-Scam Shield | PR 2 branch | `tsc --noEmit` + manual page load | `pnpm build` + browser modulo6 | app/modulo6/, components/module6/, data/module6Data.json |
| 4 | Enhancements + Gamification | PR 3 branch | `tsc --noEmit` + full build | `pnpm build` + all modules | module3, module1, HUD, badges changes |

## Phase 1: Foundation Types

- [ ] 1.1 Create `types/module5.ts` — DeepfakeArtifact, DeepfakeScenario, MetadataIndicator types
- [ ] 1.2 Create `types/module6.ts` — QRCodeScam, PyramidScheme, EmploymentScam types
- [ ] 1.3 Extend `lib/gameTypes.ts` — Add Challenge, SocialShare interfaces
- [ ] 1.4 Verify: `tsc --noEmit` passes with new types

## Phase 2: Module 5 — Deepfake Defender

- [ ] 2.1 Create `data/module5Data.json` — Deepfake scenarios with 2026 stats (UNICEF, Mexico reforms)
- [ ] 2.2 Create `components/module5/DeepfakeDetector.tsx` — Visual artifact detection drag-drop minigame
- [ ] 2.3 Create `components/module5/MetadataAnalyzer.tsx` — Extended metadata extraction with AI indicators
- [ ] 2.4 Create `components/module5/ReverseImageSearch.tsx` — Simulated reverse image verification
- [ ] 2.5 Create `components/module5/MicroActivities.tsx` — Deepfake-specific micro activities
- [ ] 2.6 Create `components/module5/index.ts` — Barrel export
- [ ] 2.7 Create `app/modulo5/page.tsx` — Page orchestrator (WELCOME → ACTIVITIES → RESULTS)
- [ ] 2.8 Verify: `tsc --noEmit` passes, `pnpm build` succeeds, page loads in browser

## Phase 3: Module 6 — Crypto-Scam Shield

- [ ] 3.1 Create `data/module6Data.json` — Crypto scam scenarios (pirámides, QR Pix, employment scams)
- [ ] 3.2 Create `components/module6/QRCodeInspector.tsx` — QR code fraud detection minigame
- [ ] 3.3 Create `components/module6/PyramidDetector.tsx` — Trading pyramid scheme identifier
- [ ] 3.4 Create `components/module6/EmploymentScamAlert.tsx` — Task-based scam recognition
- [ ] 3.5 Create `components/module6/MicroActivities.tsx` — Crypto scam micro activities
- [ ] 3.6 Create `components/module6/index.ts` — Barrel export
- [ ] 3.7 Create `app/modulo6/page.tsx` — Page orchestrator (WELCOME → ACTIVITIES → RESULTS)
- [ ] 3.8 Verify: `tsc --noEmit` passes, `pnpm build` succeeds, page loads in browser

## Phase 4: Module Enhancements + Gamification

- [ ] 4.1 Modify `types/module3.ts` — Add FreeFireGroomingScenario type
- [ ] 4.2 Modify `data/module3Data.json` — Add 2026 grooming scenarios (Free Fire + ChatGPT)
- [ ] 4.3 Modify `components/module1/MetadataExtractor.tsx` — Add deepfake detection indicators
- [ ] 4.4 Modify `components/HUDProvider.tsx` — Add challenges state management
- [ ] 4.5 Modify `components/HUD.tsx` — Add challenge progress indicator
- [ ] 4.6 Modify `data/badges.ts` — Add Module 5/6 badges, fix Module 3 badge text
- [ ] 4.7 Modify `components/GraduationDiploma.tsx` — Update module references
- [ ] 4.8 Verify: `tsc --noEmit` passes, `pnpm build` succeeds, all modules load correctly
