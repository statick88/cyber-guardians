# Tasks: Phase 1 — Module 1 "Shadow Protocol" (Visual Overhaul)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350–450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

## Scope

**Visual overhaul only.** All game logic (physics, collisions, loops, state, damage, audio) stays IDENTICAL. Only CSS classes, framer-motion wrappers, and visual presentation change.

## Task 1: Global Visual Layer — `app/globals.css`

- [ ] 1.1 Append CRT scanline overlay CSS: `.crt-scanlines` with repeating-linear-gradient (2px transparent bands), `.crt-flicker` animation (opacity 0.97→1→0.98, 4s infinite), `.crt-overlay` pseudo-element for scanline + vignette combined effect
- [ ] 1.2 Append `.glitch-rgb` keyframes for chromatic aberration (translateR, translateG, translateB offset 3px each direction, 150ms)
- [ ] 1.3 Append `.neon-glow-cyan`, `.neon-glow-magenta`, `.neon-glow-amber` box-shadow utilities
- [ ] 1.4 Append `@media (prefers-reduced-motion: reduce)` override that disables all new animations

**Estimated lines:** ~60 new
**Dependencies:** None

## Task 2: `CookieSweeper.tsx` — Visual Overhaul

- [ ] 2.1 Change container from `max-w-5xl` to `max-w-6xl w-full mx-auto`
- [ ] 2.2 Add CRT overlay: wrap game canvas area in a div with `.crt-scanlines` + `.crt-flicker` classes (z-10, pointer-events-none, absolute inset-0)
- [ ] 2.3 Paddle visual: replace flat bar with gradient (cyan→magenta based on shieldHP), add `shadow-[0_0_20px_rgba(6,182,212,0.4)]` glow, add motion ghost trail via framer-motion `layout` animation on paddle position change
- [ ] 2.4 Cookie rotation/pulse: wrap each FallingCookie icon in a framer-motion div with subtle `rotate: [0, 5, -5, 0]` infinite animation (2s period), add scale pulse on hover proximity
- [ ] 2.5 Collision particles: on cookie-shield collision, spawn framer-motion particles (8-12 small dots) that fly outward and fade over 400ms using `AnimatePresence`
- [ ] 2.6 Damage glitch: on shield damage, apply `.glitch-rgb` class to game container for 150ms via setTimeout, then remove
- [ ] 2.7 Neon panel borders: add `shadow-[0_0_15px_rgba(6,182,212,0.15)]` to game container, `shadow-[0_0_15px_rgba(236,72,153,0.15)]` on danger state (shieldHP < 30)

**Estimated lines:** ~120 changed
**Dependencies:** Task 1 (CSS classes), existing game logic (untouched)

## Task 3: `MetadataExtractor.tsx` — Visual Overhaul

- [ ] 3.1 Change container from `max-w-5xl` to `max-w-6xl w-full mx-auto`
- [ ] 3.2 Add CRT overlay: same as CookieSweeper (`.crt-scanlines` + `.crt-flicker`)
- [ ] 3.3 Laser scan line: redesign vertical sweep with gradient (`from-transparent via-cyan-400 to-transparent`), add `drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]` glow, add 3-4 small floating particles (framer-motion, random Y drift) near scanner needle
- [ ] 3.4 EXIF decode cascade: wrap metadata text in `font-mono text-emerald-400 bg-black/80` terminal box, add character scramble effect (each character cycles through random chars for 50ms before settling) using requestAnimationFrame
- [ ] 3.5 Decision buttons: apply Persona 5 clip-path (`polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)`), add high-contrast hover (bg shift from transparent to solid cyan/magenta), add `transition-all duration-100` for snappy response
- [ ] 3.6 Neon panel borders: same shadow treatment as CookieSweeper

**Estimated lines:** ~120 changed
**Dependencies:** Task 1 (CSS classes), existing game logic (untouched)

## Verification

| Task | Verification |
|------|-------------|
| 1 | `pnpm build` compiles; `.crt-scanlines` class available in DevTools |
| 2 | CookieSweeper renders with scanlines, paddle glows, cookies rotate, damage glitch fires |
| 3 | MetadataExtractor renders with laser glow, EXIF scramble, holographic buttons |
| All | `pnpm build` zero errors; `tsc --noEmit` zero errors; mobile responsive at 375px |
