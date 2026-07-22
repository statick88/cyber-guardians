/**
 * MIA Agent — Type definitions.
 * MIA is the in-game AI companion that reacts to player actions
 * with contextual dialogue and emotional state changes.
 */

/** Emotional states MIA can display */
export type MIAEmotion =
  | 'IDLE'
  | 'EXCITED'
  | 'SAMPLED_ERROR'
  | 'MISSION_BRIEF'
  | 'PROVIDING_CLUE'
  | 'CORRECT'
  | 'INCORRECT'
  | 'THINKING'

/** A single dialogue line from MIA */
export interface MIADialogueEntry {
  /** Unique identifier for this dialogue entry */
  id: string
  /** Module this dialogue belongs to (0–6) */
  moduleId: number
  /** Emotional state when this dialogue should be shown */
  emotion: MIAEmotion
  /** The dialogue text MIA displays */
  text: string
  /** Optional condition for this dialogue to be eligible */
  condition?: string
}

/** Schema for the dialogue bank JSON */
export interface MIADialogueSchema {
  dialogues: MIADialogueEntry[]
}

/** Runtime state of the MIA agent */
export interface MIAAgentState {
  /** Current emotional state */
  emotion: MIAEmotion
  /** The dialogue entry currently being displayed, or null */
  currentDialogue: MIADialogueEntry | null
  /** Whether MIA's speech bubble is visible */
  isVisible: boolean
  /** Timestamp (ms) of the last emotion change */
  lastTriggered: number
}

/** Return type for the useMIA hook */
export interface UseMIAReturn {
  /** Current MIA emotional state */
  emotion: MIAEmotion
  /** Current dialogue entry being shown */
  currentDialogue: MIADialogueEntry | null
  /** Whether MIA is visible */
  isVisible: boolean
  /** Manually trigger MIA with an emotion, optionally for a specific module and source */
  triggerMIA: (emotion: MIAEmotion, moduleId?: number, source?: 'hud' | 'quiz') => void
  /** Immediately dismiss the speech bubble */
  dismissMIA: () => void
}

/** Callback type for quiz components to emit MIA emotions */
export type MIAEmotionCallback = (emotion: MIAEmotion, moduleId: number) => void
