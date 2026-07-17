# Layout Integration Specification

## Purpose

Rewrite `app/layout.tsx` to integrate the HUD component and audio context provider. Maintains existing structure (body classes, metadata, VolumeControl) while adding game foundation layers.

## Requirements

### Requirement: HUD Integration in Layout

The layout SHALL import and render the HUD component above `{children}`. The HUD receives default props (shieldHP: 100, autonomyLevel: 1, cpuUsage: 0, networkActivity: 0, isShieldDamaged: false).

#### Scenario: HUD renders in layout

- GIVEN the root layout mounts
- WHEN children are rendered
- THEN the HUD component appears above children
- AND VolumeControl remains in its current position

---

### Requirement: Audio Context Provider

The layout SHALL wrap children with an audio context provider that initializes the Web Audio API on first user interaction. The provider MUST NOT block rendering.

#### Scenario: Audio provider wraps children

- GIVEN the root layout mounts
- WHEN children render
- THEN they are wrapped in the audio context provider
- AND the provider does not add visible DOM elements

---

### Requirement: Body Classes Preservation

The layout SHALL preserve existing body classes: `bg-slate-950 text-slate-100 antialiased font-sans min-h-screen`. No class changes permitted in Phase 0.

#### Scenario: Body classes unchanged

- GIVEN the layout is rewritten
- WHEN the body element renders
- THEN all existing classes are present

---

### Requirement: Metadata Preservation

The layout SHALL preserve existing metadata: title and description in Spanish. No metadata changes in Phase 0.

#### Scenario: Metadata intact

- GIVEN the layout is rewritten
- WHEN the page loads
- THEN the browser tab shows "CyberGuardians - Módulo 0: Cyber-Diagnóstico"

---

### Requirement: Font Imports Preservation

The layout SHALL preserve existing Google Fonts imports (Inter + JetBrains Mono). No font changes in Phase 0.

#### Scenario: Fonts load

- GIVEN the layout renders
- WHEN the page loads
- THEN Inter and JetBrains Mono fonts are available

---

### Requirement: No Breaking Changes to Module Pages

The layout rewrite MUST NOT break existing module pages (modulo0–modulo4). All existing pages must render identically before and after the change.

#### Scenario: Module 0 renders after layout change

- GIVEN the layout is rewritten with HUD
- WHEN modulo0 page loads
- THEN all existing content renders correctly
- AND no visual regressions occur

#### Scenario: Module 1 renders after layout change

- GIVEN the layout is rewritten with HUD
- WHEN modulo1 page loads
- THEN all existing content renders correctly
