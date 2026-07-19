# Design: Threat Intelligence 2026 Update

## Technical Approach

Extend CyberGuardians with two new modules (5, 6) and enhance existing modules (1, 3) following established patterns: TypeScript types → JSON data → React components → Page orchestrator. Gamification layer extends HUD system with challenge tracking. All additive — zero changes to existing module behavior.

## Architecture Decisions

### Decision: Module Structure Pattern

**Choice**: Follow existing `types/{module}.ts` → `data/{module}Data.json` → `components/{module}/` → `app/modulo{N}/page.tsx` pattern  
**Alternatives considered**: Shared component library, plugin architecture  
**Rationale**: Consistency with 4 existing modules, minimal learning curve, proven static export compatibility

### Decision: Deepfake Detection Approach

**Choice**: Metadata analysis + visual artifact detection + reverse image search simulation  
**Alternatives considered**: Real AI detection APIs, browser-based ML models  
**Rationale**: Offline-capable, no API costs, age-appropriate (avoids explicit content), fits existing MetadataExtractor pattern

### Decision: Gamification Extension

**Choice**: Extend HUDContext with `challenges` array and `socialShares` counter  
**Alternatives considered**: Separate gamification provider, localStorage-only tracking  
**Rationale**: Centralized state, persists across sessions, integrates with existing XP/shield system

### Decision: Content Sensitivity Handling

**Choice**: Content warnings + detection-focused (not example-focused) + age-gate for detailed scenarios  
**Alternatives considered**: Full content filtering, parent-controlled access  
**Rationale**: Educational value preserved, respects developmental stage, aligns with UNICEF guidelines

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        HUD Context                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ shieldHP │  │    XP    │  │ autonomy │  │ challenges[] │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Module 5     │   │  Module 6     │   │  Module 3     │
│  Deepfake     │   │  Crypto-Scam  │   │  Enhanced     │
│  Defender     │   │  Shield       │   │  Criminal     │
│               │   │               │   │  Recruitment  │
│  ┌─────────┐  │   │  ┌─────────┐  │   │  ┌─────────┐  │
│  │Detector │  │   │  │QRInspect│  │   │  │FreeFire │  │
│  │Analyzer │  │   │  │Pyramid  │  │   │  │Grooming │  │
│  │Reverse  │  │   │  │Employ   │  │   │  │ChatSim  │  │
│  │Image    │  │   │  │Scam     │  │   │  │Updated  │  │
│  └─────────┘  │   │  └─────────┘  │   │  └─────────┘  │
└───────────────┘   └───────────────┘   └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  Social Share   │
                    │  Templates      │
                    │  (MrBeast style)│
                    └─────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `types/module5.ts` | Create | Deepfake detection types, AI artifact patterns, metadata analysis |
| `types/module6.ts` | Create | Crypto scam types, QR code fraud, employment scam patterns |
| `data/module5Data.json` | Create | Deepfake scenarios with 2026 statistics (UNICEF, Mexico reforms) |
| `data/module6Data.json` | Create | Crypto scam scenarios with real cases (pirámides, QR Pix) |
| `components/module5/DeepfakeDetector.tsx` | Create | Visual artifact detection minigame (drag-and-drop AI markers) |
| `components/module5/MetadataAnalyzer.tsx` | Create | Extended MetadataExtractor with deepfake indicators |
| `components/module5/ReverseImageSearch.tsx` | Create | Simulated reverse image search verification |
| `components/module5/MicroActivities.tsx` | Create | Deepfake-specific micro activities |
| `components/module5/index.ts` | Create | Barrel export |
| `components/module6/QRCodeInspector.tsx` | Create | QR code fraud detection minigame |
| `components/module6/PyramidDetector.tsx` | Create | Trading pyramid scheme identifier |
| `components/module6/EmploymentScamAlert.tsx` | Create | Task-based scam recognition |
| `components/module6/MicroActivities.tsx` | Create | Crypto scam micro activities |
| `components/module6/index.ts` | Create | Barrel export |
| `app/modulo5/page.tsx` | Create | Module 5 page orchestrator (WELCOME → ACTIVITIES → RESULTS) |
| `app/modulo6/page.tsx` | Create | Module 6 page orchestrator |
| `types/module3.ts` | Modify | Add FreeFireGroomingScenario type |
| `data/module3Data.json` | Modify | Add 2026 grooming scenarios with ChatGPT assistance |
| `components/module1/MetadataExtractor.tsx` | Modify | Add deepfake detection indicators |
| `lib/gameTypes.ts` | Modify | Add Challenge type, SocialShare interface |
| `components/HUD.tsx` | Modify | Add challenge progress indicator |
| `components/HUDProvider.tsx` | Modify | Add challenges state management |
| `data/badges.ts` | Modify | Add Module 5/6 badges, fix Module 3 badge text |
| `components/GraduationDiploma.tsx` | Modify | Update module references |

## Interfaces / Contracts

```typescript
// types/module5.ts
export interface DeepfakeArtifact {
  id: string;
  type: 'metadata' | 'visual' | 'temporal' | 'frequency';
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DeepfakeScenario {
  id: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video' | 'audio';
  artifacts: DeepfakeArtifact[];
  source: string; // Citation: "UNICEF 2026", "Mexico Senate 2026"
  ageWarning?: string; // Content sensitivity flag
}

// types/module6.ts
export interface QRCodeScam {
  id: string;
  scenario: string;
  legitimateQR: string;
  maliciousQR: string;
  redFlags: string[];
  region: 'brazil' | 'mexico' | 'global';
}

export interface PyramidScheme {
  id: string;
  name: string;
  promises: string[];
  structure: string[];
  realCost: string;
  exitOpportunities: string[];
}

// lib/gameTypes.ts (extension)
export interface Challenge {
  id: string;
  moduleId: number;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  shareable: boolean;
}

export interface SocialShare {
  platform: 'twitter' | 'instagram' | 'tiktok';
  template: string;
  hashtags: string[];
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Type correctness, data validation | TypeScript strict mode, `tsc --noEmit` |
| Integration | Component rendering, state flow | Manual testing in browser (existing pattern) |
| E2E | Module completion flow | Static export verification on GitHub Pages |
| Content | Statistical accuracy, source citation | Manual review against research sources |

**Note**: Project has no test framework installed. Testing relies on TypeScript compilation and manual verification.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

1. **Phase 1**: Create Module 5 (Deepfake Defender) — standalone, no dependencies on other modules
2. **Phase 2**: Create Module 6 (Crypto-Scam Shield) — standalone, parallel development
3. **Phase 3**: Enhance Module 3 (Criminal Recruitment) — add 2026 scenarios to existing structure
4. **Phase 4**: Enhance Module 1 (MetadataExtractor) — add deepfake indicators
5. **Phase 5**: Gamification layer — extend HUD with challenges, social shares
6. **Phase 6**: Viralization toolkit — shareable templates, social media content

**Feature Flag**: New modules gated behind `NEXT_PUBLIC_THREAT_INTEL_2026` env var (default: true)

**Rollback**: Each phase is independent — can revert any phase without affecting others

## Open Questions

- [ ] Should Module 5 include audio deepfake detection or focus on visual only?
- [ ] What's the minimum viable gamification for viralization — just badges or full challenge system?
- [ ] Should social sharing require user consent or be opt-in by default?
- [ ] How to handle region-specific content (Brazil QR scams vs Mexico identity theft)?
