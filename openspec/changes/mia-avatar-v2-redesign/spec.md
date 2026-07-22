# Spec: mia-avatar-v2-redesign

Delta specs for three capabilities: new `mia-quiz-reactivity`, modified `mia-agent`, modified `mia-dialogues`.

---

## Capability 1: `mia-quiz-reactivity` (NEW)

### Purpose

Wire quiz components to MIA's emotion system so MIA reacts when students answer quiz questions — correct, incorrect, or during processing/thinking phases.

### Interface Contract

```typescript
// ── Callback type ──────────────────────────────────────────────────────────────
// Added to quiz component prop interfaces as an OPTIONAL callback.
// Parent module components wire this via useMIA().triggerMIA.

type MIAEmotionCallback = (emotion: MIAEmotion) => void

// ── Quiz component prop additions ──────────────────────────────────────────────
// Every quiz component that produces a score event gains:

interface QuizMIAProps {
  /** Optional: signal MIA emotion on answer events */
  onMIAEmotion?: MIAEmotionCallback
}

// ── Concrete prop interfaces (before → after) ──────────────────────────────────

// ScenarioCard (module0)
interface ScenarioCardProps {
  scenario: Escenario
  onAnswer: (puntos: number, categoria: string) => void
  onMIAEmotion?: MIAEmotionCallback  // ← NEW
}

// DeepfakeDetector (module5)
interface Props {
  artifacts: DeepfakeArtifact[]
  explicacion: string
  fuente: string
  pregunta: string
  opciones: string[]
  respuestaCorrecta: number
  onScore: (points: number) => void
  onComplete: () => void
  onMIAEmotion?: MIAEmotionCallback  // ← NEW
}

// DragDropActivity (module1, module2, module3)
interface DragDropActivityProps {
  ejercicios: Ejercicio[]
  onScore: (points: number, category?: Module1Category) => void
  onComplete: () => void
  onMIAEmotion?: MIAEmotionCallback  // ← NEW
}

// MicroActivities (module1–module6 — each file has its own Props)
// Pattern: add `onMIAEmotion?: MIAEmotionCallback` to Props interface

// MicroActivity (shared, module0)
interface MicroActivityProps {
  activityId: string
  title: string
  description: string
  onComplete: () => void
  onMIAEmotion?: MIAEmotionCallback  // ← NEW (if applicable — check completion events)
}
```

### Behavior Spec

| Event | Quiz Component fires | MIA Emotion |
|-------|---------------------|-------------|
| Student answers correctly | `onMIAEmotion?.('CORRECT')` | MIA shows CORRECT emotion + dialogue |
| Student answers incorrectly | `onMIAEmotion?.('INCORRECT')` | MIA shows INCORRECT emotion + dialogue |
| Quiz enters loading/processing phase (before feedback) | `onMIAEmotion?.('THINKING')` | MIA shows THINKING emotion + dialogue |

**When `onMIAEmotion` is NOT provided**: quiz component works identically to today — MIA remains unaffected. The prop is optional to avoid breaking any component that doesn't wire it.

**When `onMIAEmotion` IS provided**: the callback is called at the exact moment of the score event, BEFORE the parent's `onScore`/`onAnswer`/`onComplete` is called. This ensures MIA reacts before the parent processes the result.

### Wiring Pattern (Module Pages)

Module pages/components that render quiz children must:
1. Import and call `useMIA()` to obtain `triggerMIA`
2. Pass `triggerMIA` as the `onMIAEmotion` prop to each quiz child

```typescript
// Example: app/modulo5/page.tsx
'use client'
import { useMIA } from '@/hooks/useMIA'

export default function Modulo5Page() {
  const { triggerMIA } = useMIA()

  // ... existing state ...

  return (
    <DeepfakeDetector
      {...existingProps}
      onMIAEmotion={triggerMIA}  // ← NEW
    />
    <MicroActivities
      {...existingProps}
      onMIAEmotion={triggerMIA}  // ← NEW
    />
  )
}
```

**Important**: Since `useMIA` is a hook, only client components can call it. Module pages are already client components (`'use client'`). The `triggerMIA` function reference is stable (wrapped in `useCallback`), so passing it as a prop does not cause re-renders.

### Components Requiring Modification

| Component | File | Module | Has Score Events |
|-----------|------|--------|-----------------|
| `ScenarioCard` | `components/ScenarioCard.tsx` | 0 | Yes — `onAnswer(puntos, categoria)` |
| `MicroActivity` | `components/MicroActivity.tsx` | 0 | Yes — `onComplete()` (ordering puzzle) |
| `DragDropActivity` | `components/module1/DragDropActivity.tsx` | 1 | Yes — `onScore(points, category?)` |
| `MicroActivities` | `components/module1/MicroActivities.tsx` | 1 | Yes — `onScore(points, category?)` |
| `MicroActivities` | `components/module2/MicroActivities.tsx` | 2 | Yes — `onScore(points, category?)` |
| `DragDropDefense` | `components/module2/DragDropDefense.tsx` | 2 | Yes — `onScore(points, category?)` |
| `SeñalesDragDrop` | `components/module3/SeñalesDragDrop.tsx` | 3 | Yes — `onScore(points, category?)` |
| `MicroActivities` | `components/module3/MicroActivities.tsx` | 3 | Yes — `onScore(points, category?)` |
| `MicroActivities` | `components/module4/MicroActivities.tsx` | 4 | Yes — `onScore(points, category?)` |
| `DeepfakeDetector` | `components/module5/DeepfakeDetector.tsx` | 5 | Yes — `onScore(points)` |
| `MicroActivities` | `components/module5/MicroActivities.tsx` | 5 | Yes — `onScore(points, category?)` |
| `MicroActivities` | `components/module6/MicroActivities.tsx` | 6 | Yes — `onScore(points, category?)` |

**Module pages** that must wire `triggerMIA`:
- `app/modulo0/page.tsx` (or `Modulo0Game.tsx`) → `ScenarioCard`, `MicroActivity`
- `app/modulo1/` (or `Module1Game.tsx`) → `DragDropActivity`, `MicroActivities`
- `app/modulo2/page.tsx` → `MicroActivities`
- `app/modulo3/page.tsx` → `MicroActivities`
- `app/modulo4/page.tsx` → `MicroActivities`
- `app/modulo5/page.tsx` → `DeepfakeDetector`, `MicroActivities`
- `app/modulo6/page.tsx` → `MicroActivities`

### Scenario Examples

**Scenario 1: Student answers a DeepfakeDetector correctly**
1. Student classifies artifact as "deepfake" → `handleClassify('deepfake')` runs
2. `isCorrect = true` → `playCorrect()` called
3. `onMIAEmotion?.('CORRECT')` called BEFORE `onScore(4)`
4. MIA transitions to CORRECT emotion → glow turns green (#22c55e), label "¡Correcto!", emoji "✅"
5. MIA selects random CORRECT dialogue for module 5 (e.g., "¡Excelente ojo! Ese deepfake no te engañó.")
6. Speech bubble appears with typewriter effect

**Scenario 2: Student answers a ScenarioCard incorrectly**
1. Student selects wrong option → `handleSelect(opcionId, puntos, false)` runs
2. `esCorrecta = false` → `playIncorrect()` called
3. `onMIAEmotion?.('INCORRECT')` called BEFORE `onAnswer(0, categoria)`
4. MIA transitions to INCORRECT emotion → glow turns red (#ef4444), label "Ups…", emoji "❌"
5. MIA selects random INCORRECT dialogue for module 0 (e.g., "Esa opción tenía un dominio manipulado. Revisa la URL completa.")
6. Speech bubble appears

**Scenario 3: MicroActivities enters processing phase**
1. Student submits answer in MicroActivities
2. BEFORE the correctness check: `onMIAEmotion?.('THINKING')` called
3. MIA transitions to THINKING emotion → glow turns amber (#f59e0b), label "Procesando…", emoji " "
4. MIA shows THINKING dialogue (e.g., "Analizando tu respuesta…")
5. After ~1.5s, CORRECT or INCORRECT fires, replacing THINKING

---

## Capability 2: `mia-agent` (MODIFIED)

### Interface Contract

```typescript
// ── Extended MIAEmotion type ───────────────────────────────────────────────────
// types/mia.ts — BEFORE:
export type MIAEmotion =
  | 'IDLE'
  | 'EXCITED'
  | 'SAMPLED_ERROR'
  | 'MISSION_BRIEF'
  | 'PROVIDING_CLUE'

// AFTER:
export type MIAEmotion =
  | 'IDLE'
  | 'EXCITED'
  | 'SAMPLED_ERROR'
  | 'MISSION_BRIEF'
  | 'PROVIDING_CLUE'
  | 'CORRECT'      // ← NEW: quiz answer was correct
  | 'INCORRECT'    // ← NEW: quiz answer was incorrect
  | 'THINKING'     // ← NEW: quiz processing/loading phase

// ── EMOTION_STYLES additions (MIAAgent.tsx) ────────────────────────────────────

CORRECT: {
  border: '#22c55e',
  glow: '0 0 14px rgba(34,197,94,0.4), 0 0 6px rgba(34,197,94,0.5)',
  label: '¡Correcto!',
  emoji: '✅',
  color: '#22c55e',
},
INCORRECT: {
  border: '#ef4444',
  glow: '0 0 14px rgba(239,68,68,0.4), 0 0 6px rgba(239,68,68,0.5)',
  label: 'Ups…',
  emoji: '❌',
  color: '#ef4444',
},
THINKING: {
  border: '#f59e0b',
  glow: '0 0 14px rgba(245,158,11,0.4), 0 0 6px rgba(245,158,11,0.5)',
  label: 'Procesando…',
  emoji: ' ',
  color: '#f59e0b',
},

// ── Avatar animation variants (MIAAgent.tsx) ───────────────────────────────────
// New entries in avatarVariants:

correct: {
  scale: [1, 1.2, 1],
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 8,
    duration: 0.5,
  },
},
incorrect: {
  x: [0, -6, 6, -6, 6, 0],
  transition: { duration: 0.5 },
},
thinking: {
  rotate: [0, 5, -5, 5, -5, 0],
  transition: { duration: 1.5, repeat: Infinity, repeatDelay: 0.5 },
},

// ── Cooldown behavior (hooks/useMIA.ts) ────────────────────────────────────────
// BEFORE: single COOLDOWN_MS = 3000 for all triggers
// AFTER: dual cooldown — 1.5s for quiz triggers, 3s for HUD triggers

const COOLDOWN_HUD_MS = 3000     // shield, XP, challenge completion
const COOLDOWN_QUIZ_MS = 1500    // CORRECT, INCORRECT, THINKING

// useMIA().triggerMIA now accepts an optional source parameter:
triggerMIA: (emotion: MIAEmotion, moduleId?: number, source?: 'hud' | 'quiz') => void

// Internal cooldown uses the source to pick the right duration:
const getCooldown = (source?: 'hud' | 'quiz') =>
  source === 'quiz' ? COOLDOWN_QUIZ_MS : COOLDOWN_HUD_MS
```

### Behavior Spec

**Emotion state transitions:**

```
                    ┌──────────┐
         ┌─────────│   IDLE   │◄────────────────┐
         │         └──────────┘                  │
         │              │                        │
    quiz trigger    HUD trigger              auto-dismiss
         │              │                        │
         ▼              ▼                        │
  ┌─────────────┐  ┌──────────┐                 │
  │CORRECT/     │  │EXCITED/  │                 │
  │INCORRECT/   │  │SAMPLED_  │                 │
  │THINKING     │  │ERROR/etc │                 │
  └──────┬──────┘  └────┬─────┘                 │
         │              │                        │
         └──────────────┴────────────────────────┘
                  (any emotion → IDLE after AUTO_DISMISS_MS)
```

**Cooldown rules:**
- HUD-triggered emotions (EXCITED, SAMPLED_ERROR, MISSION_BRIEF, PROVIDING_CLUE): 3000ms cooldown between changes
- Quiz-triggered emotions (CORRECT, INCORRECT, THINKING): 1500ms cooldown between changes
- `applyEmotion` and `triggerMIA` both respect cooldowns
- If a quiz trigger arrives during HUD cooldown (or vice versa), it is still blocked — cooldown is global (single `lastEmotionChange` ref), not per-source

**THINKING → CORRECT/INCORRECT transition:**
- When THINKING fires, it starts the 8s auto-dismiss timer
- If CORRECT or INCORRECT fires within 8s, it replaces THINKING (resets dismiss timer)
- The `lastEmotionChange` cooldown still applies — if THINKING fired < 1.5s ago, the CORRECT/INCORRECT trigger is silently dropped
- **Mitigation**: Quiz components should NOT fire THINKING and then immediately fire CORRECT/INCORRECT. The THINKING state should be used only when there's a genuine processing delay (e.g., animation, async validation). In practice, most quiz components will fire CORRECT/INCORRECT directly without THINKING.

**Fallback chain (unchanged):**
- selectDialogue still falls back: moduleId → moduleId 0 → IDLE → any
- New emotions participate in the same fallback chain

### Scenario Examples

**Scenario: Rapid correct answers (cooldown test)**
1. t=0ms: Student answers Q1 correctly → `triggerMIA('CORRECT', 5, 'quiz')` → MIA shows CORRECT
2. t=800ms: Student answers Q2 correctly → `triggerMIA('CORRECT', 5, 'quiz')` → BLOCKED (1.5s cooldown)
3. t=1600ms: Student answers Q3 correctly → `triggerMIA('CORRECT', 5, 'quiz')` → MIA shows CORRECT (cooldown expired)

**Scenario: HUD + quiz interleaving**
1. t=0ms: Student gains XP → `applyEmotion('EXCITED')` → MIA shows EXCITED
2. t=1000ms: Student answers quiz correctly → `triggerMIA('CORRECT', 2, 'quiz')` → BLOCKED (3s HUD cooldown)
3. t=3500ms: Student answers quiz correctly → `triggerMIA('CORRECT', 2, 'quiz')` → MIA shows CORRECT

---

## Capability 3: `mia-dialogues` (MODIFIED)

### Interface Contract

```typescript
// ── MIADialogueEntry — unchanged schema ────────────────────────────────────────
// The existing interface works as-is. New emotions are just new values for the
// `emotion` field. No schema changes needed.

// ── New emotion values in dialogue bank ────────────────────────────────────────
// Each module (0–6) gets 3 dialogue entries per new emotion:
// - CORRECT: positive reinforcement after correct quiz answer
// - INCORRECT: constructive feedback after incorrect answer
// - THINKING: MIA "processing" while quiz evaluates

// Total new entries: 3 emotions × 7 modules × 3 entries = 63 entries
```

### Dialogue Content Requirements

All dialogue text must be in **Spanish (Latin American Loja/Ecuador)**. Tone:
- **CORRECT**: Enthusiastic, encouraging, uses "¡" and "!" — celebrates the student
- **INCORRECT**: Supportive, constructive, never condescending — teaches from the mistake
- **THINKING**: Playful, brief — gives MIA personality while waiting

**Naming convention**: IDs follow the existing pattern: `m{moduleId}-{emotion-prefix}-{n}`

| Emotion | ID prefix | Example |
|---------|-----------|---------|
| CORRECT | `m{N}-correct-{n}` | `m0-correct-1` |
| INCORRECT | `m{N}-incorrect-{n}` | `m0-incorrect-1` |
| THINKING | `m{N}-thinking-{n}` | `m0-thinking-1` |

### Scenario Examples

**Module 0 — CORRECT entries:**
```json
{ "id": "m0-correct-1", "moduleId": 0, "emotion": "CORRECT", "text": "¡Respuesta correcta! Tu instinto de ciberseguridad está mejorando." },
{ "id": "m0-correct-2", "moduleId": 0, "emotion": "CORRECT", "text": "¡Exacto! Identificaste la amenaza correctamente. Sigue así." },
{ "id": "m0-correct-3", "moduleId": 0, "emotion": "CORRECT", "text": "¡Bien hecho! Esa era la opción segura. +XP" }
```

**Module 0 — INCORRECT entries:**
```json
{ "id": "m0-incorrect-1", "moduleId": 0, "emotion": "INCORRECT", "text": "No era esa, pero no te preocupes. Revisa la URL completa la próxima vez." },
{ "id": "m0-incorrect-2", "moduleId": 0, "emotion": "INCORRECT", "text": "Casi! Ese enlace tenía un dominio sospechoso. Mira los caracteres con cuidado." },
{ "id": "m0-incorrect-3", "moduleId": 0, "emotion": "INCORRECT", "text": "Hmm, esa opción era un cebo de phishing. Analiza los headers del correo." }
```

**Module 0 — THINKING entries:**
```json
{ "id": "m0-thinking-1", "moduleId": 0, "emotion": "THINKING", "text": "Procesando tu respuesta… un momento." },
{ "id": "m0-thinking-2", "moduleId": 0, "emotion": "THINKING", "text": "Analizando… mis sensores están trabajando." },
{ "id": "m0-thinking-3", "moduleId": 0, "emotion": "THINKING", "text": "Verificando… dame un segundo." }
```

**Full entry set per module (7 modules × 3 emotions × 3 entries = 63 total):**
- Modules 1–6 follow the same pattern, with module-specific vocabulary (reconocimiento, malware, cifrado, red, phishing, incidentes)

### Behavior Spec

**Dialogue selection (unchanged logic, new emotions participate):**
1. `selectDialogue('CORRECT', moduleId)` → filter by emotion=CORRECT + moduleId → random pick
2. Fallback: moduleId 0 → IDLE → any
3. Dedup window still applies — same dialogue ID won't repeat within 60s

**Integration with existing EXCITED emotion:**
- CORRECT is distinct from EXCITED: CORRECT = quiz-specific feedback, EXCITED = HUD-driven (XP gain, challenge completion)
- Both can fire in sequence: student answers correctly → CORRECT fires → XP updates → EXCITED fires
- Cooldown prevents rapid switching; the 1.5s quiz cooldown and 3s HUD cooldown handle this

---

## Cross-Cutting Concerns

### TypeScript Strict Mode

- All new types must have zero `any` usage
- `onMIAEmotion?` is optional — quiz components compile without it
- `MIAEmotion` union exhaustive checks: `getAvatarVariant` and `EMOTION_STYLES` must handle all 8 emotions (TypeScript will enforce via `Record<MIAEmotion, ...>`)

### Accessibility

- `aria-live="polite"` already on MIA container — new emotions will announce correctly
- Emoji in EMOTION_STYLES labels provide visual + text cue
- No new screen reader announcements needed beyond existing pattern

### Performance

- 63 new dialogue entries in JSON: negligible size increase (~4KB)
- `selectDialogue` filter runs on array of ~142 entries (79 existing + 63 new): no performance concern
- `onMIAEmotion` callback is a function reference from `useCallback` — no re-render cascade

### Rollback

Each capability can be reverted independently:
1. Remove `onMIAEmotion` prop from quiz interfaces → quiz components work as before
2. Remove CORRECT/INCORRECT/THINKING from `MIAEmotion` union → TypeScript catches all references
3. Remove new dialogue entries from JSON → empty array returns null, fallback chain handles it
