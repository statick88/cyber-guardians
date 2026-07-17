# SDD Context — CyberGuardians

## Project
- **Name**: cyber-guardians
- **Path**: /mnt/hgfs/statick/security/courses/CyberGuardians
- **Description**: Cybersecurity education platform for adolescents — gamified, animated, module-based learning

## Stack
| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 16.2.10 | App Router, static export (`output: 'export'`) |
| Language | TypeScript | 5+ | Strict mode, bundler resolution, `@/*` alias |
| UI | React | 18.3+ | Functional components |
| Styling | Tailwind CSS | 3.4+ | Custom cyber theme (neon shadows, animations) |
| Animation | framer-motion | 11+ | Page transitions, micro-interactions |
| Icons | lucide-react | 0.400+ | UI iconography |
| Components | Radix UI | Slot | Headless UI primitives |
| Build | Node.js | 24.18.0 | Corepack, pnpm 11.13.0 |
| Lint | ESLint | via next lint | Code quality |
| Deploy | GitHub Pages | — | Static export, basePath: /cyber-guardians |

## Architecture
- **App Router** with modular learning structure:
  - `app/page.tsx` — Landing/welcome
  - `app/modulo0/` — Module 0 (intro)
  - `app/modulo1/` — Module 1
  - `app/modulo2/` — Module 2
  - `app/modulo3/` — Module 3
  - `app/modulo4/` — Module 4
- **Shared components**: 18 components in `/components` (GameProgress, MicroActivity, ResultsScreen, ScenarioCard, WelcomeScreen, HUD, ErrorBoundary, BadgesGrid, GraduationDiploma, VolumeControl, mediator/, ui/)
- **Module-specific components**: `components/module0/` through `components/module4/`
- **Type definitions**: `types/module0.ts` through `types/module4.ts`, `types/educational.ts`, `types/mainMenu.ts`
- **Lib utilities**: `lib/featureFlags.ts`, `lib/gameTypes.ts`, `lib/navigation.ts`, `lib/soundEffects.ts`, `lib/storage-keys.ts`, `lib/utils.ts`
- **Custom hooks**: `hooks/useAudioSynth.ts`, `hooks/useEducationalMediator.ts`, `hooks/useGamePause.tsx`, `hooks/useNotebook.ts`, `hooks/useScaffolding.ts`
- **Data**: JSON data files for each module + `debriefPrompts.ts`
- **Static export** — deployed as static files (no server runtime)

## Testing Capabilities
- **strict_tdd**: false
- **Test runner**: None detected
- **Test files**: None (no `*.test.*` or `*.spec.*` in source)
- **Testing deps**: None (no vitest, jest, playwright, cypress, @testing-library/*)
- **Available checks**: `next lint` (ESLint), `tsc --noEmit` (type checking)
- **Recommendation**: Add vitest + @testing-library/react if TDD desired

## SDD Workflow
- **Artifact store**: hybrid (engram + openspec)
- **Topic key**: `sdd-init/cyber-guardians`
- **Status**: Initialized
- **Next phase**: sdd-explore → sdd-propose → sdd-spec → sdd-design → sdd-tasks → sdd-apply → sdd-verify → sdd-archive
