export interface Email {
  id: string;
  remetente: {
    nome: string;
    email: string;
  };
  assunto: string;
  corpo: string;
  dataEnvio: string;
  links: Array<{
    texto: string;
    urlReal: string;
    urlExibida: string;
    dominio: string;
    https: boolean;
    seloSeguranca: boolean;
  }>;
  dicasVisuais: string[];
}

export interface URLItem {
  id: string;
  urlCompleta: string;
  componentes: {
    protocolo: string;
    dominio: string;
    caminho: string;
    parametros?: string | null;
    porta?: number;
  };
  elementoSuspeito: string;
  classificacao: "phishing" | "suspeita" | "segura";
  explicacao: string;
  pontos: number;
}

export interface Indicador {
  id: string;
  tipo: string;
  descricao: string;
  localizacao: string;
  gravidade: "alta" | "media" | "baja";
}

export interface Escenario {
  id: string;
  tipo: "email" | "sms" | "web" | "redes-sociais";
  titulo: string;
  descricao: string;
  conteudo: string;
  indicadores: Indicador[];
  acaoCorreta: "reportar" | "verificar" | "bloquear" | "ignorar";
  pontos: number;
  dificuldad: "basico" | "intermedio" | "avancado";
  explicacao: string;
}

export interface DragItem {
  id: string;
  conteudo: string;
  tipo: string;
  icone: string;
}

export interface DragTarget {
  id: string;
  label: string;
  tipo: string;
  cor: string;
}

export interface Ejercicio {
  id: string;
  titulo: string;
  descricao: string;
  itens: DragItem[];
  alvos: DragTarget[];
  pontos: number;
}

/** Strict answer types per micro-activity kind */
export type RespuestaVF = "verdadero" | "falso";
export type RespuestaCodigo = number;
export type RespuestaOrden = string[]; // ordered step IDs

export interface MicroActividad {
  id: string;
  tipo: "verdadero-falso" | "completar-codigo" | "ordenar-pasos";
  pergunta: string;
  respuestaCorrecta: RespuestaVF | RespuestaCodigo | RespuestaOrden;
  codigo?: string;
  pasos?: Array<{ id: string; texto: string; ordenCorrecto: number }>;
  explicacao: string;
  puntos: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  color: string;
}

export interface ModuloData {
  modulo: {
    id: number;
    nombre: string;
    descripcion: string;
    umbralAprobacion: number;
    tiempoEstimado: string;
    icono: string;
  };
  categorias: Categoria[];
  correos: Email[];
  urls: URLItem[];
  escenarios: Escenario[];
  ejercicios: Ejercicio[];
  microActividades: MicroActividad[];
}

/** All valid category keys for Module 1 scoring */
export type Module1Category =
  | "analisis-email"
  | "inspeccion-url"
  | "phishing-simulado"
  | "defensa-digital"
  | "clasificacion"
  | "micro-actividades";

/** All Module 1 category keys for zero-initialization */
export const ALL_MODULE1_CATEGORIES: Module1Category[] = [
  "analisis-email",
  "inspeccion-url",
  "phishing-simulado",
  "defensa-digital",
  "clasificacion",
  "micro-actividades",
];

/** Activity component identifiers */
export type ActivityType =
  | "analisis-email"
  | "inspeccion-url"
  | "phishing-simulado"
  | "defensa-digital";

export type ActionType = "reportar" | "verificar" | "bloquear" | "ignorar";

export interface QuestionState {
  answered: boolean;
  selected: string | null;
  correct: boolean;
  showingExplanation: boolean;
}

/** Persisted game progress for Module 1 (localStorage) */
export interface GameProgressModule1 {
  currentActivityIndex: number;
  score: number;
  categoryScores: Record<Module1Category, number>;
  timestamp: number; // Date.now() for staleness check
}

/** Activity key mapping used in ACTIVITIES array */
export type ActivityKey =
  | "email"
  | "url"
  | "simulator"
  | "defense"
  | "dragdrop"
  | "micro";
