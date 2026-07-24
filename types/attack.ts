/**
 * MITRE ATT&CK Type Definitions — CyberGuardians
 *
 * Maps curriculum modules to MITRE ATT&CK v19 techniques.
 * Source: research/mitre-attack-mapping.md
 */

// ─── ATT&CK Tactics ──────────────────────────────────────────────────────────

export type AttackTactic =
  | 'initial-access'
  | 'execution'
  | 'persistence'
  | 'privilege-escalation'
  | 'defense-evasion'
  | 'credential-access'
  | 'lateral-movement'
  | 'exfiltration'
  | 'impact'
  | 'reconnaissance';

export const TACTIC_LABELS: Record<AttackTactic, string> = {
  'initial-access': 'Initial Access',
  'execution': 'Execution',
  'persistence': 'Persistence',
  'privilege-escalation': 'Privilege Escalation',
  'defense-evasion': 'Defense Evasion',
  'credential-access': 'Credential Access',
  'lateral-movement': 'Lateral Movement',
  'exfiltration': 'Exfiltration',
  'impact': 'Impact',
  'reconnaissance': 'Reconnaissance',
};

// ─── ATT&CK Technique ────────────────────────────────────────────────────────

export interface AttackTechnique {
  /** ATT&CK technique ID, e.g. "T1566.002" */
  id: string;
  /** Human-readable name */
  name: string;
  /** Primary tactic this technique belongs to */
  tactic: AttackTactic;
  /** Short description of the technique */
  description: string;
}

// ─── Module → ATT&CK Mapping ─────────────────────────────────────────────────

export interface ModuleAttackMapping {
  /** Module number (0–6) */
  moduleId: number;
  /** Display name */
  moduleName: string;
  /** Techniques covered by this module */
  techniques: AttackTechnique[];
}
