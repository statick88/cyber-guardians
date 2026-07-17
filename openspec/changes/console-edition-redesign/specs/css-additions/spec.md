# CSS Additions Specification

## Purpose

Add CSS utilities to `app/globals.css` for the Console Edition: grid-pattern background, neon glow text utilities, screen-flash animation, and shield-damage pulse animation. All additions are in `@layer components` or `@layer utilities`.

## Requirements

### Requirement: Grid Pattern Background

The system SHALL provide a `.grid-pattern` CSS class that renders a subtle grid of lines using CSS background-image. Grid lines: rgba(34, 211, 238, 0.05) color, 40px spacing.

#### Scenario: Grid pattern applied

- GIVEN a container has class `grid-pattern`
- WHEN the element renders
- THEN a subtle cyan grid overlay is visible on the dark background

---

### Requirement: Neon Glow Text Utilities

The system SHALL provide 4 neon text-shadow utility classes: `.neon-cyan` (#06b6d4), `.neon-magenta` (#ec4899), `.neon-amber` (#f59e0b), `.neon-red` (#ef4444). Each applies a two-layer text-shadow (10px + 20px spread).

#### Scenario: Neon cyan applied

- GIVEN an element has class `neon-cyan`
- WHEN rendered
- THEN text has cyan glow: `text-shadow: 0 0 10px #06b6d4, 0 0 20px #06b6d4`

#### Scenario: Neon magenta applied

- GIVEN an element has class `neon-magenta`
- WHEN rendered
- THEN text has magenta glow: `text-shadow: 0 0 10px #ec4899, 0 0 20px #ec4899`

---

### Requirement: Screen Flash Animation

The system SHALL provide a `@keyframes screen-flash` animation and `.screen-flash` utility class. Animation: opacity 0.3 → 0 over 500ms ease-out. Used for shield damage feedback.

#### Scenario: Screen flash triggered

- GIVEN an element receives class `screen-flash`
- WHEN the animation starts
- THEN opacity transitions from 0.3 to 0 over 500ms

---

### Requirement: Shield Damage Pulse

The system SHALL provide a `@keyframes shield-pulse` animation and `.shield-pulse` utility class. Animation: opacity oscillates 1 → 0.5 → 1, runs 3 times. Used for low-shield warning.

#### Scenario: Shield pulse triggered

- GIVEN an element receives class `shield-pulse`
- WHEN the animation starts
- THEN opacity pulses 3 times over 900ms total

---

### Requirement: Existing CSS Preservation

All existing CSS classes and layers MUST NOT be modified or removed. New additions are appended to existing layers or added as new layers.

#### Scenario: Existing classes intact

- GIVEN globals.css is modified
- WHEN existing classes are checked
- THEN all original classes (neon-text, glass-card, gradient-bg, etc.) remain unchanged

---

### Requirement: No New CSS Dependencies

The system SHALL NOT introduce new CSS preprocessors, frameworks, or external stylesheets. All additions are plain CSS within Tailwind's layer system.

#### Scenario: Build check

- GIVEN globals.css is modified
- WHEN `pnpm build` runs
- THEN no new CSS dependencies are required
