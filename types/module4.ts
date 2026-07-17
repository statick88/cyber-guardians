// ── Crypto / Hardening / Integrity types for Module 4 ────────────────

/** A single option in a challenge (hardening or crypto) */
export interface ChallengeOption {
  id: string;
  label: string;
  esCorrecta: boolean;
  explicacion: string;
}

/** Cipher challenge — decrypt a message using the given cipher */
export interface CryptoChallenge {
  id: string;
  titulo: string;
  descripcion: string;
  cipherType: "caesar" | "xor" | "aes-simulado";
  mensajeCifrado: string;
  clave: string;
  pistas: string[];
  opciones: ChallengeOption[];
  puntos: number;
  explicacion: string;
}

/** A single toggle check in a hardening scenario */
export interface HardeningCheck {
  id: string;
  descripcion: string;
  correctState: boolean;
}

/** Hardening scenario — fix a vulnerable configuration */
export interface HardeningScenario {
  id: string;
  titulo: string;
  descripcion: string;
  systemType: "linux" | "windows" | "web-server";
  checks: HardeningCheck[];
  puntos: number;
  explicacion: string;
}

/** File integrity check — verify checksums */
export interface IntegrityCheck {
  id: string;
  titulo: string;
  descripcion: string;
  archivoNombre: string;
  checksumOriginal: string;
  checksumAlumno: string;
  pistas: string[];
  opciones: ChallengeOption[];
  puntos: number;
  explicacion: string;
}

/** Micro-activity (reuse existing pattern) */
export interface MicroActividad {
  id: string;
  tipo: "verdadero-falso" | "completar-codigo" | "ordenar-pasos";
  pregunta: string;
  respuestaCorrecta: "verdadero" | "falso" | number | string[];
  codigo?: string;
  pasos?: Array<{ id: string; texto: string; ordenCorrecto: number }>;
  explicacion: string;
  puntos: number;
}

/** A generic code challenge used by CodeDefuseSandbox */
export interface CodeChallenge {
  id: string;
  titulo: string;
  descripcion: string;
  codigoVulnerable: string;
  codigoSeguro: string;
  tipoVulnerabilidad: string;
  pistas: string[];
  puntos: number;
  explicacion: string;
}

/** Patch option for CodeDefuseSandbox (auto-generated from challenge) */
export interface PatchOption {
  id: string;
  codigo?: string;
  label?: string;
  esCorrecta: boolean;
  explicacion: string;
}

/** Module data shape (mirrors module0 ModuloData pattern) */
export interface Modulo4Data {
  modulo: {
    id: number;
    nombre: string;
    descripcion: string;
    umbralAprobacion: number;
    tiempoEstimado: string;
    icono: string;
  };
  categorias: CategoriaModulo4[];
  codeChallenges: CodeChallenge[];
  cryptoChallenges: CryptoChallenge[];
  hardeningScenarios: HardeningScenario[];
  integrityChecks: IntegrityCheck[];
  microActividades: MicroActividad[];
}

/** Category descriptor for GameProgress bar */
export interface CategoriaModulo4 {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  color: string;
}

/** Union of all category IDs */
export type Module4Category =
  | "criptografia"
  | "hardening"
  | "integridad"
  | "vulnerabilidades"
  | "sanitizacion"
  | "autenticacion"
  | "defensa-activa"
  | "micro-actividades";

export const ALL_MODULE4_CATEGORIES: Module4Category[] = [
  "criptografia",
  "hardening",
  "integridad",
  "vulnerabilidades",
  "sanitizacion",
  "autenticacion",
  "defensa-activa",
  "micro-actividades",
];

/** Activity keys for the orchestrator */
export type ActivityType =
  | "crypto-1"
  | "crypto-2"
  | "crypto-3"
  | "hardening-1"
  | "hardening-2"
  | "hardening-3"
  | "integrity-1"
  | "integrity-2"
  | "integrity-3"
  | "micro";

/** Persisted game progress */
export interface GameProgressModule4 {
  currentActivityIndex: number;
  score: number;
  categoryScores: Record<Module4Category, number>;
  timestamp: number;
}
