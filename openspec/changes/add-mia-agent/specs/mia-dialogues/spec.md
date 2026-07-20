# MIA Dialogues Specification

## Purpose

Defines the dialogue data system for MIA — a structured JSON bank of contextual dialogue entries segmented by module and emotional state. Dialogues are static (not AI-generated) and provide deterministic, testable content.

## Requirements

### Requirement: Dialogue Schema

Each dialogue entry MUST conform to the `MIADialogueEntry` schema:

```
MIADialogueEntry {
  id: string          — unique identifier (e.g., "m2-excited-01")
  moduleId: number    — 0 for general, 1-6 for specific modules
  emotion: MIAEmotion — one of 5 emotional states
  text: string        — dialogue text (max 120 chars)
  priority: number    — 1=highest, 5=lowest (higher priority entries preferred)
}
```

The system MUST enforce `text` length ≤ 120 characters to fit the speech bubble.

The system MUST assign unique `id` values across the entire bank.

#### Scenario: Valid dialogue entry

- GIVEN a dialogue entry with `id: "m1-excited-01"`, `moduleId: 1`, `emotion: "EXCITED"`, `text: "¡Excelente! Has derrotado al phishing.", `priority: 1`
- WHEN the entry is loaded into the dialogue bank
- THEN it is valid and可用于 selection

#### Scenario: Invalid dialogue entry rejected

- GIVEN a dialogue entry with `text` longer than 120 characters
- WHEN the entry is validated
- THEN it is flagged as invalid
- AND a development-mode warning is logged

### Requirement: Module Segmentation

The dialogue bank MUST be structured by `moduleId` as top-level keys:

```
{
  "0": { "IDLE": [...], "EXCITED": [...], ... },
  "1": { "IDLE": [...], "EXCITED": [...], ... },
  ...
  "6": { "IDLE": [...], "EXCited": [...], ... }
}
```

Module `0` contains general dialogues used as fallback for all modules.

Modules `1`-`6` correspond to the existing CyberGuardians course modules.

#### Scenario: Module-specific dialogue lookup

- GIVEN the dialogue bank has entries for `moduleId: 2`
- WHEN `currentModule` is `2` and emotion is `EXCITED`
- THEN only entries from `bank["2"]["EXCITED"]` are considered

#### Scenario: Missing module falls back to general

- GIVEN the dialogue bank has no entries for `moduleId: 4`
- WHEN `currentModule` is `4` and emotion is `EXCITED`
- THEN entries from `bank["0"]["EXCITED"]` are used

### Requirement: Emotional State Mapping

Each module section MUST contain entries for all 5 emotional states:

| Emotion | Trigger Context | Dialogue Tone |
|---------|----------------|---------------|
| `IDLE` | No active event, passive presence | Warm, encouraging, curious |
| `EXCITED` | XP gain, challenge completion | Celebratory, energetic, proud |
| `SAMPLED_ERROR` | Shield damage, wrong answer | Empathetic, supportive, reassuring |
| `MISSION_BRIEF` | Module start, new challenge | Focused, instructional, clear |
| `PROVIDING_CLUE` | Hint request, stuck detection | Mysterious, guiding, insightful |

The system MUST have at least 3 dialogue entries per emotion per module (or fallback module).

#### Scenario: Minimum dialogue coverage

- GIVEN the dialogue bank is loaded
- WHEN counting entries per emotion in module `0`
- THEN each emotion has ≥ 3 entries

#### Scenario: Tone consistency

- GIVEN a dialogue entry with `emotion: "SAMPLED_ERROR"`
- WHEN the text is reviewed
- THEN it does NOT contain harsh or discouraging language
- AND it contains supportive or encouraging language

### Requirement: Fallback Chain

The system MUST implement a 3-level fallback chain:

1. **Module-specific**: `bank[currentModule][emotion]` — entries for the active module
2. **General module**: `bank[0][emotion]` — entries for moduleId 0
3. **General emotion**: `bank[0][IDLE]` — ultimate fallback

The system MUST never return empty dialogue — at least one entry is always available.

#### Scenario: Three-level fallback

- GIVEN `currentModule` is 5, emotion is `PROVIDING_CLUE`
- AND `bank["5"]["PROVIDING_CLUE"]` exists with 2 entries
- WHEN dialogue is selected
- THEN one of the 2 entries is randomly chosen

#### Scenario: Two-level fallback

- GIVEN `currentModule` is 3, emotion is `MISSION_BRIEF`
- AND `bank["3"]` has no `MISSION_BRIEF` key
- AND `bank["0"]["MISSION_BRIEF"]` has 4 entries
- WHEN dialogue is selected
- THEN one of the 4 entries from `bank["0"]` is randomly chosen

#### Scenario: Ultimate fallback

- GIVEN `currentModule` is null, emotion is `SAMPLED_ERROR`
- AND `bank["0"]` has no `SAMPLED_ERROR` key
- WHEN dialogue is selected
- THEN a random entry from `bank["0"]["IDLE"]` is returned

### Requirement: Dialogue Shuffle and Deduplication

The system MUST shuffle dialogue selection randomly within the eligible pool.

The system MUST avoid repeating the same dialogue within a 60-second window.

The system MUST track the last 5 displayed dialogue IDs to prevent short-term repetition.

#### Scenario: Random selection

- GIVEN `bank["0"]["EXCITED"]` has 5 entries
- WHEN dialogue is selected 10 times
- THEN at least 3 different entries are shown (statistical expectation)

#### Scenario: No immediate repetition

- GIVEN dialogue `"m0-excited-01"` was shown 10 seconds ago
- WHEN emotion is `EXCITED` and selection occurs
- THEN `"m0-excited-01"` is excluded from the pool
- AND a different entry is selected

#### Scenario: Deduplication window expires

- GIVEN dialogue `"m0-excited-01"` was shown 65 seconds ago
- WHEN emotion is `EXCITED` and selection occurs
- THEN `"m0-excited-01"` is eligible for selection again

### Requirement: Default/Fallback Dialogues

The system MUST include a `miaDialogues.json` file with the following minimum structure:

| Module | IDLE | EXCITED | SAMPLED_ERROR | MISSION_BRIEF | PROVIDING_CLUE |
|--------|------|---------|---------------|---------------|----------------|
| 0 (general) | 5 | 5 | 5 | 5 | 5 |
| 1-6 (per module) | 3 | 3 | 3 | 3 | 3 |

The system MUST include Spanish-language dialogues matching the platform's `lang="es"` setting.

#### Scenario: Spanish language dialogues

- GIVEN the platform uses Spanish (`lang="es"` in layout.tsx)
- WHEN dialogue text is displayed
- THEN it is in Spanish
- AND it uses adolescent-friendly language (not formal/corporate)

#### Scenario: Module 0 has comprehensive coverage

- GIVEN `miaDialogues.json` is loaded
- WHEN counting entries in module `0`
- THEN each emotion has at least 5 entries
- AND total entries ≥ 25

## Data Structure

```json
{
  "0": {
    "IDLE": [
      { "id": "m0-idle-01", "moduleId": 0, "emotion": "IDLE", "text": "...", "priority": 1 }
    ],
    "EXCITED": [...],
    "SAMPLED_ERROR": [...],
    "MISSION_BRIEF": [...],
    "PROVIDING_CLUE": [...]
  },
  "1": { ... },
  "2": { ... },
  "3": { ... },
  "4": { ... },
  "5": { ... },
  "6": { ... }
}
```

## Integration Points

| Component | Integration | Direction |
|-----------|------------|-----------|
| `hooks/useMIA.ts` | Dialogue selection | Reads: currentModule, emotion → returns dialogue text |
| `types/mia.ts` | Schema types | `MIADialogueEntry`, `MIADialogueBank` types |
| `components/shared/MIAgent.tsx` | Display | Receives dialogue text, renders in bubble |
| `data/miaDialogues.json` | Static data | Loaded at build time, no runtime fetching |
