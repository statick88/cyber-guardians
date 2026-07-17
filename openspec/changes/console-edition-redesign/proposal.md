# Console Edition Redesign — Proposal

## Change Name
`console-edition-redesign`

## Intent
Transform the entire CyberGuardians platform from a quiz/scenario-based education tool into an immersive, AAA video game-inspired experience ("Console Edition") with persistent HUD, interactive minigames, audio feedback, and a single-page game loop per module. Target audience: 14–20 year olds who expect game-quality UI.

## Motivation
- Current UI feels "flat and boring" — quiz cards, basic forms, passive scenarios
- Competition: Gen Z expects game-quality interactivity (Persona 5, Cyberpunk 2077, Hacknet aesthetic)
- Engagement drop: passive quizzes don't maintain attention for 20+ minutes
- Need: tactile, visual, audio feedback loop that rewards exploration

## Scope

### In Scope
1. **Global HUD System** — persistent top bar across all modules
   - CPU/Network visualization (animated bars/waves)
   - Shield HP (0–100%, dynamic based on game state)
   - Autonomy Level (score/level indicator)
   - Neon color system: Cyan (#06b6d4), Magenta (#ec4899), Amber (#f59e0b), Red (#ef4444)
   - Red screen flash on shield damage

2. **Audio System** — `useAudioSynth` hook
   - Wrap existing `lib/soundEffects.ts` Web Audio API oscillators
   - New sounds: hover micro-bips, success arpeggios, failure siren, 120BPM warning pulse
   - React state for current audio mode

3. **Module 1 "Shadow Protocol"** — 2 minigames
   - "The Cookie Sweeper" — breakout/aero-hockey, cookie/tracker nodes cascade, player destroys
   - "Metadata Extractor" — drag files through X-ray lens, reveal GPS/device data, quarantine sensitive info

4. **Module 2 "Phish Hunter"** — 2 minigames
   - "Email Deconstructor" — holographic scanner, click anomalies (fake subdomains, urgency), timer
   - "Phonetic Decoder" — vishing simulator, audio transcript, drag switches to block transfers

5. **Module 3 "CyberSentry"** — 2 minigames
   - "Chat Decoy & Flag Simulator" — Discord/Telegram-style, flag red flags before manipulation bar fills
   - "Mule Money Laundering Block" — floating bank board, reconnect wires, trace & block

6. **Module 4 "CriptoDefensores"** — 2 minigames
   - "XOR Signal Unscrambler" — slider changes XOR offset, text scrambles → readable, tune before battery dies
   - "Firewall Overload" — TCP/UDP packets rush ports, tap Accept/Reject per hardening rules

7. **Single-Page Dynamic Loop** per module
   - MENU_PRINCIPAL → BRIEFING_MISIÓN → MINI_JUEGOS → FEEDBACK_TÁCTICO → RESULTADOS_Y_DIPLOMA
   - No page navigation within a module — all in one `<div>` with framer-motion transitions

8. **Graduation System**
   - Canvas-rendered fireworks animation
   - Aggregate scores from all 4 modules
   - Badge unlocking, diploma generation

9. **Strict TypeScript** — complete type schemas, no `any`
10. **Responsive** — mobile-first, 375px minimum

### Out of Scope
- New modules beyond 0–4
- Server-side features (static export only)
- Real multiplayer or WebSocket connections
- New npm dependencies (use existing framer-motion + Tailwind)
- Test infrastructure (no vitest/jest — confirmed not TDD)
- English/Spanish bilingual support (Spanish only)
- Accessibility audit (future concern)

## Approach: Phased PR Chain

Each phase is an independently deployable PR (≤400 lines). Phases 1–4 can run in parallel after Phase 0.

### Phase 0: Global Foundation
**Lines: ~350–400**
- `components/HUD.tsx` — persistent status bar with CPU viz, Shield HP, Autonomy Level
- `hooks/useAudioSynth.ts` — reactive audio hook wrapping soundEffects.ts
- `lib/gameTypes.ts` — shared game state types (GamePhase, HUDState, ModuleGameState)
- `app/layout.tsx` rewrite — integrate HUD, audio context provider
- `app/globals.css` additions — grid-pattern, neon glow utilities, screen-flash animation

### Phase 1: Module 1 "Shadow Protocol"
**Lines: ~350–400**
- `components/module1/CookieSweeper.tsx` — breakout minigame
- `components/module1/MetadataExtractor.tsx` — drag-and-X-ray minigame
- `types/module1.ts` rewrite — new game types
- `data/module1Data.json` rewrite — minigame data
- `app/modulo1/page.tsx` rewrite — MENU→BRIEFING→MINIGAMES→FEEDBACK→RESULTS loop

### Phase 2: Module 2 "Phish Hunter"
**Lines: ~350–400**
- `components/module2/EmailDeconstructor.tsx` — holographic scanner
- `components/module2/PhoneticDecoder.tsx` — vishing simulator
- `types/module2.ts` rewrite
- `data/module2Data.json` rewrite
- `app/modulo2/page.tsx` rewrite

### Phase 3: Module 3 "CyberSentry"
**Lines: ~350–400**
- `components/module3/ChatDecoy.tsx` — Discord-style flag simulator
- `components/module3/MuleMoneyBlock.tsx` — wire reconnect minigame
- `types/module3.ts` rewrite
- `data/module3Data.json` rewrite
- `app/modulo3/page.tsx` rewrite

### Phase 4: Module 4 "CriptoDefensores"
**Lines: ~350–400**
- `components/module4/XORUnscrambler.tsx` — slider minigame
- `components/module4/FirewallOverload.tsx` — TCP/UDP blocking minigame
- `types/module4.ts` rewrite
- `data/module4Data.json` rewrite
- `app/modulo4/page.tsx` rewrite

### Phase 5: Graduation & Polish
**Lines: ~300–350**
- `components/GraduationDiploma.tsx` rewrite — canvas fireworks, aggregate scoring
- `components/module0/page.tsx` updates — landing page console edition
- `lib/storage-keys.ts` updates — new keys if needed
- Final build verification

## Dependency Graph

```
Phase 0 (Global Foundation)
    ↓
    ├── Phase 1 (Module 1)
    ├── Phase 2 (Module 2)
    ├── Phase 3 (Module 3)
    └── Phase 4 (Module 4)
         ↓
    Phase 5 (Graduation)
```

Phases 1–4 are independent after Phase 0. Phase 5 depends on all modules being complete.

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Canvas fireworks performance on mobile | Medium | Use requestAnimationFrame, limit particle count, graceful fallback |
| Audio context blocked by browser | Low | User gesture to start audio, visual-only fallback |
| Animation jank on low-end devices | Medium | Use framer-motion's `layout` animations, reduce particles on mobile |
| TypeScript complexity for game state | Low | Keep types simple, one GameState interface per module |
| localStorage quota exceeded | Low | Only store scores, not game state |
| Static export breaks with new patterns | Low | Test `pnpm build` after each phase |

## Estimated Total
- 6 phases × ~350 lines avg = **~2,100 lines total**
- Within 400-line budget per PR (6 chained PRs)
