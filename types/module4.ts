export interface PatchOption {
  id: string;
  codigo: string;
  esCorrecta: boolean;
  explicacion: string;
}

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

export interface CategoriaModulo4 {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  color: string;
}

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
  microActividades: MicroActividad[];
}

export type Module4Category =
  | "vulnerabilidades"
  | "sanitizacion"
  | "autenticacion"
  | "defensa-activa"
  | "micro-actividades";

export const ALL_MODULE4_CATEGORIES: Module4Category[] = [
  "vulnerabilidades",
  "sanitizacion",
  "autenticacion",
  "defensa-activa",
  "micro-actividades",
];

export type ActivityType =
  | "code-defuse"
  | "sanitization"
  | "auth"
  | "defense"
  | "micro";

export interface GameProgressModule4 {
  currentActivityIndex: number;
  score: number;
  categoryScores: Record<Module4Category, number>;
  timestamp: number;
}
