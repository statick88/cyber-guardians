# Educational Mediator Integration — Proposal

## Change Name
`educational-mediator`

## Intent
Transform CyberGuardians from a punitive error model ("wrong answer = shield damage") to a constructive learning mediation system grounded in Vygotsky's Zone of Proximal Development and metacognitive theory. The console AI becomes an active pedagogical mediator that scaffolds learning, transforms errors into cognitive conflict moments, and promotes self-regulated learning through structured reflection.

## Motivation

### Pedagogical Gap
- **Current state**: Only post-answer explanations (`explicacion` fields) exist — no pre-answer scaffolding, no error mediation, no metacognitive reflection
- **Problem**: Shield damage on wrong answers creates anxiety without learning opportunity; errors are punitive, not constructive
- **Research basis**: Game-Based Learning (GBL) literature shows that immediate constructive feedback during errors significantly improves retention and transfer (Hunsucker et al., 2018; Plass et al., 2020)
- **Target audience**: 14–20 year olds who need scaffolded support but increasingly demand autonomy

### Learning Science Principles to Implement
1. **Constructive Error Model**: Errors become "Tactical Security Reflection" moments — pause action, mediate understanding, offer reflective second chance
2. **Metacognitive Closure**: Pre-results "Operator Logbook" micro-activity for self-evaluation and strategy summarization
3. **Dynamic Scaffolding**: Explicit "Holographic Visual Guides" that withdraw organically as learner progresses

## Scope

### In Scope
1. **EducationalMediator Component** — shared mediator injected as "Holographic Network Assistant" in tactical sidebar
   - States: `onIntro`, `onTipRequested`, `onErrorConstructive`, `onMetaReflection`
   - Displays cognitive conflict questions, scaffolding hints, metacognitive prompts
   - Never gives answers directly — uses Socratic questioning

2. **Data Refactoring** — enrich `data/module*.json` with pedagogical layers
   - Transform flat `"explanation"` into structured didactic objects
   - Add `conflictQuestion` (cognitive conflict), `scaffoldingTip` (ZPD hint), `metacognitiveDebrief` (reflection prompt)

3. **TypeScript Interfaces** — `types/educational.ts` with strict types
   - `MediatorState`, `CognitiveConflict`, `DebriefSchema`, `ScaffoldingLevel`
   - Zero `any` types

4. **Minigame Redesigns**:
   - **URLInspector & EmailDeconstructor**: Right column becomes "Pedagogical Mediation Notebook" with inductive questions
   - **PhoneticDecoder (Vishing)**: "Emotional Regulation" module with panic bar linked to conversational decisions

5. **Shield Damage Integration** — `onShieldDamage` triggers mediator pause panel before HP reduction

### Out of Scope
- Adaptive difficulty system (future enhancement)
- Server-side analytics of mediator interactions
- New modules beyond 0–4
- English/Spanish bilingual support (Spanish only for UI)
- Real-time AI/LLM integration (all mediator content is pre-authored)
- Student progress tracking for mediator usage

## Capabilities

### New Capabilities
- `educational-mediator`: Core mediator component with state machine (intro, tip, error, reflection)
- `pedagogical-data-schema`: Enriched data structures for didactic content layers
- `metacognitive-debrief`: Pre-results self-evaluation micro-activity
- `scaffolding-system`: Dynamic hint withdrawal based on learner progress

### Modified Capabilities
- `module1-scenarios`: Add `conflictQuestion`, `scaffoldingTip` to URL/email scenarios
- `module2-scenarios`: Add vishing emotional regulation data and mediator integration
- `module3-scenarios`: Add chat/mule scenario mediator hooks
- `module4-scenarios`: Add crypto/firewall scenario mediator hooks
- `shield-damage-flow`: Integrate mediator pause before HP reduction
- `results-screen`: Add metacognitive debrief before final results

## Approach

### Phase 0: Educational Types & Data Schema (~350 lines)
**Files created/modified:**
- `types/educational.ts` — new file with all mediator types
- `data/module1Data.json` — enrich with pedagogical layers (sample: 3 scenarios)
- `data/module2Data.json` — enrich with pedagogical layers (sample: 3 scenarios)
- `data/module3Data.json` — enrich with pedagogical layers (sample: 3 scenarios)
- `data/module4Data.json` — enrich with pedagogical layers (sample: 3 scenarios)

**Key types:**
```typescript
export type MediatorState = 'idle' | 'onIntro' | 'onTipRequested' | 'onErrorConstructive' | 'onMetaReflection'

export interface CognitiveConflict {
  question: string
  followUp: string
  expectedInsight: string
}

export interface ScaffoldingTip {
  level: 'explicit' | 'guided' | 'implicit' | 'withdrawn'
  hint: string
  visualGuide?: string
}

export interface DebriefPrompt {
  question: string
  type: 'slider' | 'micro-decision' | 'open-reflection'
  options?: string[]
}

export interface EducationalLayer {
  conflictQuestion: CognitiveConflict
  scaffoldingTip: ScaffoldingTip
  metacognitiveDebrief: DebriefPrompt[]
  mediatorHook: 'onError' | 'onProgress' | 'onCompletion'
}
```

### Phase 1: EducationalMediator Component (~400 lines)
**Files created:**
- `components/shared/EducationalMediator.tsx`
- `components/shared/MediatorPanel.tsx`
- `components/shared/DebriefPanel.tsx`

**Key features:**
- State machine: `idle → onIntro → onTipRequested → onErrorConstructive → onMetaReflection`
- Framer-motion animations for panel entrance/exit
- "Holographic Network Assistant" visual theme (cyan/magenta glow)
- Socratic questioning interface — never displays answers
- Integration hook: `useEducationalMediator.ts`

### Phase 2: Shield Damage Integration (~300 lines)
**Files modified:**
- `components/HUD.tsx` — add mediator pause on `onShieldDamage`
- `components/module1/CookieSweeper.tsx` — integrate mediator on cookie leak
- `components/module1/MetadataExtractor.tsx` — integrate mediator on metadata leak
- `components/module2/EmailDeconstructor.tsx` — integrate mediator on wrong classification
- `components/module2/PhoneticDecoder.tsx` — integrate mediator on panic escalation

**Flow:**
```
Player makes error → Shield takes damage → Game PAUSES
→ EducationalMediator panel opens with CognitiveConflict question
→ Player reflects → Mediator provides scaffolding hint
→ Player gets second chance (reduced score) OR proceeds with explanation
→ Game RESUMES
```

### Phase 3: Pedagogical Mediation Notebook (~350 lines)
**Files modified:**
- `components/module1/URLInspector.tsx` — right column becomes notebook
- `components/module1/EmailDeconstructor.tsx` — right column becomes notebook
- `components/module2/PhoneticDecoder.tsx` — emotional regulation panel

**Features:**
- Right column transforms from "Telemetry" to "Pedagogical Mediation Notebook"
- Clicking components triggers inductive questions in terminal
- Example: "Systems detect variable 'ref=secure'. Is it common for a secure site to need to self-proclaim security in its link parameters?"
- Vishing module: Panic bar linked to conversational decisions that "disarm" attacker's script

### Phase 4: Metacognitive Debrief (~300 lines)
**Files created/modified:**
- `components/shared/DebriefPanel.tsx` — standalone micro-activity
- `components/module1/ResultsScreen.tsx` — add debrief before results
- `components/module2/ResultsScreen.tsx` — add debrief before results
- `components/module3/ResultsScreen.tsx` — add debrief before results
- `components/module4/ResultsScreen.tsx` — add debrief before results

**Features:**
- Interactive sliders for confidence self-evaluation
- Qualitative micro-decisions for strategy summarization
- "Operator Logbook" visual metaphor
- Data persists to localStorage for optional instructor review

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `types/educational.ts` | New | Core mediator type definitions |
| `types/module*.ts` | Modified | Add `educationalLayer` field to scenario types |
| `data/module*Data.json` | Modified | Enrich with pedagogical content (conflict questions, scaffolding, debrief) |
| `components/shared/EducationalMediator.tsx` | New | Core mediator component |
| `components/shared/MediatorPanel.tsx` | New | Panel UI for mediator interactions |
| `components/shared/DebriefPanel.tsx` | New | Metacognitive debrief micro-activity |
| `hooks/useEducationalMediator.ts` | New | State management hook |
| `components/HUD.tsx` | Modified | Add mediator pause on shield damage |
| `components/module1/CookieSweeper.tsx` | Modified | Integrate mediator on errors |
| `components/module1/MetadataExtractor.tsx` | Modified | Integrate mediator on errors |
| `components/module1/URLInspector.tsx` | Modified | Right column → pedagogical notebook |
| `components/module2/EmailDeconstructor.tsx` | Modified | Right column → pedagogical notebook + mediator |
| `components/module2/PhoneticDecoder.tsx` | Modified | Emotional regulation + panic bar |
| `components/module*/ResultsScreen.tsx` | Modified | Add debrief before final results |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Build breaks with new types in data files | Medium | Test `pnpm build` after each phase; keep backward compatibility with `?` optional fields |
| Mediator panel disrupts game flow | Medium | Use framer-motion for smooth transitions; keep panel dismissable; max 3 questions per error |
| Static export fails with new components | Low | All components are client-side; no server-side logic; verify `output: 'export'` after each phase |
| Spanish UI strings mixed with English types | Low | All UI strings in Spanish; all types/interfaces in English; clear separation |
| Performance impact from mediator animations | Low | Use `will-change: transform` sparingly; test on low-end devices |
| Data file size increases significantly | Low | Pedagogical content is text-only; estimated +2KB per module |
| Scope creep into adaptive difficulty | Medium | Strict scope: pre-authored content only; no AI/LLM integration in this phase |

## Dependencies

- **framer-motion 11**: Already installed — used for panel animations
- **Radix UI**: Already installed — used for slider components in debrief
- **lucide-react**: Already installed — used for mediator icons
- No new npm dependencies required

## Rollback Plan

1. **Phase 0**: Revert `types/educational.ts` and data file changes; no other files affected
2. **Phase 1**: Remove `components/shared/EducationalMediator.tsx`, `MediatorPanel.tsx`, `DebriefPanel.tsx`, and `hooks/useEducationalMediator.ts`
3. **Phase 2**: Revert changes to `HUD.tsx` and minigame components; shield damage returns to original behavior
4. **Phase 3**: Revert right column changes in URLInspector, EmailDeconstructor, PhoneticDecoder
5. **Phase 4**: Remove debrief panels from ResultsScreen components

**Complete rollback**: `git revert` all commits in the `educational-mediator` branch; no data migration needed.

## Success Criteria

- [ ] **Type safety**: All new files compile with `strict: true`, zero `any` types
- [ ] **Build passes**: `pnpm build` succeeds with `output: 'export'` static generation
- [ ] **Mediator states**: All 4 mediator states (`onIntro`, `onTipRequested`, `onErrorConstructive`, `onMetaReflection`) render correctly
- [ ] **Shield damage integration**: Error triggers mediator pause before HP reduction in all minigames
- [ ] **Pedagogical notebook**: Right column in URLInspector/EmailDeconstructor displays inductive questions
- [ ] **Emotional regulation**: PhoneticDecoder panic bar responds to conversational decisions
- [ ] **Metacognitive debrief**: ResultsScreen shows debrief panel before final results
- [ ] **Spanish UI**: All user-facing text in Spanish; all types in English
- [ ] **Performance**: No visible jank on mid-range devices (iPhone 12, Pixel 6)
- [ ] **Backward compatibility**: Existing game flow unchanged when mediator is dismissed

## Estimated Total
- 5 phases × ~340 lines avg = **~1,700 lines total**
- Within 400-line budget per PR (5 chained PRs)
