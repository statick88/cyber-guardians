// ─────────────────────────────────────────────────────────────────────
// CyberGuardians — Module 3: CyberSentry Types
// Escudo contra Engaños y Mafias Digitales
//
// Research sources:
//   - Europol EMMA 2023: Minors >70% of criminal markets
//   - Cifas 2023: 28% increase in under-21 money mules
//   - FBI IC3 2022: ~7,000 sextortion victims (minors)
//   - Deepfake research: 96% non-consensual content targets women
// ─────────────────────────────────────────────────────────────────────

// ── Chat simulation (reclutamiento + manipulación) ─────────────────

export interface MensajeChat {
  id: string;
  autor: "reclutador" | "amigo" | "victima" | "sospechoso";
  texto: string;
  esSeñal: boolean;          // true if this message is a red flag
  razon?: string;            // explanation shown after detection
  /** Age hint for the victim persona (research: minors are primary targets) */
  edad?: number;
  /** Platform where this message was sent (WhatsApp, Instagram, etc.) */
  plataforma?: string;
}

export type CategoriaReclutamiento = "reclutamiento" | "manipulacion";

export interface EscenarioChat {
  id: string;
  categoria: CategoriaReclutamiento;
  titulo: string;
  contexto: string;          // short intro shown before the chat
  mensajes: MensajeChat[];
  señales: string[];         // red-flag labels for this scenario
  puntuacionMaxima: number;  // max points for this activity
  /** Research source validating this scenario (e.g. "Europol EMMA 2023") */
  fuente: string;
  /** Target age range (e.g. "14-17") */
  edadObjetivo: string;
  /** Estimated completion time (e.g. "3 min") */
  duracionEstimada: string;
}

// ── Money mule detection ───────────────────────────────────────────

export type RiesgoMula = "bajo" | "medio" | "alto";

export interface OfertaMula {
  id: string;
  titulo: string;
  descripcion: string;
  fuente: string;            // e.g. "Instagram DM", "Telegram grupo"
  señalesRiesgo: string[];
  nivelRiesgo: RiesgoMula;
  esTrampa: boolean;
  explicacion: string;
  /** Platform where the recruitment originated */
  plataforma: string;
  /** Real-world case reference (e.g. "Cifas 2023 report: 17-year-old UK") */
  victimasReales?: string;
  /** Technique used by the recruiter (e.g. "money flip", "pagador intermediario") */
  tecnicaUsada: string;
}

export interface PreguntaOferta {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  explicacion: string;
}

export interface ActividadMula {
  id: string;
  oferta: OfertaMula;
  preguntas: PreguntaOferta[];
}

// ── Cyberextortion response ────────────────────────────────────────

export type TipoExtorsion = "sextorsion" | "ransom" | "amenazas";

export interface EscenarioExtorsion {
  id: string;
  tipo: TipoExtorsion;
  titulo: string;
  descripcion: string;
  opciones: string[];
  respuestaCorrecta: number;
  explicacion: string;
  puntuacionMaxima: number;
  /** Research source (e.g. "FBI IC3 2022") */
  fuente: string;
  /** Target age range (e.g. "12-15") */
  edadObjetivo: string;
  /** Real-world consequences (e.g. "suicidal ideation, school dropout") */
  consecuenciasReales: string;
  /** Support resources: helplines, websites, organizations */
  recursosApoyo: string[];
}

// ── Drag & Drop: classify signals ──────────────────────────────────

export interface MensajeDragDrop {
  id: string;
  texto: string;
  tipo: "reclutamiento" | "mula" | "extorsion" | "manipulacion" | "seguro";
  /** Difficulty level for progressive challenge design */
  dificultad: "facil" | "medio" | "dificil";
  /** Research source validating this signal (e.g. "Cifas 2023") */
  fuente?: string;
}

export interface ResultadoDragDrop {
  mensajeId: string;
  categoria: string;
  correcta: boolean;
}

// ── Alert signals (composite risk indicators) ──────────────────────

export interface SeñalAlerta {
  id: string;
  descripcion: string;
  severidad: "baja" | "media" | "alta" | "critica";
  categoria: CategoriaModulo3;
  /** Concrete example for learning reinforcement */
  ejemplo: string;
  /** Research source backing this signal (e.g. "Europol EMMA 2023") */
  fuente: string;
}

// ── Support resources (helplines, websites) ────────────────────────

export interface RecursoApoyo {
  nombre: string;
  url: string;
  telefono?: string;
  descripcion: string;
}

/** Real helplines and support organizations for cybercrime victims */
export const RECURSOS_APOYO: RecursoApoyo[] = [
  {
    nombre: "Childhelp National Child Abuse Hotline",
    url: "https://www.childhelp.org/hotline/",
    telefono: "1-800-422-4453",
    descripcion:
      "24/7 crisis intervention for child abuse, neglect, and exploitation. Trained counselors available in English and Spanish.",
  },
  {
    nombre: "CyberBullying Research Center",
    url: "https://cyberbullying.org",
    descripcion:
      "Evidence-based resources for parents, educators, and students on preventing and responding to cyberbullying.",
  },
  {
    nombre: "StopBullying.gov",
    url: "https://www.stopbullying.gov",
    telefono: "1-800-273-8255",
    descripcion:
      "U.S. government resource with prevention strategies, reporting guidance, and crisis support for bullying and cyberbullying.",
  },
  {
    nombre: "National Center for Missing & Exploited Children (NCMEC)",
    url: "https://www.missingkids.org",
    telefono: "1-800-843-5678",
    descripcion:
      "CyberTipline for reporting online child sexual exploitation. Operates 24/7 with law enforcement coordination.",
  },
  {
    nombre: "Internet Watch Foundation (IWF)",
    url: "https://www.iwf.org.uk",
    descripcion:
      "UK-based organization to report child sexual abuse imagery online. Works globally with ISPs and law enforcement.",
  },
  {
    nombre: "Thorn — Digital Defenders of Children",
    url: "https://www.thorn.org",
    descripcion:
      "Technology-driven solutions to defend children from sexual abuse. Provides resources for parents and teens.",
  },
  {
    nombre: "Crisis Text Line",
    url: "https://www.crisistextline.org",
    telefono: "Text HOME to 741741",
    descripcion:
      "Free 24/7 text-based crisis support for anyone in distress, including victims of online exploitation and sextortion.",
  },
  {
    nombre: "NHS — Thinkuknow (CEOP)",
    url: "https://www.thinkuknow.co.uk",
    descripcion:
      "UK education programme from CEOP (Child Exploitation and Online Protection). Age-appropriate resources for 4-18 year olds.",
  },
  {
    nombre: "INHOPE — International Hotline Network",
    url: "https://www.inhope.org",
    descripcion:
      "Global network of 50+ hotlines for reporting illegal content online. Coordinates cross-border takedown requests.",
  },
  {
    nombre: "Europol — Stop Extortion",
    url: "https://www.europol.europa.eu",
    descripcion:
      "European reporting portal for cybercrime including sextortion, ransomware, and online blackmail.",
  },
];

// ── Categories enum (for MicroActivities) ─────────────────────────

export type CategoriaModulo3 =
  | "reclutamiento"
  | "mula_dinero"
  | "ciberextorsion"
  | "manipulacion";

export type Module3Category = CategoriaModulo3;

export const ALL_MODULE3_CATEGORIES: Module3Category[] = [
  "reclutamiento",
  "mula_dinero",
  "ciberextorsion",
  "manipulacion",
];

// ── Game progress (localStorage) ──────────────────────────────────

export interface GameProgressModule3 {
  currentActivityIndex: number;
  score: number;
  categoryScores: Record<Module3Category, number>;
  timestamp: number;
}

// ── Micro-activities (true/false, code, order steps) ──────────────

export interface MicroActividad {
  id: string;
  tipo: "verdadero-falso" | "completar-codigo" | "ordenar-pasos";
  pregunta: string;
  respuestaCorrecta: string | number | string[];
  puntos: number;
  explicacion: string;
  codigo?: string;
  pasos?: Array<{ id: string; texto: string; ordenCorrecto: number }>;
  categoria: CategoriaModulo3;
}

// ── Module data (loaded from JSON) ────────────────────────────────

export interface Modulo3Data {
  escenariosChat: EscenarioChat[];
  actividadesMula: ActividadMula[];
  escenariosExtorsion: EscenarioExtorsion[];
  mensajesDragDrop: MensajeDragDrop[];
}

// ── Scoring ────────────────────────────────────────────────────────

export interface Modulo3Progress {
  completedActivities: string[];
  score: number;
  lastUpdated: number;
}
