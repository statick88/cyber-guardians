# SDD Context — adolecentes

## Project
- **Name**: cyber-guardians (adolecentes)
- **Path**: /Users/statick/security/courses/adolecentes
- **Description**: Cybersecurity education platform for adolescents — gamified, animated, module-based learning

## Stack
| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 14.2+ | App Router, static export (`output: 'export'`) |
| Language | TypeScript | 5+ | Strict mode, bundler resolution, `@/*` alias |
| UI | React | 18.3+ | Functional components |
| Styling | Tailwind CSS | 3.4+ | Custom cyber theme (neon shadows, animations) |
| Animation | framer-motion | 11+ | Page transitions, micro-interactions |
| Icons | lucide-react | 0.400+ | UI iconography |
| Build | Node.js | - | Standard Next.js build pipeline |
| Lint | ESLint | via next lint | Code quality |

## Architecture
- **App Router** with modular learning structure:
  - `app/page.tsx` — Landing/welcome
  - `app/modulo0/` — Module 0 (intro)
  - `app/modulo1/` — Module 1 (first lesson)
- **Shared components**: GameProgress, MicroActivity, ResultsScreen, ScenarioCard, WelcomeScreen
- **Module-specific components**: `components/module1/`
- **Type definitions**: `types/module0.ts`, `types/module1.ts`
- **Static export** — deployed as static files (no server runtime)

## Testing Capabilities
- **strict_tdd**: false
- **Test runner**: None detected
- **Test files**: None (no `*.test.*` or `*.spec.*` in source)
- **Testing deps**: None (no vitest, jest, playwright, cypress, @testing-library/*)
- **Available checks**: `next lint` (ESLint), `tsc --noEmit` (type checking)
- **Recommendation**: Add vitest + @testing-library/react if TDD desired

## SDD Workflow
- **Artifact store**: engram (project: "adolecentes")
- **Topic key**: `sdd-init/adolecentes`
- **Status**: Initialized
- **Next phase**: sdd-explore → sdd-propose → sdd-spec → sdd-design → sdd-tasks → sdd-apply → sdd-verify → sdd-archive
