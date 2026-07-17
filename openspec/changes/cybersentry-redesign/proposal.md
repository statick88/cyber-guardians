# Proposal: Module 3 CyberSentry Redesign

## Intent
Transform Module 3 from "Deepfakes/Vishing/Disinformation" to "CyberSentry — Escudo contra Engaños y Mafias Digitales" focusing on criminal recruitment, money muling, cyber-extortion, and psychological manipulation targeting adolescents 14-20.

## Scope

### In Scope
- New Module 3 theme: CyberSentry (criminal recruitment, money muling, cyber-extortion, psychological manipulation)
- Updated types/module3.ts with new scenario structures
- Updated data/module3Data.json with new content
- Updated components to reflect new themes while maintaining shared component patterns

### Out of Scope
- Changes to shared components (WelcomeScreen, GameProgress, ResultsScreen)
- Changes to other modules
- Backend/database changes

## Capabilities

### New Capabilities
- `criminal-recruitment-detection`: Recognizing recruitment patterns in gaming/Discord
- `money-mule-identification`: Identifying money mule schemes via social platforms
- `cyber-extortion-response`: Handling sextortion and cyber-extortion attempts
- `psychological-manipulation-awareness`: Recognizing grooming and manipulation tactics

### Modified Capabilities
- None (complete replacement of Module 3 content)

## Approach
1. Redesign types/module3.ts with new scenario structures
2. Create new data/module3Data.json with CyberSentry content
3. Update components to use new types while maintaining scoring and game flow

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `types/module3.ts` | Modified | New type definitions for CyberSentry scenarios |
| `data/module3Data.json` | Modified | New content for 4 activity categories |
| `components/module3/*` | Modified | Updated to use new types and scenarios |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking shared component compatibility | Low | Keep existing scoring pattern (200 points, 70% threshold) |
| Content sensitivity for 14-20 age group | Medium | Review content for age-appropriateness |

## Rollback Plan
Restore from version control before changes

## Dependencies
- None

## Success Criteria
- [ ] Module 3 displays new CyberSentry theme
- [ ] All 4 activities function correctly
- [ ] Scoring system works (200 points total, 70% threshold)
- [ ] Shared components remain compatible