/**
 * Educational Mediator — Core Types
 *
 * Re-exports the full type system from educational.ts and adds
 * mediator-specific types not present in the base module.
 *
 * @module types/educationalMediator
 */

// ─── Re-exports from base educational types ──────────────────────────────────

export type {
  MediatorState,
  MediatorTrigger,
  CognitiveConflict,
  AttackerTechnique,
  ScaffoldingLevel,
  ScaffoldingTip,
  VisualGuide,
  DebriefPromptType,
  DebriefPrompt,
  DebriefOption,
  CompetencyTag,
  MetacognitiveDebrief,
  EducationalLayer,
  ActivityType,
  MediatorHook,
  MediatorContextValue,
  GamePauseContextValue,
  MediatorEvent,
  ScaffoldingProgress,
  MediatorConfig,
  EducationalPanelProps,
  TipBadgeProps,
  DebriefDialogProps,
  NotebookPanelProps,
  JsonCognitiveConflict,
  JsonScaffoldingTip,
  JsonVisualGuide,
  JsonDebriefPrompt,
  JsonDebriefOption,
  JsonMetacognitiveDebrief,
  JsonEducationalLayer,
} from './educational'

export type { MediatorAction } from './educational'

// ─── Mediator-specific types ────────────────────────────────────────────────

/** A single entry in the Operator Logbook (localStorage-persisted). */
export interface NotebookEntry {
  id: string
  scenarioId: string
  moduleName: string
  timestamp: number
  reflection: string
  conflictQuestion: string
  scaffoldingHint: string
  /** Player's self-assessment: 1 (confused) to 5 (mastered) */
  selfAssessment: number
}

/** Metacognitive reflection captured after a scenario debrief. */
export interface DebriefReflection {
  /** What went wrong — student's description of the error */
  whatWentWrong: string
  /** Why it happened — root cause analysis */
  whyItHappened: string
  /** What was learned — conceptual takeaway */
  learned: string
  /** Optional additional notes */
  notes?: string
}

/** Discriminated union for mediator actions (readonly). */
export type ReadonlyMediatorAction = Readonly<
  | { type: 'TRIGGER'; payload?: { readonly trigger: import('./educational').MediatorTrigger; readonly layer?: import('./educational').EducationalLayer } }
  | { type: 'DISMISS' }
  | { type: 'ANSWER'; payload?: { readonly answer: string | number } }
  | { type: 'COMPLETE_DEBRIEF' }
>
