# Design: Module 3 CyberSentry Redesign

## Technical Approach
Replace Module 3 content with CyberSentry theme while maintaining the existing architecture pattern: 5 activities, GameProgress state management, scoring system (200 points, 70% threshold), and shared component compatibility.

## Architecture Decisions

### Decision: Maintain existing activity structure
**Choice**: Keep 4 themed activities + defense scenario pattern
**Alternatives considered**: Reduce to 3 activities, add more activities
**Rationale**: Matches existing page.tsx flow and scoring logic

### Decision: Reuse existing component patterns
**Choice**: Keep same component props interface (cases, scenarios, onScore, onComplete)
**Alternatives considered**: Create new component API
**Rationale**: Minimizes changes to page.tsx and shared components

## Data Flow

```
modulo3/page.tsx (GameProgress state)
    │
    ├─→ Activity 1: CriminalRecruitmentDetector (cases array)
    │       └─→ onScore(points, category)
    │
    ├─→ Activity 2: MoneyMuleIdentifier (scenarios array)
    │       └─→ onScore(points, category)
    │
    ├─→ Activity 3: CyberExtortionResponse (cases array)
    │       └─→ onScore(points, category)
    │
    ├─→ Activity 4: PsychologicalManipulation (scenarios array)
    │       └─→ onScore(points, category)
    │
    └─→ Activity 5: DefenseScenario (defense items)
            └─→ onScore(points, category)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `types/module3.ts` | Modify | New type definitions for CyberSentry scenarios |
| `data/module3Data.json` | Modify | New content for 4 activity categories |
| `components/module3/CriminalRecruitmentDetector.tsx` | Create | New component for recruitment detection |
| `components/module3/MoneyMuleIdentifier.tsx` | Create | New component for money mule identification |
| `components/module3/CyberExtortionResponse.tsx` | Create | New component for extortion response |
| `components/module3/PsychologicalManipulation.tsx` | Create | New component for manipulation awareness |
| `app/modulo3/page.tsx` | Modify | Update to use new component names |

## Interfaces / Contracts

```typescript
// types/module3.ts - New types
interface CriminalRecruitmentCase {
  id: string
  platform: 'gaming' | 'discord' | 'social'
  scenario: string
  redFlags: string[]
  correctResponse: string
}

interface MoneyMuleScenario {
  id: string
  platform: 'tiktok' | 'telegram' | 'whatsapp'
  scenario: string
  warningSigns: string[]
  correctAction: string
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Component rendering | Manual testing |
| Integration | Scoring system | Verify 200 points, 70% threshold |
| E2E | Full activity flow | Test all 5 activities |

## Migration / Rollout
No migration required - direct replacement of content.

## Open Questions
- [ ] Confirm exact point distribution across 5 activities
- [ ] Verify age-appropriate language for 14-20 audience