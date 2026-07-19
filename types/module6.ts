// ─────────────────────────────────────────────────────────────────────
// CyberGuardians — Module 6: Crypto-Scam Shield
// Escudo contra Estafas Financieras y Fraudes Digitales
//
// Research sources:
//   - FTC 2024: QR code scam reports increased 3x since 2022
//   - Europol IOCTA 2023: Pyramid schemes target young investors
//   - FBI IC3 2023: Employment scams cost victims $1.1B globally
//   - ScamAdviser 2024: 70% of QR phishing targets mobile users
// ─────────────────────────────────────────────────────────────────────

// ── QR Code Scams ──────────────────────────────────────────────────

/** Type of QR code fraud */
export type TipoQRScam = "estafado_QR_pix" | "QR_phishing" | "QR_malicioso";

/** Risk level for financial scams */
export type NivelRiesgo = "bajo" | "medio" | "alto";

/**
 * QR code fraud scenario for educational detection training.
 * Covers PIX QR scams, QR phishing, and malicious QR codes.
 */
export interface QRCodeScam {
  /** Unique identifier */
  id: string;
  /** Scenario title */
  titulo: string;
  /** Detailed description of the scam */
  descripcion: string;
  /** Type of QR fraud */
  tipo: TipoQRScam;
  /** Red-flag signals indicating this is a scam (e.g. "QR generado fuera de plataforma oficial") */
  senalesRiesgo: string[];
  /** Risk level assessment */
  nivelRiesgo: NivelRiesgo;
  /** Educational explanation of the scam mechanics */
  explicacion: string;
  /** Research or reporting source (e.g. "FTC 2024") */
  fuente: string;
}

// ── Pyramid Schemes ────────────────────────────────────────────────

/** Type of pyramid scheme */
export type TipoPiramide = "trading_piramide" | "MLM_falso" | "inversion_fraudulenta";

/**
 * Pyramid scheme scenario for detection training.
 * Teaches students to identify fraudulent investment and MLM structures.
 */
export interface PyramidScheme {
  /** Unique identifier */
  id: string;
  /** Scenario title */
  titulo: string;
  /** Detailed description of the scheme */
  descripcion: string;
  /** Type of pyramid scheme */
  tipo: TipoPiramide;
  /** Warning signals (e.g. "promesas de rendimientos excesivos", "ingresos provienen de reclutar nuevos miembros") */
  senalesAdvertencia: string[];
  /** Risk level assessment */
  nivelRiesgo: NivelRiesgo;
  /** Description of the fraudulent structure (e.g. "3 niveles con comisiones progresivas") */
  estructura: string;
  /** Research or reporting source */
  fuente: string;
}

// ── Employment Scams ───────────────────────────────────────────────

/** Type of employment scam */
export type TipoEmpleoFalso = "tareas_falsas" | "trabajo_remoto_fraudulento" | "pago_adelantado";

/**
 * Employment/task-based scam scenario for detection training.
 * Covers fake task scams, remote work fraud, and advance-fee fraud.
 */
export interface EmploymentScam {
  /** Unique identifier */
  id: string;
  /** Scenario title */
  titulo: string;
  /** Detailed description of the scam */
  descripcion: string;
  /** Type of employment scam */
  tipo: TipoEmpleoFalso;
  /** Red-flag signals (e.g. "solicitan pago por adelantado para 'capacitación'") */
  senalesRiesgo: string[];
  /** Estimated monetary loss range (e.g. "$500-$2,000 USD") */
  montoEstimado: string;
  /** Research or reporting source */
  fuente: string;
}

// ── Module data shape ──────────────────────────────────────────────

/**
 * Top-level data shape for Module 6: Crypto-Scam Shield.
 * Loaded from JSON at runtime.
 */
export interface Modulo6Data {
  scamsQR: QRCodeScam[];
  piramides: PyramidScheme[];
  empleosFalsos: EmploymentScam[];
  microActividades: any[];
}
