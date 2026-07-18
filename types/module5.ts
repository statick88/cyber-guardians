// ─────────────────────────────────────────────────────────────────────
// CyberGuardians — Module 5: Deepfake Defender
// Defensor contra Deepfakes y Desinformación
//
// Research sources:
//   - UNICEF 2024: Deepfake threats targeting minors in LatAm
//   - Europol 2023: AI-generated content used in disinformation
//   - Sensity AI 2024: 95.5% of deepfakes are non-consensual
//   - Gartner 2024: 40% of misinformation will be from state-backed actors
// ─────────────────────────────────────────────────────────────────────

// ── Deepfake artifact types ────────────────────────────────────────

/** Supported deepfake media types */
export type TipoDeepfake = "audio" | "video" | "imagen" | "texto";

/** Difficulty level for educational progression */
export type NivelDificultad = "facil" | "medio" | "dificil";

/**
 * Represents a deepfake artifact used in educational scenarios.
 * Each artifact has indicators (señales) that help students identify
 * synthetic or manipulated content.
 */
export interface DeepfakeArtifact {
  /** Unique identifier */
  id: string;
  /** Media type: audio, video, imagen, or texto */
  tipo: TipoDeepfake;
  /** Short title describing the artifact */
  titulo: string;
  /** Detailed description of the content */
  descripcion: string;
  /** Red-flag signals indicating this is a deepfake (e.g. "sincronización labial irregular") */
  senales: string[];
  /** Difficulty level for progressive learning */
  nivelDificultad: NivelDificultad;
  /** Research or media source (e.g. "UNICEF 2024") */
  fuente: string;
}

// ── Interactive scenarios ──────────────────────────────────────────

/**
 * Interactive scenario for deepfake detection training.
 * Presents artifacts, questions, and explanations for educational reinforcement.
 */
export interface DeepfakeScenario {
  /** Unique identifier */
  id: string;
  /** Scenario title */
  titulo: string;
  /** Contextual description shown before the interaction */
  contexto: string;
  /** Deepfake artifacts to analyze */
  artifacts: DeepfakeArtifact[];
  /** Question posed to the student */
  pregunta: string;
  /** Multiple-choice answer options */
  opciones: string[];
  /** Index of the correct answer (0-based) */
  respuestaCorrecta: number;
  /** Explanation shown after answering */
  explicacion: string;
  /** Maximum score achievable in this scenario */
  puntuacionMaxima: number;
  /** Research source validating this scenario (e.g. "UNICEF 2024") */
  fuente: string;
  /** Target age range (e.g. "14-18") */
  edadObjetivo: string;
}

// ── Metadata indicators ────────────────────────────────────────────

/** Severity level for metadata anomalies */
export type SeveridadMetadata = "baja" | "media" | "alta" | "critica";

/**
 * Metadata clue for detecting manipulated or suspicious media.
 * Used in forensic-style activities where students examine EXIF, timestamps, etc.
 */
export interface MetadataIndicator {
  /** Unique identifier */
  id: string;
  /** Metadata field name (e.g. "EXIF DateTimeOriginal", "GPSLatitude") */
  campo: string;
  /** Expected legitimate value or pattern */
  valorEsperado: string;
  /** Suspicious/anomalous value that indicates tampering */
  valorSospechoso: string;
  /** Why this discrepancy matters for detection */
  explicacion: string;
  /** Severity of this metadata anomaly */
  severidad: SeveridadMetadata;
}

// ── Module data shape ──────────────────────────────────────────────

/**
 * Top-level data shape for Module 5: Deepfake Defender.
 * Loaded from JSON at runtime.
 */
export interface Modulo5Data {
  escenarios: DeepfakeScenario[];
  indicadoresMetadata: MetadataIndicator[];
  microActividades: any[];
}

// ── Game state and progress ────────────────────────────────────────

/** Game state for Module 5 scenarios */
export type GameState = 'WELCOME' | 'PLAYING' | 'FEEDBACK' | 'RESULTS';

/** Tracks student progress through Module 5 */
export interface GameProgress {
  /** Index of the current scenario being played */
  currentScenarioIndex: number;
  /** Cumulative score across all scenarios */
  totalScore: number;
  /** Score breakdown by category */
  categoryScores: Record<string, number>;
  /** IDs of completed scenarios */
  completedScenarios: string[];
  /** Current game state */
  gameState: GameState;
  /** Timestamp of last activity (ms since epoch) */
  timestamp: number;
}
