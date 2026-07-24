/**
 * MITRE ATT&CK Technique Mappings — CyberGuardians
 *
 * Source: research/mitre-attack-mapping.md (MITRE ATT&CK v19)
 * Techniques are mapped per module based on curriculum content analysis.
 */

import type { AttackTechnique, ModuleAttackMapping } from '@/types/attack';

// ─── Module 0: Introducción al Ciberseguridad ────────────────────────────────

const MODULE_0_TECHNIQUES: AttackTechnique[] = [
  { id: 'T1566.003', name: 'Spearphishing via Service', tactic: 'initial-access', description: 'Uso de redes sociales y mensajería para contactar víctimas' },
  { id: 'T1566.002', name: 'Spearphishing Link', tactic: 'initial-access', description: 'Enlaces maliciosos en correos de phishing' },
  { id: 'T1598', name: 'Phishing for Information', tactic: 'reconnaissance', description: 'Recolección de información personal mediante ingeniería social' },
  { id: 'T1552', name: 'Unsecured Credentials', tactic: 'credential-access', description: 'Credenciales descubiertas en fuentes públicas o redes sociales' },
  { id: 'T1557', name: 'Adversary-in-the-Middle', tactic: 'credential-access', description: 'Interceptación de comunicaciones para robar credenciales' },
  { id: 'T1078', name: 'Valid Accounts', tactic: 'initial-access', description: 'Uso de cuentas legítimas comprometidas' },
  { id: 'T1204', name: 'User Execution', tactic: 'execution', description: 'Ejecución de archivos o enlaces maliciosos por el usuario' },
  { id: 'T1683.002', name: 'Malvertising — Fake Login Pages', tactic: 'initial-access', description: 'Páginas de login falsas para robar credenciales' },
];

// ─── Module 1: Fundamentos de Redes ──────────────────────────────────────────

const MODULE_1_TECHNIQUES: AttackTechnique[] = [
  { id: 'T1566.002', name: 'Spearphishing Link', tactic: 'initial-access', description: 'Enlaces maliciosos enviados a través de redes' },
  { id: 'T1566.001', name: 'Spearphishing Attachment', tactic: 'initial-access', description: 'Archivos adjuntos maliciosos transmitidos por red' },
  { id: 'T1105', name: 'Ingress Tool Transfer', tactic: 'initial-access', description: 'Transferencia de herramientas maliciosas a través de la red' },
  { id: 'T1566.003', name: 'Spearphishing via Service', tactic: 'initial-access', description: 'Phishing a través de servicios de mensajería y redes sociales' },
  { id: 'T1598', name: 'Phishing for Information', tactic: 'reconnaissance', description: 'Reconocimiento de infraestructura de red para phishing' },
  { id: 'T1557', name: 'Adversary-in-the-Middle', tactic: 'credential-access', description: 'Interceptación de tráfico de red (ARP spoofing, DNS poisoning)' },
  { id: 'T1204', name: 'User Execution', tactic: 'execution', description: 'Ejecución de código malicioso a través de vulnerabilidades de red' },
];

// ─── Module 2: Seguridad en Sistemas Operativos ──────────────────────────────

const MODULE_2_TECHNIQUES: AttackTechnique[] = [
  { id: 'T1595.001', name: 'Active Scanning: Scan IP Blocks', tactic: 'reconnaissance', description: 'Escaneo activo de direcciones IP para identificar hosts' },
  { id: 'T1595.002', name: 'Active Scanning: Vulnerability Scanning', tactic: 'reconnaissance', description: 'Escaneo de vulnerabilidades en sistemas operativos' },
  { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'initial-access', description: 'Explotación de vulnerabilidades en servicios del SO' },
  { id: 'T1133', name: 'External Remote Services', tactic: 'initial-access', description: 'Acceso remoto externo a servicios del sistema operativo' },
  { id: 'T1505.003', name: 'Web Shell', tactic: 'persistence', description: 'Web shells instaladas en servicios web del SO' },
  { id: 'T1046', name: 'Network Service Scanning', tactic: 'reconnaissance', description: 'Escaneo de servicios de red del sistema operativo' },
  { id: 'T1557', name: 'Adversary-in-the-Middle', tactic: 'credential-access', description: 'Interceptación de autenticación del SO' },
  { id: 'T1552.001', name: 'Credentials In Files', tactic: 'credential-access', description: 'Credenciales almacenadas en archivos del sistema' },
];

// ─── Module 3: Seguridad de Aplicaciones Web ─────────────────────────────────

const MODULE_3_TECHNIQUES: AttackTechnique[] = [
  { id: 'T1566.001', name: 'Spearphishing Attachment', tactic: 'initial-access', description: 'Archivos adjuntos maliciosos que explotan vulnerabilidades web' },
  { id: 'T1566.002', name: 'Spearphishing Link', tactic: 'initial-access', description: 'Enlaces a sitios web vulnerables o maliciosos' },
  { id: 'T1078.004', name: 'Valid Accounts: Cloud Accounts', tactic: 'initial-access', description: 'Cuentas de usuario comprometidas en aplicaciones web' },
  { id: 'T1133', name: 'External Remote Services', tactic: 'initial-access', description: 'Acceso a interfaces de administración web' },
  { id: 'T1204.001', name: 'User Execution: Malicious Links', tactic: 'execution', description: 'Ejecución de código a través de enlaces en aplicaciones web' },
  { id: 'T1528', name: 'Steal Application Access Token', tactic: 'credential-access', description: 'Robo de tokens de acceso de aplicaciones web (OAuth, JWT)' },
];

// ─── Module 4: Respuesta a Incidentes y Análisis Forense ─────────────────────

const MODULE_4_TECHNIQUES: AttackTechnique[] = [
  { id: 'T1021.001', name: 'Remote Services: Remote Desktop Protocol', tactic: 'lateral-movement', description: 'Movimiento lateral mediante RDP en respuesta a incidentes' },
  { id: 'T1021.002', name: 'Remote Services: SMB/Windows Admin Shares', tactic: 'lateral-movement', description: 'Movimiento lateral mediante SMB durante análisis forense' },
  { id: 'T1021.004', name: 'Remote Services: SSH', tactic: 'lateral-movement', description: 'Acceso remoto SSH durante investigación de incidentes' },
  { id: 'T1570', name: 'Lateral Tool Transfer', tactic: 'lateral-movement', description: 'Transferencia de herramientas forenses entre sistemas' },
  { id: 'T1005', name: 'Data from Local System', tactic: 'exfiltration', description: 'Recopilación de evidencia del sistema local comprometido' },
];

// ─── Module 5: Hacking Ético y Pentesting ────────────────────────────────────

const MODULE_5_TECHNIQUES: AttackTechnique[] = [
  { id: 'T1204.001', name: 'User Execution: Malicious Links', tactic: 'execution', description: 'Simulación de ejecución de payloads en pentesting' },
  { id: 'T1566.002', name: 'Spearphishing Link', tactic: 'initial-access', description: 'Simulación de campañas de phishing en pentesting' },
  { id: 'T1185', name: 'Man-in-the-Browser', tactic: 'credential-access', description: 'Interceptación de tráfico en pruebas autorizadas (MitM)' },
  { id: 'T1105', name: 'Ingress Tool Transfer', tactic: 'initial-access', description: 'Transferencia de herramientas de pentesting al objetivo' },
];

// ─── Module 6: Leyes, Ética y Profesionalismo ────────────────────────────────

const MODULE_6_TECHNIQUES: AttackTechnique[] = [
  { id: 'T1566.001', name: 'Spearphishing Attachment', tactic: 'initial-access', description: 'Distribución de malware mediante archivos adjuntos maliciosos' },
  { id: 'T1566.002', name: 'Spearphishing Link', tactic: 'initial-access', description: 'Distribución de malware mediante enlaces maliciosos' },
  { id: 'T1204.001', name: 'User Execution: Malicious Links', tactic: 'execution', description: 'Ejecución de malware por usuarios engañados' },
  { id: 'T1053.005', name: 'Scheduled Task/Job: Scheduled Task', tactic: 'persistence', description: 'Tareas programadas para persistencia de malware' },
  { id: 'T1059.001', name: 'Command and Scripting Interpreter: PowerShell', tactic: 'execution', description: 'Uso de PowerShell para ejecución de código malicioso' },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export const MODULE_ATTACK_MAPPINGS: ModuleAttackMapping[] = [
  { moduleId: 0, moduleName: 'Introducción al Ciberseguridad', techniques: MODULE_0_TECHNIQUES },
  { moduleId: 1, moduleName: 'Fundamentos de Redes', techniques: MODULE_1_TECHNIQUES },
  { moduleId: 2, moduleName: 'Seguridad en Sistemas Operativos', techniques: MODULE_2_TECHNIQUES },
  { moduleId: 3, moduleName: 'Seguridad de Aplicaciones Web', techniques: MODULE_3_TECHNIQUES },
  { moduleId: 4, moduleName: 'Respuesta a Incidentes y Análisis Forense', techniques: MODULE_4_TECHNIQUES },
  { moduleId: 5, moduleName: 'Hacking Ético y Pentesting', techniques: MODULE_5_TECHNIQUES },
  { moduleId: 6, moduleName: 'Leyes, Ética y Profesionalismo', techniques: MODULE_6_TECHNIQUES },
];

/**
 * All unique ATT&CK techniques across the curriculum, deduplicated.
 * Each technique includes `moduleIds` indicating which modules cover it.
 */
export const ALL_UNIQUE_TECHNIQUES: (AttackTechnique & { moduleIds: number[] })[] = (() => {
  const map = new Map<string, AttackTechnique & { moduleIds: number[] }>();

  for (const mapping of MODULE_ATTACK_MAPPINGS) {
    for (const technique of mapping.techniques) {
      const existing = map.get(technique.id);
      if (existing) {
        existing.moduleIds.push(mapping.moduleId);
      } else {
        map.set(technique.id, { ...technique, moduleIds: [mapping.moduleId] });
      }
    }
  }

  return Array.from(map.values());
})();
