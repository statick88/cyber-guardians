# HUD System Specification

## Purpose

Global persistent status bar providing real-time game state visualization across all modules. Fixed-position top bar with CPU/network animations, shield HP, autonomy level, and damage feedback.

## Requirements

### Requirement: HUD Persistence

The HUD component SHALL render as a fixed-position top bar across all routes, z-index 50, full width, 48px height (44px minimum touch target).

#### Scenario: HUD renders on every page

- GIVEN the app is loaded on any route
- WHEN the layout mounts
- THEN the HUD bar is visible at the top of the viewport
- AND it remains fixed during scroll

#### Scenario: HUD does not overlap content

- GIVEN the HUD is rendered at 48px height
- WHEN content is below the HUD
- THEN content has top padding matching the HUD height

---

### Requirement: Shield HP Visualization

The system SHALL display shield HP as a horizontal bar with color gradient from green (#22c55e) to yellow (#eab308) to red (#ef4444) based on value. Range: 0–100.

#### Scenario: Shield HP at full

- GIVEN shieldHP is 100
- WHEN the HUD renders
- THEN the bar is fully filled with green (#22c55e)

#### Scenario: Shield HP at critical

- GIVEN shieldHP is 15
- WHEN the HUD renders
- THEN the bar shows red (#ef4444) fill at 15% width

#### Scenario: Shield HP transitions

- GIVEN shieldHP changes from 80 to 30
- WHEN the transition occurs
- THEN the bar animates smoothly over 300ms using framer-motion

---

### Requirement: CPU Usage Animation

The system SHALL display CPU usage as 5 animated vertical bars. Each bar pulses at a rate proportional to the value. Range: 0–100.

#### Scenario: CPU at idle

- GIVEN cpuUsage is 10
- WHEN the HUD renders
- THEN 1–2 bars animate with low amplitude

#### Scenario: CPU at high load

- GIVEN cpuUsage is 90
- WHEN the HUD renders
- THEN all 5 bars animate with high amplitude
- AND bar color shifts to amber (#f59e0b)

---

### Requirement: Network Activity Waves

The system SHALL display network activity as an animated sine wave pattern. Wave amplitude scales with the value. Range: 0–100.

#### Scenario: Network idle

- GIVEN networkActivity is 0
- WHEN the HUD renders
- THEN the wave is flat (amplitude near zero)

#### Scenario: Network active

- GIVEN networkActivity is 75
- WHEN the HUD renders
- THEN the wave shows visible oscillation with amplitude proportional to 75%

---

### Requirement: Autonomy Level Display

The system SHALL display autonomy level as a numeric value plus a visual tier indicator (5 tiers: 1–5 stars or segments).

#### Scenario: Low autonomy

- GIVEN autonomyLevel is 1
- WHEN the HUD renders
- THEN 1 segment is filled
- AND numeric value shows "NVL 1"

#### Scenario: High autonomy

- GIVEN autonomyLevel is 5
- WHEN the HUD renders
- THEN all 5 segments are filled with cyan (#06b6d4)

---

### Requirement: Shield Damage Flash

The system SHALL trigger a red screen flash when `isShieldDamaged` transitions from false to true. Flash covers full viewport, red overlay at 30% opacity fading to 0 over 500ms.

#### Scenario: Damage triggered

- GIVEN isShieldDamaged is false
- WHEN isShieldDamaged becomes true
- THEN a red overlay appears at 30% opacity
- AND the overlay fades to 0% over 500ms

#### Scenario: Repeated damage

- GIVEN isShieldDamaged is already true
- WHEN isShieldDamaged remains true
- THEN no new flash triggers (only edge transition)

---

### Requirement: Module Name Display

The system SHALL display the current module name in the HUD when provided. If not provided, the module name slot is hidden.

#### Scenario: Module name present

- GIVEN moduleName is "Shadow Protocol"
- WHEN the HUD renders
- THEN "SHADOW PROTOCOL" appears in the HUD (uppercase)

#### Scenario: Module name absent

- GIVEN moduleName is undefined
- WHEN the HUD renders
- THEN no module name is displayed

---

### Requirement: Responsive Collapse

The system SHALL collapse the HUD to essential info (Shield HP + Autonomy Level only) on viewports narrower than 640px. CPU and network visualizations hide.

#### Scenario: Mobile viewport

- GIVEN viewport width is 375px
- WHEN the HUD renders
- THEN only Shield HP bar and Autonomy Level are visible
- AND CPU/network visualizations are hidden

#### Scenario: Tablet viewport

- GIVEN viewport width is 768px
- WHEN the HUD renders
- THEN all HUD elements are visible

---

### Requirement: Neon Glow Styling

The system SHALL apply neon glow effects to all HUD elements using the project's color system: cyan (#06b6d4), magenta (#ec4899), amber (#f59e0b), red (#ef4444).

#### Scenario: Default glow

- GIVEN the HUD renders on any viewport
- WHEN elements are visible
- THEN each element has a subtle text-shadow or box-shadow glow in its assigned color

---

### Requirement: Accessibility — Reduced Motion

The system SHALL respect `prefers-reduced-motion: reduce`. When active, CPU bars, network waves, and shield transitions use instant state changes instead of animations.

#### Scenario: Reduced motion preference

- GIVEN the user OS has reduced motion enabled
- WHEN the HUD renders
- THEN animations are replaced with instant state updates
