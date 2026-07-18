# CyberGuardians — Design System

## Brand Essence

CyberGuardians is a cybersecurity education platform for Latin American youth (14-22).
It teaches through gameplay, not lectures. The design must feel like a game,
not a corporate security dashboard.

## Design Direction: Glasspunk Colorido

Futuristic but warm. Deep space backgrounds with saturated neon auroras.
Glassmorphism on cards and panels. Inviting for young learners,
not intimidating like enterprise security tools.

## Color Palette

### Backgrounds (deep space)
- `--bg-void`: #08050f (near-black with purple undertone)
- `--bg-deep`: #0d0a1a (primary background)
- `--bg-surface`: #141025 (elevated surfaces)
- `--bg-glass`: rgba(20, 16, 37, 0.6) (glass panels)

### Neon Accents (aurora spectrum)
- `--neon-magenta`: #e040fb (primary accent, CTAs, highlights)
- `--neon-cyan`: #00e5ff (secondary accent, links, interactive)
- `--neon-amber`: #ffab00 (warnings, XP, achievements)
- `--neon-emerald`: #00e676 (success, completed states)
- `--neon-rose`: #ff1744 (errors, damage, danger)

### Text
- `--text-primary`: #f0eaf8 (warm white, body text)
- `--text-secondary`: #9b8fc2 (muted, labels)
- `--text-dim`: #5c5280 (disabled, placeholders)

### Glass
- `--glass-border`: rgba(255, 255, 255, 0.08)
- `--glass-shine`: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)
- `--glass-blur`: 16px

## Typography

### Scale
- Display: 3rem/3.5rem, weight 800, tracking -0.02em
- H1: 2rem/2.5rem, weight 700
- H2: 1.5rem/2rem, weight 600
- H3: 1.125rem/1.5rem, weight 600
- Body: 1rem/1.625, weight 400
- Small: 0.875rem/1.25, weight 400
- Caption: 0.75rem/1rem, weight 500

### Font Stacks
- Display/Headings: "Space Grotesk", sans-serif (geometric, modern)
- Body: "Inter", sans-serif (readable)
- Code/Terminal: "JetBrains Mono", monospace

## Components

### Glass Card
- Background: var(--bg-glass)
- Border: 1px solid var(--glass-border)
- Backdrop-filter: blur(var(--glass-blur))
- Border-radius: 16px
- Hover: subtle glow from accent color (box-shadow with neon-magenta at 15% opacity)

### Neon Button
- Background: var(--neon-magenta) for primary
- Hover: brighten + glow shadow
- Border-radius: 12px
- Padding: 12px 24px
- Font: weight 600, 0.875rem

### HUD Bar
- Glass panel at top
- HP bar with gradient (magenta → emerald based on value)
- XP counter with amber glow
- Autonomy level badge with tier color

### Module Card
- Glass card with left accent stripe (4px, tier color)
- Icon (lucide-react, not emoji)
- Title in Space Grotesk
- Description in Inter
- Progress bar at bottom

## Layout Principles

1. Generous whitespace — no cramped text
2. Max content width: 1200px (w-screen-2xl)
3. Responsive: single column mobile, 2-col tablet, 3-col desktop
4. Consistent padding: 24px mobile, 32px tablet, 48px desktop
5. Shared module layout wrapper for all modulo pages

## Animation

- Easing: cubic-bezier(0.16, 1, 0.3, 1) (expo out)
- Duration: 200ms micro, 400ms transitions, 800ms page
- Aurora background: slow gradient rotation (20s cycle)
- Glass shimmer on hover: subtle gradient shift
- Reduced motion: respect prefers-reduced-motion

## Anti-Patterns (banned)

- Generic dark-mode cyan neon (the old look)
- Text smaller than 0.75rem
- Cards without glass effect
- Emoji as icons (use lucide-react)
- Dynamic Tailwind class construction
- Identical card grids
