# SDD Technical Design — quiz-shuffle-and-threejs

## Architecture Overview

### Problem Statement

Quiz answers in 4 components are always rendered in the same order, creating position bias. Students learn to associate correct answers with specific positions rather than content understanding.

### Solution Architecture

**Two independent deliverables:**

1. **Quiz Shuffle** — Fisher-Yates shuffle with session-keyed determinism
2. **Three.js Visual Effects** — Module-level background effects with reduced-motion fallback

### Component Tree

```
App
├── hooks/
│   ├── useQuizShuffle.ts        ← NEW: session-aware shuffle hook
│   └── useQuizSound.ts          ← EXISTING: audio feedback
├── lib/
│   └── shuffle.ts               ← NEW: Fisher-Yates implementation
├── components/
│   ├── ScenarioCard.tsx          ← MODIFY: shuffle opciones
│   ├── module3/
│   │   ├── MulaDineroDetector.tsx  ← MODIFY: shuffle opciones
│   │   └── ExtorsionResponse.tsx   ← MODIFY: shuffle opciones
│   ├── module6/
│   │   └── MicroActivities.tsx   ← MODIFY: shuffle QUIZ_QUESTIONS inline
│   └── three/
│       └── ModuleBackground.tsx  ← NEW: Three.js background wrapper
```

---

## Component Design

### 1. Shuffle Utility — `lib/shuffle.ts`

```typescript
/**
 * Fisher-Yates shuffle — returns new array, does not mutate input.
 * Session-keyed: same seed → same order across remounts within session.
 */
export function shuffleArray<T>(array: T[], seed: number): T[]
```

**Design Decisions:**
- **Fisher-Yates** over `Array.sort(() => Math.random())` — unbiased O(n) vs biased O(n log n)
- **Session-keyed** via `sessionStorage` — shuffle once per page load, stable across React remounts
- **Pure function** — no side effects, testable in isolation
- **No external dependency** — avoids adding a shuffle library

**Session Key Strategy:**
```typescript
// lib/shuffle.ts
export function getSessionSeed(key: string): number {
  const stored = sessionStorage.getItem(`quiz-seed-${key}`);
  if (stored) return parseInt(stored, 10);
  const seed = Math.floor(Math.random() * 2147483647);
  sessionStorage.setItem(`quiz-seed-${key}`, seed.toString());
  return seed;
}

// Seeded PRNG (mulberry32) for deterministic shuffle from seed
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function shuffleArray<T>(array: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

### 2. Quiz Shuffle Hook — `hooks/useQuizShuffle.ts`

```typescript
interface UseQuizShuffleOptions<T> {
  items: T[];
  /** Unique key for this quiz (used as sessionStorage seed namespace) */
  quizKey: string;
}

interface UseQuizShuffleResult<T> {
  /** Shuffled items — stable across remounts within session */
  shuffled: T[];
  /** Function to get shuffled index from original index (for answer checking) */
  getOriginalIndex: (shuffledIndex: number) => number;
}
```

**Why a hook?**
- Encapsulates session-key lifecycle (get seed once, reuse)
- Provides `getOriginalIndex` to map shuffled positions back to original for `respuestaCorrecta` checking
- Memoized via `useMemo` — no re-shuffle on re-render

### 3. Component Integration Plan

#### ScenarioCard.tsx (Module 0)

**Current state:**
```tsx
// Line 100
{scenario.opciones.map((opcion) => (
  <button
    key={opcion.id}
    className={...}
    onClick={() => handleRespuesta(opcion.esCorrecta)}
  >
    {opcion.texto}
  </button>
))}
```

**After shuffle:**
```tsx
const { shuffled: opcionesShuffled } = useQuizShuffle({
  items: scenario.opciones,
  quizKey: `module0-${scenario.id}`,
});

// Line 100 — replace scenario.opciones with opcionesShuffled
{opcionesShuffled.map((opcion) => (
  <button
    key={opcion.id}
    className={...}
    onClick={() => handleRespuesta(opcion.esCorrecta)}
  >
    {opcion.texto}
  </button>
))}
```

**Key insight:** `ScenarioCard` uses `opcion.esCorrecta` (boolean) for answer checking — **no index mapping needed**. The shuffle only affects render order.

#### MulaDineroDetector.tsx (Module 3)

**Current state:**
```tsx
// Line 272
pregunta.opciones.map((opcion, idx) => (
  <button
    onClick={() => handleSeleccion(pregunta.respuestaCorrecta === idx)}
  >
    {opcion}
  </button>
))
```

**After shuffle:**
```tsx
const { shuffled: opcionesShuffled, getOriginalIndex } = useQuizShuffle({
  items: pregunta.opciones,
  quizKey: `module3-mula-${pregunta.pregunta}`,
});

// Line 272 — replace pregunta.opciones with opcionesShuffled
{opcionesShuffled.map((opcion, shuffledIdx) => (
  <button
    onClick={() => handleSeleccion(pregunta.respuestaCorrecta === getOriginalIndex(shuffledIdx))}
  >
    {opcion}
  </button>
))}
```

**Key insight:** Uses `respuestaCorrecta: number` (index-based) — **must map** shuffled position back to original index via `getOriginalIndex`.

#### ExtorsionResponse.tsx (Module 3)

**Current state:**
```tsx
// Line 137
scenario.opciones.map((opcion, idx) => (
  <button
    onClick={() => handleSeleccion(idx)}
  >
    {opcion}
  </button>
))
```

**After shuffle:**
```tsx
const { shuffled: opcionesShuffled, getOriginalIndex } = useQuizShuffle({
  items: scenario.opciones,
  quizKey: `module3-ext-${scenario.id}`,
});

// Line 137 — replace scenario.opciones with opcionesShuffled
{opcionesShuffled.map((opcion, shuffledIdx) => (
  <button
    onClick={() => handleSeleccion(getOriginalIndex(shuffledIdx))}
  >
    {opcion}
  </button>
))}
```

#### module6/MicroActivities.tsx

**Current state:**
```tsx
// Lines 12-34 — inline QUIZ_QUESTIONS array
const QUIZ_QUESTIONS = [
  {
    question: "¿Cuál es la mejor forma de...",
    options: ["Opción A", "Opción B", "Opción C", "Opción D"],
    correctAnswer: 1,
  },
  // ...
];
// Line 230 — rendered inline
QUIZ_QUESTIONS.map((q) => ...)
```

**After shuffle:**
```tsx
// Shuffle at component level, not inside map
const { shuffled: questionsShuffled, getOriginalIndex } = useQuizShuffle({
  items: QUIZ_QUESTIONS,
  quizKey: 'module6-quiz',
});

// Render shuffled array, map correctAnswer via getOriginalIndex
{questionsShuffled.map((q, qIdx) => (
  // ... render q.options (also shuffled)
))}
```

**Additional complexity:** Each question's `options` array also needs shuffling. Two approaches:
- **Option A (recommended):** Shuffle options per-question using a nested `useQuizShuffle` per question
- **Option B:** Extend `useQuizShuffle` to handle nested shuffling

**Recommendation:** Option A — keeps the hook simple, leverages React's component tree for lifecycle.

---

## Data Flow

### Quiz Shuffle Flow

```
Session Load
  │
  ▼
getSessionSeed(quizKey) → seed (from sessionStorage or generated)
  │
  ▼
shuffleArray(items, seed) → shuffled[] (deterministic from seed)
  │
  ▼
Component renders shuffled options
  │
  ▼
User clicks → getOriginalIndex(shuffledIdx) → originalIdx
  │
  ▼
Answer check against original data structure
```

### Three.js Background Flow

```
Module Page Load
  │
  ▼
ModuleBackground mounted (lazy via next/dynamic, ssr: false)
  │
  ▼
Check prefers-reduced-motion
  │
  ├── True → Render static gradient fallback
  │
  └── False → Render <Canvas> with <Effects>
        │
        ▼
      requestAnimationFrame loop → particle animations
```

---

## Three.js Integration Design

### Package Selection

| Package | Purpose | Bundle Impact |
|---------|---------|---------------|
| `three` | Core 3D library | ~150KB gzipped |
| `@react-three/fiber` | React renderer | ~40KB gzipped |
| `@react-three/drei` | Helpers (optional) | ~20KB gzipped |

**Total:** ~210KB gzipped — acceptable for educational platform with static export.

### Lazy Loading Strategy

```typescript
// components/ModuleBackground.tsx
import dynamic from 'next/dynamic';

const ThreeBackground = dynamic(
  () => import('./three/ThreeScene'),
  {
    ssr: false,           // Required: Three.js uses browser APIs
    loading: () => <StaticGradient />,  // Show static fallback while loading
  }
);
```

**Why `next/dynamic` with `ssr: false`?**
- Static export (`output: 'export'`) requires no server-side rendering
- Three.js uses `window`/`document` — SSR would crash
- Loading fallback provides immediate visual feedback

### Reduced-Motion Fallback

```typescript
// components/three/ThreeScene.tsx
'use client';

import { useReducedMotion } from 'framer-motion';

export function ThreeScene() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <StaticGradient />;
  }

  return (
    <Canvas>
      <ParticleField />
    </Canvas>
  );
}
```

**Static fallback:** CSS-only gradient animation using `@keyframes` — lightweight, accessible, no JS overhead.

### Visual Effect Scope

| Module | Effect | Trigger |
|--------|--------|---------|
| Module 0 | Floating shield particles | Module entry |
| Module 1 | Network connection lines | Quiz completion |
| Module 3 | Warning pulse overlay | Correct answer |
| Module 6 | Crypto hash particles | Module entry |

**Each module gets a themed effect** — not a single global effect. This keeps effects contextual and avoids visual noise.

---

## File Changes Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `lib/shuffle.ts` | CREATE | ~40 lines |
| `hooks/useQuizShuffle.ts` | CREATE | ~35 lines |
| `components/ScenarioCard.tsx` | MODIFY | +8 lines |
| `components/module3/MulaDineroDetector.tsx` | MODIFY | +10 lines |
| `components/module3/ExtorsionResponse.tsx` | MODIFY | +10 lines |
| `components/module6/MicroActivities.tsx` | MODIFY | +12 lines |
| `components/ModuleBackground.tsx` | CREATE | ~25 lines |
| `components/three/ThreeScene.tsx` | CREATE | ~60 lines |
| `components/three/StaticGradient.tsx` | CREATE | ~20 lines |
| `lib/three-effects.ts` | CREATE | ~80 lines |

**Total new code:** ~290 lines across 10 files
**Total modified code:** ~40 lines across 4 files

---

## Testing Strategy

### Unit Tests

**`lib/shuffle.ts`**
```typescript
describe('shuffleArray', () => {
  it('returns same length as input', () => { ... });
  it('does not mutate original array', () => { ... });
  it('produces same order with same seed', () => { ... });
  it('produces different order with different seeds', () => { ... });
  it('handles empty array', () => { ... });
  it('handles single-element array', () => { ... });
});
```

**`hooks/useQuizShuffle.ts`**
```typescript
describe('useQuizShuffle', () => {
  it('returns shuffled items', () => { ... });
  it('getOriginalIndex maps back correctly', () => { ... });
  it('shuffles once per session key', () => { ... });
});
```

### Integration Tests

**Component rendering:**
```typescript
describe('ScenarioCard quiz shuffle', () => {
  it('renders shuffled options', () => { ... });
  it('correct answer still works after shuffle', () => { ... });
});
```

### E2E Tests

- Verify quiz answers are in different positions across page loads
- Verify correct answer detection still works
- Verify Three.js fallback renders for reduced-motion users

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Three.js breaks static export | High | `next/dynamic` with `ssr: false` + test build before merge |
| Bundle size exceeds 150KB budget | Medium | Lazy-load Three.js per module, tree-shake unused features |
| Shuffle breaks answer checking | High | `getOriginalIndex` mapping + unit tests for all 4 components |
| Session storage quota exceeded | Low | Seeds are small (~10 bytes), clean up on session end |
| Reduced-motion users see broken UI | Medium | Static gradient fallback + test with `prefers-reduced-motion` |

---

## QA Strategy

### Manual Testing Checklist

- [ ] Quiz answers appear in different order on page refresh
- [ ] Correct answer detection works after shuffle
- [ ] Score calculation remains accurate
- [ ] Three.js effects load on module entry
- [ ] Reduced-motion preference disables Three.js animation
- [ ] Static export (`next build`) succeeds
- [ ] Bundle size within budget (~150KB gzipped)

### Automated Testing

- [ ] Unit tests for `shuffleArray` (all edge cases)
- [ ] Unit tests for `useQuizShuffle` hook
- [ ] Integration tests for all 4 quiz components
- [ ] E2E test for shuffle persistence across page loads

---

## Implementation Order

1. **Create `lib/shuffle.ts`** — Pure utility, no dependencies
2. **Create `hooks/useQuizShuffle.ts`** — Depends on shuffle utility
3. **Modify `ScenarioCard.tsx`** — Simplest integration (boolean-based checking)
4. **Modify `module3/MulaDineroDetector.tsx`** — Index-based checking
5. **Modify `module3/ExtorsionResponse.tsx`** — Index-based checking
6. **Modify `module6/MicroActivities.tsx`** — Inline data + nested shuffling
7. **Create `components/three/StaticGradient.tsx`** — Fallback UI
8. **Create `components/three/ThreeScene.tsx`** — Three.js wrapper
9. **Create `components/ModuleBackground.tsx`** — Lazy-load orchestrator
10. **Write tests** — Unit + integration

**Why this order?**
- Shuffle utility is foundation — build it first
- Test shuffle with simplest component (ScenarioCard) before tackling complex ones
- Three.js is independent — can be done in parallel but sequenced after quiz logic
- Static fallback exists before Three.js scene — ensures graceful degradation
