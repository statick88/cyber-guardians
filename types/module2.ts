export interface PasswordEntry {
  id: string;
  servicio: string;
  usuario: string;
  contrasena: string;
  fortaleza: "muy-debil" | "debil" | "media" | "fuerte" | "muy-fuerte";
  tiempoCrackeo: string;
  fueFiltrada: boolean;
  recomendacion: string;
}

export interface TwoFactorMethod {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  nivelSeguridad: "bajo" | "medio" | "alto" | "maximo";
  vulnerableA: string[];
  ejemplo: string;
}

export interface TwoFactorScenario {
  id: string;
  servicio: string;
  icono: string;
  descripcion: string;
  metodosDisponibles: string[];
  metodoRecomendado: string;
  explicacion: string;
  puntos: number;
}

export interface SocialMediaProfile {
  id: string;
  plataforma: string;
  icono: string;
  configuraciones: ConfiguracionPrivacidad[];
}

export interface ConfiguracionPrivacidad {
  id: string;
  nombre: string;
  descripcion: string;
  estadoActual: "publico" | "amigos" | "solo-yo" | "personalizado";
  estadoRecomendado: "publico" | "amigos" | "solo-yo" | "personalizado";
  riesgo: "alto" | "medio" | "bajo";
  explicacion: string;
  puntos: number;
}

export interface IdentityTheftScenario {
  id: string;
  tipo: "credenciales" | "identidad" | "financiero" | "medico" | "infantil";
  titulo: string;
  descripcion: string;
  indicadores: IndicadorRiesgo[];
  accionCorrecta: "congelar-credito" | "cambiar-contrasenas" | "reportar-autoridades" | "monitorear-cuentas" | "contactar-soporte";
  puntos: number;
  dificultad: "basico" | "intermedio" | "avanzado";
  explicacion: string;
}

export interface IndicadorRiesgo {
  id: string;
  tipo: string;
  descripcion: string;
  severidad: "critica" | "alta" | "media" | "baja";
  accion: string;
}

export interface DragItemDefense {
  id: string;
  conteudo: string;
  tipo: string;
  icono: string;
}

export interface DragTargetDefense {
  id: string;
  label: string;
  tipo: string;
  color: string;
  descripcion: string;
}

export interface EjercicioDefensa {
  id: string;
  titulo: string;
  descripcion: string;
  items: DragItemDefense[];
  targets: DragTargetDefense[];
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

export interface CategoriaModulo2 {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  color: string;
}

export interface Modulo2Data {
  modulo: {
    id: number;
    nombre: string;
    descripcion: string;
    umbralAprobacion: number;
    tiempoEstimado: string;
    icono: string;
  };
  categorias: CategoriaModulo2[];
  contrasenas: PasswordEntry[];
  metodos2fa: TwoFactorMethod[];
  escenarios2fa: TwoFactorScenario[];
  perfilesSociales: SocialMediaProfile[];
  robosIdentidad: IdentityTheftScenario[];
  ejercicios: EjercicioDefensa[];
  microActividades: MicroActividad[];
}

export type Module2Category =
  | "boveda-contrasenas"
  | "autenticacion-2fa"
  | "auditoria-redes-sociales"
  | "proteccion-identidad"
  | "defensa-activa"
  | "micro-actividades";

export const ALL_MODULE2_CATEGORIES: Module2Category[] = [
  "boveda-contrasenas",
  "autenticacion-2fa",
  "auditoria-redes-sociales",
  "proteccion-identidad",
  "defensa-activa",
  "micro-actividades",
];

export type ActivityType =
  | "boveda-contrasenas"
  | "autenticacion-2fa"
  | "auditoria-redes-sociales"
  | "proteccion-identidad"
  | "defensa-activa"
  | "micro-actividades";

export interface GameProgressModule2 {
  currentActivityIndex: number;
  score: number;
  categoryScores: Record<Module2Category, number>;
  timestamp: number;
}