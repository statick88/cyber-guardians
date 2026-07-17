/**
 * Modelo Pedagógico Estricto — CyberGuardians Console Edition
 * 
 * Principios:
 * 1. Error Constructivo: El error es conflicto cognitivo, no castigo
 * 2. Metacognición de Cierre: Autoevaluación cualitativa post-misión
 * 3. Andamiaje Dinámico (ZDP): Retirada gradual de apoyo
 * 
 * Cero `any` — Tipado estricto para build estático (output: 'export')
 */

// ─── Niveles de Andamiaje (Zona de Desarrollo Próximo) ────────────────────────

export type ScaffoldingLevel = 'explicit' | 'guided' | 'implicit' | 'withdrawn';

export interface ScaffoldingTip {
  level: ScaffoldingLevel;
  hint: string;
  /** Guía visual opcional (overlay, highlight, tooltip) */
  visualGuide?: VisualGuide;
}

export interface VisualGuide {
  type: 'highlight' | 'tooltip' | 'overlay' | 'arrow';
  targetSelector: string;       // CSS selector del elemento a guiar
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  autoDismiss?: number;         // ms, null = manual
}

// ─── Conflicto Cognitivo (Error Constructivo) ────────────────────────────────

export interface CognitiveConflict {
  /** Pregunta socrática que expone la discrepancia mental */
  question: string;
  /** Pregunta de seguimiento para profundizar */
  followUp?: string;
  /** Insight esperado que el estudiante debe construir */
  expectedInsight: string;
  /** Técnica psicológica del atacante que se está explotando */
  attackerTechnique?: AttackerTechnique;
  /** Evidencia en la interfaz que contradice la creencia errónea */
  contradictingEvidence?: string[];
}

export type AttackerTechnique =
  | 'urgency_pressure'        // Presión de urgencia artificial
  | 'authority_impersonation' // Suplantación de autoridad
  | 'social_proof'            // Prueba social falsa
  | 'scarcity'                // Escasez artificial
  | 'fear_intimidation'       // Miedo / intimidación
  | 'reciprocity'             // Reciprocidad manipulada
  | 'familiarity'             // Familiaridad engañosa (typosquatting, lookalikes)
  | 'curiosity_gap'           // Brecha de curiosidad (clickbait)
  | 'emotional_manipulation'  // Manipulación emocional (vishing)
  | 'technical_obfuscation';  // Ofuscación técnica (homógrafos, encoding)

// ─── Debrief Metacognitivo (Cierre Reflexivo) ────────────────────────────────

export type DebriefPromptType = 'slider' | 'micro-decision' | 'open-reflection';

export interface DebriefPrompt {
  id: string;
  type: DebriefPromptType;
  /** Pregunta reflexiva principal */
  prompt: string;
  /** Para slider: etiquetas de extremos */
  sliderLabels?: { min: string; max: string };
  /** Para micro-decisión: opciones cualitativas */
  options?: DebriefOption[];
  /** Para open-reflection: guía de escritura */
  reflectionGuide?: string;
  /** Clave de almacenamiento en Notebook */
  storageKey: string;
  /** Competencia evaluada */
  competency: CompetencyTag;
}

export interface DebriefOption {
  id: string;
  label: string;
  /** Qué revela esta opción sobre el proceso cognitivo del estudiante */
  cognitiveInsight: string;
}

export type CompetencyTag =
  | 'threat_identification'       // Identificación de amenazas
  | 'evidence_analysis'           // Análisis de evidencias
  | 'decision_under_pressure'     // Decisión bajo presión
  | 'metacognitive_regulation'    // Autorregulación metacognitiva
  | 'knowledge_transfer'          // Transferencia de conocimiento
  | 'emotional_regulation';       // Regulación emocional

export interface MetacognitiveDebrief {
  prompts: DebriefPrompt[];
  /** Pregunta de síntesis final */
  synthesisQuestion?: string;
}

// ─── Capa Educativa por Escenario ────────────────────────────────────────────

export interface EducationalLayer {
  /** Identificador único del escenario */
  scenarioId: string;
  /** Módulo al que pertenece */
  moduleId: number;
  /** Tipo de actividad */
  activityType: ActivityType;
  
  // Pilar 1: Error Constructivo
  conflictQuestion: CognitiveConflict;
  
  // Pilar 2: Andamiaje Dinámico
  scaffoldingTip: ScaffoldingTip;
  /** Sobrescrituras de pistas por nivel (opcional) */
  scaffoldingOverrides?: Partial<Record<ScaffoldingLevel, string>>;
  
  // Pilar 3: Metacognición de Cierre
  metacognitiveDebrief: MetacognitiveDebrief;
  
  // Gancho de mediación
  mediatorHook: MediatorHook;
}

export type ActivityType =
  | 'email_analysis'
  | 'url_inspection'
  | 'phishing_scenario'
  | 'security_quiz'
  | 'drag_drop_classification'
  | 'micro_activity'
  | 'password_strength'
  | 'mfa_simulation'
  | 'social_media_audit'
  | 'identity_theft_response'
  | 'vishing_decoder'
  | 'chat_simulation'
  | 'money_mule_analysis'
  | 'extortion_response'
  | 'signal_classification'
  | 'code_defuse'
  | 'crypto_challenge'
  | 'hardening_checklist'
  | 'cookie_sweeper'
  | 'metadata_extractor'
  | 'email_deconstructor';

export type MediatorHook = 'onError' | 'onProgress' | 'onCompletion' | 'onIntro' | 'onTipRequest';

// ─── Trigger del Mediador ────────────────────────────────────────────────────

export type MediatorTrigger = 'onIntro' | 'onTipRequest' | 'onError' | 'onModuleComplete';

// ─── Acciones del Mediador ───────────────────────────────────────────────────

export type MediatorAction =
  | { type: 'TRIGGER'; payload?: { trigger: MediatorTrigger; layer?: EducationalLayer } }
  | { type: 'DISMISS' }
  | { type: 'ANSWER'; payload?: { answer: string | number } }
  | { type: 'COMPLETE_DEBRIEF' };

// ─── Contexto del Mediador ───────────────────────────────────────────────────

export interface MediatorContextValue {
  state: MediatorState;
  currentLayer: EducationalLayer | null;
  triggerMediator: (trigger: MediatorTrigger, layer?: EducationalLayer) => void;
  dismissMediator: () => void;
  answerMediator: (answer: string | number) => void;
  completeDebrief: () => void;
  isPaused: boolean;
}

// ─── Contexto de Pausa del Juego ─────────────────────────────────────────────

export interface GamePauseContextValue {
  isPaused: boolean;
  pauseGame: () => void;
  resumeGame: () => void;
  registerGame: (id: string, pause: () => void, resume: () => void) => void;
  unregisterGame: (id: string) => void;
}

// ─── Estado del Mediador (Máquina de Estados) ────────────────────────────────

export type MediatorState =
  | 'idle'
  | 'onIntro'
  | 'onTipRequested'
  | 'onErrorConstructive'
  | 'onMetaReflection';

export interface MediatorEvent {
  type: MediatorState;
  payload?: {
    educationalLayer?: EducationalLayer;
    scenarioId?: string;
    userAnswer?: unknown;
    correctAnswer?: unknown;
  };
}

// ─── Progreso de Andamiaje (Persistente por Tipo de Escenario) ───────────────

export interface ScaffoldingProgress {
  scenarioType: ActivityType;
  errorCount: number;
  correctStreak: number;
  currentLevel: ScaffoldingLevel;
  lastUpdated: number;
}

// ─── Configuración del Mediador ──────────────────────────────────────────────

export interface MediatorConfig {
  /** Habilitado globalmente (build-time flag) */
  enabled: boolean;
  /** Mostrar intro en primera visita */
  showIntro: boolean;
  /** Umbral de errores para activar mediación constructiva */
  errorThreshold: number;
  /** Tiempo mínimo entre intervenciones (ms) */
  cooldownMs: number;
  /** Nivel inicial de andamiaje por defecto */
  defaultScaffoldingLevel: ScaffoldingLevel;
}

// ─── Panel Educativo (Props) ─────────────────────────────────────────────────

export interface EducationalPanelProps {
  state: MediatorState;
  educationalLayer?: EducationalLayer;
  scaffoldingProgress?: ScaffoldingProgress;
  onDismiss: () => void;
  onRequestTip?: () => void;
  onRespondToConflict?: (response: string) => void;
}

export interface TipBadgeProps {
  tip: ScaffoldingTip;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export interface DebriefDialogProps {
  prompts: DebriefPrompt[];
  onComplete: (responses: Record<string, unknown>) => void;
  onSkip: () => void;
  moduleName: string;
  scenarioId?: string;
}

export interface NotebookPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Tipos para Datos JSON (Serializables) ───────────────────────────────────

export interface JsonCognitiveConflict {
  question: string;
  followUp?: string;
  expectedInsight: string;
  attackerTechnique?: AttackerTechnique;
  contradictingEvidence?: string[];
}

export interface JsonScaffoldingTip {
  level: ScaffoldingLevel;
  hint: string;
  visualGuide?: JsonVisualGuide;
}

export interface JsonVisualGuide {
  type: 'highlight' | 'tooltip' | 'overlay' | 'arrow';
  targetSelector: string;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  autoDismiss?: number;
}

export interface JsonDebriefPrompt {
  id: string;
  type: DebriefPromptType;
  prompt: string;
  sliderLabels?: { min: string; max: string };
  options?: JsonDebriefOption[];
  reflectionGuide?: string;
  storageKey: string;
  competency: CompetencyTag;
}

export interface JsonDebriefOption {
  id: string;
  label: string;
  cognitiveInsight: string;
}

export interface JsonMetacognitiveDebrief {
  prompts: JsonDebriefPrompt[];
  synthesisQuestion?: string;
}

export interface JsonEducationalLayer {
  scenarioId: string;
  moduleId: number;
  activityType: ActivityType;
  conflictQuestion: JsonCognitiveConflict;
  scaffoldingTip: JsonScaffoldingTip;
  scaffoldingOverrides?: Partial<Record<ScaffoldingLevel, string>>;
  metacognitiveDebrief: JsonMetacognitiveDebrief;
  mediatorHook: MediatorHook;
}