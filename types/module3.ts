export interface DeepfakeCase {
  id: string;
  tipo: "imagen" | "audio" | "video";
  titulo: string;
  descripcion: string;
  pistas: string[];
  zonaSospechosa: string;
  nivelDificultad: "basico" | "intermedio" | "avanzado";
  puntos: number;
  explicacion: string;
}

export interface VishingScenario {
  id: string;
  tipo: "amigo" | "banco" | "soporte-tecnico" | "autoridad";
  titulo: string;
  descripcion: string;
  dialogo: Array<{
    hablante: string;
    texto: string;
    esSospechoso: boolean;
  }>;
  preguntasSeguridad: string[];
  explicacion: string;
  puntos: number;
}

export interface DesinformacionCase {
  id: string;
  tipo: "imagen-sintetica" | "audio-clonado" | "noticia-falsa" | "video-manipulado";
  titulo: string;
  descripcion: string;
  indicadores: string[];
  fuenteOriginal: string;
  explicacion: string;
  puntos: number;
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

export interface CategoriaModulo3 {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  color: string;
}

export interface Modulo3Data {
  modulo: {
    id: number;
    nombre: string;
    descripcion: string;
    umbralAprobacion: number;
    tiempoEstimado: string;
    icono: string;
  };
  categorias: CategoriaModulo3[];
  deepfakeCases: DeepfakeCase[];
  vishingScenarios: VishingScenario[];
  desinformacionCases: DesinformacionCase[];
  microActividades: MicroActividad[];
}

export type Module3Category =
  | "analisis-deepfake"
  | "vishing-simulado"
  | "desinformacion-ia"
  | "defensa-critica"
  | "micro-actividades";

export const ALL_MODULE3_CATEGORIES: Module3Category[] = [
  "analisis-deepfake",
  "vishing-simulado",
  "desinformacion-ia",
  "defensa-critica",
  "micro-actividades",
];

export type ActivityType =
  | "deepfake"
  | "vishing"
  | "desinformacion"
  | "defense"
  | "dragdrop"
  | "micro";

export interface GameProgressModule3 {
  currentActivityIndex: number;
  score: number;
  categoryScores: Record<Module3Category, number>;
  timestamp: number;
}
