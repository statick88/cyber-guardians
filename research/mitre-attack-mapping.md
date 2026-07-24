# MITRE ATT&CK Mapping — CyberGuardians Modules

**Date**: 2026-07-24
**Purpose**: Map each CyberGuardians module activity to MITRE ATT&CK v19 techniques for curriculum alignment and threat intelligence grounding.

---

## How to Use This Mapping

- **Curriculum design**: Ensure each module covers real-world techniques
- **Assessment alignment**: Map quiz questions to specific ATT&CK techniques
- **Threat intelligence**: Link scenarios to actual threat groups and campaigns
- **Gap analysis**: Identify techniques not yet covered by any module

---

## Module 0: Cyber-Diagnostico (Baseline Assessment)

**Tactic Coverage**: TA0001 Initial Access, TA0006 Credential Access, TA0010 Exfiltration

| Scenario | ATT&CK Technique | ID | Description |
|----------|-------------------|-----|-------------|
| WhatsApp lottery scam | Phishing via Service | T1566.003 | Spearphishing via third-party messaging platforms |
| SRI tax refund email | Spearphishing Link | T1566.002 | Malicious link in phishing email |
| Fake Instagram followers app | Phishing for Information | T1598 | Social engineering to harvest credentials |
| Snapchat location sharing | Unsecured Credentials | T1552 | Credentials/data stored in insecure locations |
| Evil Twin WiFi | Adversary-in-the-Middle | T1557 | Man-in-the-middle on wireless networks |
| Credential stuffing | Valid Accounts | T1078 | Use of compromised credentials |
| Drive-by downloads | User Execution | T1204 | User triggered malicious content download |
| Deepfake political video | Generate Content: Audio-Visual | T1683.002 | AI-generated synthetic media for disinformation |

**Techniques covered**: 8 (across Initial Access, Credential Access, Defense Evasion tactics)

---

## Module 1: Cazadores de Phishing (Phishing Hunters)

**Tactic Coverage**: TA0001 Initial Access, TA0006 Credential Access, TA0043 Reconnaissance

| Activity | ATT&CK Technique | ID | Description |
|----------|-------------------|-----|-------------|
| Netflix impersonation email | Spearphishing Link | T1566.002 | Malicious URL in phishing email |
| Bank transfer fraud email | Spearphishing Link | T1566.002 | Credential harvesting via fake login page |
| Google Workspace phishing | Spearphishing via Service | T1566.003 | Phishing through legitimate SaaS platform |
| Mercado Libre prize scam | Spearphishing Link | T1566.002 | Prize/urgency-based phishing |
| URL typosquatting (paypa1.com) | Phishing for Information | T1598.003 | Domain impersonation for credential theft |
| Suspicious URL paths | Spearphishing Link | T1566.002 | Legitimate domain with malicious path |
| Non-standard port URLs | Phishing for Information | T1598.003 | Using unusual ports to evade detection |
| TLD manipulation (amaz0n.com.deals) | Phishing for Information | T1598.003 | Domain spoofing via TLD abuse |
| IT dept credential harvest | Spearphishing Link | T1566.002 | Authority impersonation (IT department) |
| SMS smishing (bank alert) | Phishing via Service | T1566.003 | SMS-based phishing (smishing) |
| Fake prize pop-ups | Spearphishing Link | T1566.002 | Social media-based phishing |
| Compromised friend account | Compromise Accounts | T1586 | Using compromised social media accounts |

**Key MITRE Sub-techniques**:
- T1566.001 — Spearphishing Attachment
- T1566.002 — Spearphishing Link ← **primary technique for this module**
- T1566.003 — Spearphishing via Service
- T1566.004 — Spearphishing Voice (vishing in Module 2)
- T1598 — Phishing for Information
- T1586 — Compromise Accounts (social media)

**Mitigations taught**: M1054 Software Configuration (email auth), M1017 User Training

---

## Module 2: Guardianes de Identidad (Identity Guardians)

**Tactic Coverage**: TA0001 Initial Access, TA0003 Persistence, TA0004 Privilege Escalation, TA0005 Defense Evasion, TA0006 Credential Access

| Activity | ATT&CK Technique | ID | Description |
|----------|-------------------|-----|-------------|
| Password strength simulation | Brute Force: Password Guessing | T1110.001 | Weak password exploitation |
| Password reuse / stuffing | Valid Accounts | T1078 | Credential stuffing with reused passwords |
| SIM swapping (SMS 2FA bypass) | Modify Authentication Process | T1556 | SMS-based 2FA interception |
| MFA push fatigue bombing | MFA Request Generation | T1621 | MFA bombing/fatigue attacks |
| TOTP vs hardware keys | Modify Authentication Process | T1556 | Authentication factor weaknesses |
| Instagram location tagging | Gather Victim Identity Info | T1589 | Open-source intelligence gathering |
| Public profile exposure | Gather Victim Identity Info | T1589 | Social media information harvesting |
| Email forwarding rules | Account Manipulation | T1098.002 | Persistent email forwarding for surveillance |
| Financial identity theft | Valid Accounts | T1078 | Using stolen credentials for financial fraud |
| Credit card unauthorized charges | Financial Theft | T1657 | Unauthorized financial transactions |
| Medical identity theft | Account Manipulation | T1098 | Identity theft for healthcare fraud |
| Vishing (bank impersonation) | Spearphishing Voice | T1566.004 | Voice-based social engineering |
| Microsoft tech support scam | Social Engineering | T1684 | Impersonation for remote access |
| Defense kit (password manager, YubiKey) | Multi-factor Authentication | — | Defensive technique |

**Key MITRE Sub-techniques**:
- T1078 — Valid Accounts (all sub-types)
- T1098 — Account Manipulation
- T1098.002 — Additional Email Delegate Permissions
- T1556 — Modify Authentication Process
- T1589 — Gather Victim Identity Information
- T1566.004 — Spearphishing Voice (vishing)
- T1621 — Multi-Factor Authentication Request Generation
- T1684 — Social Engineering (NEW in ATT&CK v19)

**Threat Groups cited**: Scattered Spider (credential phishing + OTP theft)

---

## Module 3: CyberSentry (Criminal Recruitment & Extortion)

**Tactic Coverage**: TA0001 Initial Access, TA0003 Persistence, TA0006 Credential Access, TA0040 Impact

| Activity | ATT&CK Technique | ID | Description |
|----------|-------------------|-----|-------------|
| Instagram job offer (money mule) | Social Engineering | T1684 | Trust-based manipulation for recruitment |
| "Virtual assistant" mule | Financial Theft | T1657 | Money mule operations |
| "Influencer product kit" pyramid | Financial Theft | T1657 | Fraudulent financial schemes |
| Package delivery mule | Social Engineering | T1684 | Physical delivery exploitation |
| Sextortion (threatening photos) | Data Encrypted for Impact | T1486 | Ransomware-style data encryption threats |
| Ransomware (0.5 BTC demand) | Data Encrypted for Impact | T1486 | Ransomware encryption |
| Social media doxing | Exfiltration Over Web Service | T1567 | Data exfiltration and exposure |
| TikTok love bombing | Social Engineering | T1684 | Emotional manipulation for exploitation |
| Deepfake verification | Generate Content: Audio-Visual | T1683.002 | AI-generated deepfake content |
| Gaming platform grooming | Social Engineering | T1684 | Youth-targeted social engineering |

**Key MITRE Sub-techniques**:
- T1684 — Social Engineering (NEW parent technique in ATT&CK v19)
- T1684.001 — Impersonation
- T1683.002 — Generate Content: Audio-Visual Content
- T1486 — Data Encrypted for Impact (ransomware)
- T1567 — Exfiltration Over Web Service
- T1657 — Financial Theft

**Data sources cited**: Europol EMMA 2023, FBI IC3 2022, Cifas 2023

---

## Module 4: Tu Codigo, Tu Escudo (Secure Coding & Hardening)

**Tactic Coverage**: TA0001 Initial Access, TA0002 Execution, TA0005 Defense Evasion, TA0008 Lateral Movement

| Activity | ATT&CK Technique | ID | Description |
|----------|-------------------|-----|-------------|
| SQL Injection | Exploit Public-Facing Application | T1190 | Web application exploitation |
| XSS Reflected | Exploit Public-Facing Application | T1190 | Client-side code injection |
| Hardcoded API Keys | Unsecured Credentials | T1552 | Credentials stored in source code |
| Path Traversal | Path Traversal: File and Directory | T1083 | Directory traversal to access files |
| Insecure Deserialization | Exploitation for Client Execution | T1203 | Deserialization attacks |
| CORS Misconfiguration | Exploit Public-Facing Application | T1190 | Web application misconfiguration |
| Input sanitization | — | — | Defensive: input validation |
| Security headers (X-Frame-Options, CSP) | — | — | Defensive: HTTP security headers |
| TLS configuration | — | — | Defensive: transport encryption |
| Caesar cipher (ROT13) | — | — | Educational: basic cryptography |
| XOR encryption | — | — | Educational: symmetric encryption |
| AES-256-CBC | — | — | Educational: modern cryptography |
| Linux SSH hardening | External Remote Services | T1133 | Securing remote access |
| Windows hardening | — | — | Defensive: OS hardening |
| Web server hardening | Exploit Public-Facing Application | T1190 | Securing web infrastructure |
| MD5 verification | — | — | Defensive: integrity checking |
| SHA-256 verification | — | — | Defensive: cryptographic integrity |
| Tampering detection | — | — | Defensive: tamper detection |

**Key MITRE Sub-techniques**:
- T1190 — Exploit Public-Facing Application ← **primary attack technique covered**
- T1083 — File and Directory Discovery (path traversal)
- T1203 — Exploitation for Client Execution (deserialization)
- T1552 — Unsecured Credentials (hardcoded secrets)
- T1133 — External Remote Services (SSH hardening)
- T1195 — Supply Chain Compromise (relevant context)

**CVEs referenced**: SQL injection (CWE-89), XSS (CWE-79), Path Traversal (CWE-22), Deserialization (CWE-502)

---

## Module 5: Deepfake Defender (AI Threat Detection)

**Tactic Coverage**: TA0001 Initial Access, TA0006 Credential Access, TA0040 Impact, TA0043 Reconnaissance

| Activity | ATT&CK Technique | ID | Description |
|----------|-------------------|-----|-------------|
| Celebrity crypto scam video | Generate Content: Audio-Visual | T1683.002 | AI-generated deepfake video |
| Voice clone emergency call | Spearphishing Voice | T1566.004 | AI voice cloning for vishing |
| AI dating profile photo | Generate Content: Audio-Visual | T1683.002 | AI-generated profile images |
| Political deepfake | Generate Content: Audio-Visual | T1683.002 | Synthetic media for disinformation |
| EXIF metadata analysis | — | — | Defensive: forensic metadata analysis |
| GPS coordinate check | — | — | Defensive: geolocation verification |
| Camera model detection | — | — | Defensive: device fingerprinting |
| Software field analysis | — | — | Defensive: generative tool detection |
| Compression artifacts | — | — | Defensive: image forensics |

**Key MITRE Sub-techniques**:
- T1683.002 — Generate Content: Audio-Visual Content ← **primary technique covered**
- T1566.004 — Spearphishing Voice (voice cloning)
- T1682 — Query Public AI Services (adversary research)
- T1684 — Social Engineering (impersonation)
- T1657 — Financial Theft (crypto scams)

**Threat Groups cited**: Contagious Interview (AI-generated deepfakes for malware distribution)
**Data sources cited**: FBI IC3 2025 (1,200% increase in voice clones), INDEPED 2025

---

## Module 6: Crypto-Scam Shield (Financial Scam Protection)

**Tactic Coverage**: TA0001 Initial Access, TA0006 Credential Access, TA0010 Exfiltration, TA0040 Impact

| Activity | ATT&CK Technique | ID | Description |
|----------|-------------------|-----|-------------|
| QR overlay attack | Phishing via Service | T1566.003 | QR code redirect to phishing page |
| Malicious QR app (APK) | User Execution | T1204 | Malicious mobile app installation |
| Restaurant QR phishing | Spearphishing Link | T1566.002 | QR-based credential harvesting |
| Crypto trading pyramid | Financial Theft | T1657 | Investment fraud schemes |
| MLM beauty products | Financial Theft | T1657 | Multi-level marketing fraud |
| Student Ponzi scheme | Financial Theft | T1657 | Ponzi scheme targeting students |
| Fake product evaluator | Phishing via Service | T1566.003 | Task-based scam for fake reviews |
| Virtual assistant scam check | Financial Theft | T1657 | Check fraud / employment scam |
| Delivery kit scam | Social Engineering | T1684 | Advance-fee fraud |

**Key MITRE Sub-techniques**:
- T1566.002 — Spearphishing Link (QR phishing)
- T1566.003 — Spearphishing via Service (QR codes, social platforms)
- T1657 — Financial Theft (pyramids, Ponzi, employment fraud)
- T1684 — Social Engineering (advance-fee, impersonation)
- T1204 — User Execution (malicious app installation)

**Data sources cited**: FTC 2024, FBI IC3 2023, Europol IOCTA 2023

---

## Coverage Summary

### By Tactic

| Tactic | Modules | Count |
|--------|---------|-------|
| TA0001 Initial Access | 0,1,2,3,4,5,6 | **7/7** |
| TA0002 Execution | 4 | 1/7 |
| TA0003 Persistence | 2,3 | 2/7 |
| TA0004 Privilege Escalation | 2 | 1/7 |
| TA0005 Defense Evasion | 2,4 | 2/7 |
| TA0006 Credential Access | 0,1,2,5,6 | 5/7 |
| TA0008 Lateral Movement | 4 | 1/7 |
| TA0010 Exfiltration | 0,6 | 2/7 |
| TA0040 Impact | 3,5,6 | 3/7 |
| TA0043 Reconnaissance | 0,1,5 | 3/7 |

### By Technique Category

| Category | Techniques | Modules |
|----------|------------|---------|
| **Phishing/Social Engineering** | T1566, T1598, T1684 | 0,1,2,3,5,6 |
| **Identity/Credentials** | T1078, T1098, T1556, T1589 | 0,2 |
| **Web Application Attacks** | T1190, T1083, T1203 | 4 |
| **AI-Generated Content** | T1683.002, T1682 | 0,3,5 |
| **Financial Fraud** | T1657 | 3,6 |
| **Data Encryption** | T1486 | 3 |
| **Remote Services** | T1133 | 4 |
| **Supply Chain** | T1195 | 4 (context) |

### Key ATT&CK v19 Techniques (New)

| Technique | ID | CyberGuardians Relevance |
|-----------|-----|-------------------------|
| Social Engineering (parent) | T1684 | Modules 2,3,6 — vishing, impersonation, manipulation |
| Generate Content: Audio-Visual | T1683.002 | Modules 0,3,5 — deepfakes, AI images, voice clones |
| Generate Content: Written Content | T1683.001 | Module 1 — AI-generated phishing emails |
| Query Public AI Services | T1682 | Module 5 — adversary research using AI |
| Impersonation (sub-technique) | T1684.001 | Modules 1,2,3 — authority/friend impersonation |
| Email Spoofing (sub-technique) | T1684.002 | Module 1 — email sender spoofing |
| Phishing: Spearphishing Voice | T1566.004 | Modules 2,5 — vishing + voice cloning |

---

## Gaps Identified

1. **TA0002 Execution**: Only Module 4 covers execution techniques. Consider adding social engineering → malware execution scenarios.
2. **TA0003 Persistence**: Only Modules 2-3 touch persistence. Could add persistence mechanism education (scheduled tasks, registry keys).
3. **TA0008 Lateral Movement**: Only Module 4 (hardening context). Could add lateral movement awareness.
4. **TA0011 Command and Control**: Not covered. Consider adding C2 awareness in advanced modules.
5. **TA0042 Resource Development**: Not covered (out of scope for awareness training).

---

## References

- MITRE ATT&CK v19 (2026-04-28): https://attack.mitre.org/techniques/enterprise/
- ATT&CK v19 release notes: New AI & Social Engineering coverage
- T1683: Generate Content (2026-03-25)
- T1684: Social Engineering (2026)
- T1566: Phishing (updated 2026-05-12)
- T1598: Phishing for Information (updated 2026-05-12)
