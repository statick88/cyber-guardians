# Proposal: Threat Intelligence 2026 Update

## Intent

Update CyberGuardians course with comprehensive 2026 threat intelligence targeting youth (14-22) in Latin America. Research reveals critical gaps: deepfakes (1.2M children affected per UNICEF), crypto/trading scams (pyramid schemes targeting students), QR code fraud (Pix Brasil), identity theft (11M accounts on Dark Web), and evolving grooming tactics (Free Fire + ChatGERT). Current modules cover foundational topics but lack 2026-specific threats and gamification strategies for viralization.

## Scope

### In Scope
- **Module 5: Deepfake Defender** — Detection of AI-generated content, deepfake sexual content (Mexico reforms: 10-15 yr sentences), verification techniques
- **Module 6: Crypto-Scam Shield** — Trading academy pyramids, QR code Pix fraud, task-based employment scams, Montadeudas app extortion
- **Module 3 Enhancement** — Add 2026 Europol/INTERPOL findings on criminal recruitment evolution
- **Module 1 Enhancement** — Add metadata extraction for deepfake detection (EXIF, AI artifacts)
- **Gamification Integration** — #RetoHacker-style challenges, badge system expansion, leaderboard design
- **Viralization Strategy** — MrBeast/Atomized Philosophy content approach, social media templates

### Out of Scope
- Backend infrastructure changes (authentication, databases)
- Mobile app development
- Real-time threat intelligence feeds
- Paid content or subscription models

## Capabilities

### New Capabilities
- `deepfake-detection`: AI-generated content identification, metadata analysis, reverse image search techniques
- `crypto-scam-awareness`: Trading pyramid recognition, QR code fraud prevention, employment scam detection
- `identity-theft-prevention`: Dark Web monitoring basics, credit monitoring, account recovery procedures
- `gamification-system`: Challenge progression, badge ecosystem, social sharing mechanics

### Modified Capabilities
- `module3-criminal-recruitment`: Update scenarios with 2026 Europol EMMA findings, add Free Fire grooming cases
- `module1-privacy`: Integrate deepfake detection into metadata extraction activity

## Approach

1. **Research Integration**: Map 2026 OSINT findings to existing module structures
2. **Component Development**: Create new minigame components following established patterns (ScenarioCard, MicroActivity, DragDrop)
3. **Gamification Layer**: Extend HUD system with challenge tracking, XP multipliers for social sharing
4. **Content Validation**: Verify all statistics with cited sources (UNICEF, FBI IC3, Europol)
5. **Viralization Toolkit**: Create shareable achievement cards, challenge prompts for social media

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `types/module5.ts` | New | Deepfake detection types, AI artifact patterns |
| `types/module6.ts` | New | Crypto scam types, QR code fraud patterns |
| `data/module5Data.json` | New | Deepfake scenarios with 2026 statistics |
| `data/module6Data.json` | New | Crypto scam scenarios with real cases |
| `components/module5/` | New | DeepfakeDetector, MetadataAnalyzer, ReverseImageSearch |
| `components/module6/` | New | QRCodeInspector, PyramidDetector, EmploymentScamAlert |
| `app/modulo5/page.tsx` | New | Module 5 orchestrator |
| `app/modulo6/page.tsx` | New | Module 6 orchestrator |
| `types/module3.ts` | Modified | Add 2026 scenario types |
| `data/module3Data.json` | Modified | Update with Free Fire grooming cases |
| `components/module1/MetadataExtractor.tsx` | Modified | Add deepfake detection features |
| `lib/gameTypes.ts` | Modified | Add challenge/social sharing types |
| `components/HUD.tsx` | Modified | Add challenge progress indicator |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Content becomes outdated quickly | High | Design modular structure for easy updates, cite publication dates |
| Age-inappropriateness of deepfake content | Medium | Focus on detection techniques, not explicit examples; add content warnings |
| Gamification feels forced | Medium | Integrate naturally into learning flow, validate with youth focus groups |
| Viralization strategy doesn't resonate | Low | Use proven formats (MrBeast, Atomized Philosophy), A/B test content |

## Rollback Plan

1. Git revert to commit before threat-intel-2026-update branch merge
2. Remove new module directories (modulo5/, modulo6/)
3. Restore original module3Data.json and module1 components
4. Revert HUD changes to remove challenge tracking
5. All changes are additive — no existing functionality broken

## Dependencies

- None external — all content based on published research
- Internal: Existing component library (ScenarioCard, MicroActivity, DragDrop patterns)
- Internal: HUD system from console-edition-redesign

## Success Criteria

- [ ] Module 5 covers deepfake detection with 2026 statistics (UNICEF, Mexico reforms)
- [ ] Module 6 covers crypto scams with real casos (pirámides, QR Pix, employment scams)
- [ ] Module 3 updated with Free Fire grooming and 2026 Europol findings
- [ ] Gamification system adds challenge progression without breaking existing flow
- [ ] Viralization toolkit includes 3+ shareable content templates
- [ ] All new content cites sources with publication dates
- [ ] Age-appropriate warnings for sensitive content
- [ ] Build passes with no TypeScript errors
- [ ] Static export to GitHub Pages successful
