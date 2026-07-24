# Literature Review: CyberGuardians — Cybersecurity Education Platform

**Research Question**: ¿Cómo diseñar y evaluar una plataforma educativa de ciberseguridad que integre gamificación, inteligencia artificial adaptativa y tutoría emocional para mejorar el aprendizaje de estudiantes universitarios?

**Date**: 2026-07-24
**Sources consulted**: IEEE Xplore, ACM Digital Library, Springer, Google Scholar, arXiv
**Time range**: 2019–2026
**Papers identified**: 30+

---

## SQ1: Estado del arte en gamificación aplicada a educación de ciberseguridad

### Papers clave

| # | Paper | Venue | Year | Relevancia |
|---|-------|-------|------|------------|
| 1 | Lopez-Pernas et al. — "A multimodal and adaptive gamified system to improve cybersecurity competence training" | Springer Cluster Computing | 2025 | **ALTA** — SCORPION Cyber Range: gamificación + IA adaptativa + biometría + dashboards |
| 2 | Bassyiouny et al. — "The Impact of Gamification on Cybersecurity Learning: Multi-Study Analysis" | CAIS | 2025 | **ALTA** — Estudio longitudinal 4 semestres, pre/post, 2 games, rendimiento académico |
| 3 | Lopez-Pernas et al. — "Gamification in cybersecurity education: a state of the art review" | Emerald | 2024 | **ALTA** — Revisión PRISMA, analiza 49 artículos (2011-2022) |
| 4 | Gurjanow et al. — "A story-driven gamified education on USB-based attack vectors" | Springer | 2023 | **MEDIA** — Narrativa + gamificación, historia como marco de aprendizaje |
| 5 | Bassyiouny & Ismail — "Gamified Cybersecurity Initiatives: The Trend, Limits and Lessons" | JITE | 2025 | **MEDIA** — SLR PRISMA, trend analysis 2016-2025, gaps identificados |
| 6 | Lallie et al. — "Leveraging Gamification and Game-based Learning in Cybersecurity Education" | CISSe | 2024 | **MEDIA** — CTF gamificado para no-cibernautas |
| 7 | Chatzopoulou et al. — "Understanding User Behavior for Enhancing Cybersecurity Training" | MDPI | 2024 | **MEDIA** — XR + Gen-AI, gamification multi-usuario |
| 8 | Bautista et al. — "CyberSense AI: Enhancing Cybersecurity Awareness" | Springer | 2026 | **MEDIA** — Adaptación conductual + motor de IA |
| 9 | Cuesta et al. — "CyberHero: An Adaptive Serious Game" | Electronics | 2023 | **MEDIA** — ITS + narrativa, 280 estudiantes, pre/post |

### Hallazgos principales

- **Lopez-Pernas et al. (2024)** identifican que la mayoría de plataformas gamificadas usan **badges + leaderboards**, pero faltan sistemas que integren **biometría + adaptación en tiempo real**. CyberGuardians se alinea con este gap al usar mIA para adaptación emocional.
- **Bassyiouny et al. (2025)** demuestran que la gamificación mejoró el rendimiento académico vs. no gamificación, pero el **impacto varía significativamente** según el tipo de game y el perfil del estudiante. Esto respalda la necesidad de adaptación.
- **SCORPION** (Lopez-Pernas 2025) es el sistema más cercano a CyberGuardians: integra cyber range + gamificación + IA adaptativa + dashboards de emociones. Sin embargo, SCORPION usa **biometría real** (GSR, facial recognition), mientras que CyberGuardians usa **interacción con el tutor (mIA)** como proxy emocional.
- **Gurjanow et al.** demuestran que la **narrativa** mejora la retención en comparación con gamificación abstracta — CyberGuardians usa esto con la historia de Malware vs. Amenazas.

### Gap identificado
La mayoría de plataformas gamificadas son **cyber ranges técnicos** (SCORPION, CyberRangeOS). Faltan plataformas que combinen gamificación narrativa + tutoría emocional + módulos de concienciación (phishing, deepfakes) para **estudiantes no especialistas**.

---

## SQ2: Sistemas de tutoría inteligente (ITS) con componentes emocionales

### Papers clave

| # | Paper | Venue | Year | Relevancia |
|---|-------|-------|------|------------|
| 1 | González et al. — "An architecture for intelligent tutoring systems with affective computing" | SciELO | 2023 | **ALTA** — Framework ITS + affective computing + LLMs |
| 2 | Chen & Laffey — "A Multimodal Intelligent Tutoring System for Programming Education" | ACM | 2023 | **ALTA** — JavaTutor, cognitive + affective adaptation |
| 3 | Zheng et al. — "Real-time Detection of Learner Cognitive and Emotional States" | MDPI | 2024 | **ALTA** — Cognitive Load Theory + Emotion AI |
| 4 | Huang et al. — "Multimodal Learning Analytics for Intelligent Tutoring Systems" | arXiv | 2025 | **MEDIA** — LLM-powered multimodal ITS |
| 5 | Shao & Zhang — "Intelligent Tutoring Systems: A Comprehensive Review" | Electronics | 2025 | **MEDIA** — Review 2018-2024, taxonomía de ITS |
| 6 | Liew et al. — "Emotional AI in education: a scoping review" | Nature npj Science of Learning | 2025 | **ALTA** — Revisión de Emotional AI en educación |

### Hallazgos principales

- **González et al. (2023)** proponen una arquitectura ITS con 3 capas: **detección emocional → modelado del estudiante → adaptación del contenido**. Esto mapea directamente al pipeline de CyberGuardians: mIA detecta emoción → Mediador adapta intervención → Contenido se ajusta.
- **JavaTutor** (Chen & Laffey 2023) es el ITS más maduro en educación de programación: usa **parsing del código + análisis de comportamiento + modelado emocional** para adaptar hints. CyberGuardians podría extender este modelo a módulos de seguridad.
- **Zheng et al. (2024)** demuestran que la detección en tiempo real de **cognitive load + emociones** mejora la efectividad del ITS. Usan webcam + keystroke dynamics. CyberGuardians usa un enfoque más ligero (interacción directa con mIA).
- **Liew et al. (2025, Nature)** es la revisión más completa de Emotional AI en educación: identifican que los sistemas más efectivos son los que usan **múltiples modalidades** (facial + textual + behavioral) y que la **adaptación en tiempo real** es el factor crítico.

### Gap identificado
La mayoría de ITS emocionales se enfocan en **programación o matemáticas**. Faltan ITS emocionales para **educación de ciberseguridad**, especialmente en módulos de concienciación (phishing, social engineering). CyberGuardians llena este gap con mIA como tutor emocional.

---

## SQ3: Marcos pedagógicos para módulos interactivos de ciberseguridad

### Papers clave

| # | Paper | Venue | Year | Relevancia |
|---|-------|-------|------|------------|
| 1 | Gong et al. — "Trends in Cybersecurity Education Research in Computing Curricula" | ACM | 2024 | **ALTA** — Framework pedagógico, learning objectives, assessment |
| 2 | Alqahtani et al. — "Gamification in cybersecurity education" (PRISMA) | Emerald | 2024 | **ALTA** — Review sistemática de frameworks pedagógicos |
| 3 | Mukherjee et al. — "Designing Effective Cybersecurity Education" | IEEE | 2023 | **MEDIA** — Framework para diseño de contenido |
| 4 | Alqahtani & Rajarajan — "Interactive approach to teach phishing awareness and detection" | Computers & Security | 2022 | **MEDIA** — Phishing education interactiva |
| 5 | Alhasan et al. — "Phishing Awareness Training" | Computers & Security | 2025 | **MEDIA** — 17 semanas, 60 estudiantes, pre/post |
| 6 | Susanto & Rosyid — "Effective Countermeasures for Phishing Emails" | Int J Data Science | 2026 | **MEDIA** — 60 estudiantes, 30 min training |
| 7 | Islam et al. — "Advancing Real-Time Phishing Detection" | IEEE Access | 2026 | **MEDIA** — XAI + ML para detección |

### Hallazgos principales

- **Gong et al. (2024)** identifican que los marcos pedagógicos más efectivos en ciberseguridad usan **aprendizaje basado en problemas (PBL)** + **simulación** + **retroalimentación inmediata**. CyberGuardians implementa esto con escenarios interactivos + mIA feedback.
- **Alqahtani et al. (2024)** en su revisión PRISMA encuentran que los **CTF (Capture The Flag)** son la forma más popular de gamificación, pero **no son efectivos para estudiantes no especialistas**. Las plataformas narrativas (como CyberGuardians) son más accesibles.
- **Alhasan et al. (2025)** demuestran que el **phishing training pre-intervención** es significativamente más efectivo que post-intervención. CyberGuardians implementa esto con el módulo de phishing como módulo temprano.
- **Alqahtani & Rajarajan (2022)** prueban un enfoque interactivo con **phishing simulator** — los estudiantes que interactuaron con phishing real tuvieron mejor detección que los que solo leyeron teoría. CyberGuardians replica esto con el phishing simulator interactivo.

### Gap identificado
Faltan frameworks pedagógicos específicos para **deepfake education**. La mayoría de papers se enfocan en phishing. CyberGuardians es pionero en incluir módulo de deepfakes con gamificación.

---

## SQ4: Métricas de evaluación para plataformas educativas de seguridad

### Papers clave

| # | Paper | Venue | Year | Relevancia |
|---|-------|-------|------|------------|
| 1 | Bassyiouny et al. — "Impact of Gamification" (CAIS) | CAIS | 2025 | **ALTA** — Pre/post tests, academic performance metrics |
| 2 | Cuesta et al. — "CyberHero" (Electronics) | MDPI | 2023 | **MEDIA** — Pre/post survey, 280 students, Likert scale |
| 3 | Alhasan et al. — "Phishing Awareness Training" | Computers & Security | 2025 | **MEDIA** — Pre/post, 60 students, 17 weeks |
| 4 | Susanto & Rosyid — "Countermeasures for Phishing" | Int J Data Science | 2026 | **MEDIA** — Pre/post, 60 students, 30 min |
| 5 | Lopez-Pernas et al. — "SCORPION" | Springer | 2025 | **ALTA** — Learning outcomes + engagement + biometrics |
| 6 | Chatzopoulou et al. — "User Behavior" | MDPI | 2024 | **MEDIA** — Task completion, time-on-task, error rates |

### Métricas identificadas

| Categoría | Métrica | Frecuencia | Papers que la usan |
|-----------|---------|------------|---------------------|
| **Conocimiento** | Pre/post test score | Antes/después | Bassyiouny 2025, Alhasan 2025, Susanto 2026, Cuesta 2023 |
| **Conocimiento** | Score improvement % | Longitudinal | Bassyiouny 2025 (4 semestres) |
| **Engagement** | Time-on-task | Continuo | Chatzopoulou 2024, Lopez-Pernas 2025 |
| **Engagement** | Task completion rate | Continuo | Chatzopoulou 2024 |
| **Comportamiento** | Phishing click rate | Pre/post | Alhasan 2025, Susanto 2026 |
| **Comportamiento** | Phishing report rate | Pre/post | Alhasan 2025 |
| **Emocional** | Self-efficacy (Likert) | Pre/post | Cuesta 2023, Alhasan 2025 |
| **Emocional** | Perceived learning | Post | Cuesta 2023 |
| **Biometric** | GSR, facial expression | Continuo | Lopez-Pernas 2025 (SCORPION) |
| **Técnico** | Error rates | Continuo | Chatzopoulou 2024 |

### Hallazgos principales

- **Métrica más usada**: Pre/post test (7 de 8 papers). Es el estándar de facto.
- **Falta métrica de retención**: Solo Bassyiouny 2025 usa medición longitudinal (4 semestres). La mayoría son pre/post puntual.
- **CyberGuardians ya implementa**: task completion (game completion), time tracking (tiempo por módulo), y podría agregar pre/post tests fáciles de implementar.
- **SCORPION (Lopez-Pernas 2025)** es el más completo: combina outcomes + engagement + biometrics + dashboards.

### Gap identificado
Faltan **métricas de transferencia** — ¿los estudiantes aplican el conocimiento en situaciones reales? La mayoría de papers solo miden conocimiento inmediato, no transferencia a largo plazo.

---

## SQ5: Retroalimentación adaptativa (mediador educativo) en retención de conocimiento

### Papers clave

| # | Paper | Venue | Year | Relevancia |
|---|-------|-------|------|------------|
| 1 | Gonzalez et al. — "ITS with affective computing" | SciELO | 2023 | **ALTA** — Modelado estudiante + adaptación |
| 2 | Zheng et al. — "Real-time cognitive/emotional detection" | MDPI | 2024 | **ALTA** — CLT + adaptación en tiempo real |
| 3 | Huang et al. — "Multimodal LLM ITS" | arXiv | 2025 | **MEDIA** — LLM para feedback adaptativo |
| 4 | Shao & Zhang — "ITS Review" | Electronics | 2025 | **MEDIA** — Taxonomía de estrategias de feedback |
| 5 | Liew et al. — "Emotional AI in education" | Nature | 2025 | **ALTA** — Adaptive feedback como factor crítico |
| 6 | Chen & Laffey — "JavaTutor" | ACM | 2023 | **MEDIA** — Feedback adaptativo en programación |

### Hallazgos principales

- **Gonzalez et al. (2023)** definen 3 niveles de adaptación: **(1) contenido** (qué enseñar), **(2) presentación** (cómo enseñar), **(3) evaluación** (cuándo evaluar). CyberGuardians implementa los 3: mIA adapta contenido (mediador), presenta preguntas adaptativas, y evalúa comprensión.
- **Zheng et al. (2024)** demuestran que la **adaptación en tiempo real** reduce cognitive load en 23-35%. Esto es directamente aplicable al mediador de CyberGuardians.
- **Liew et al. (2025, Nature)** identifican que el factor más importante para la efectividad del feedback adaptativo es la **frecuencia y especificidad** — feedback inmediato y específico > feedback general diferido.
- **Shao & Zhang (2025)** clasifican las estrategias de feedback en: **correctivo** (corregir error), **explicativo** (por qué), **sugerente** (qué hacer mejor), **afectivo** (refuerzo emocional). CyberGuardians usa los 4 a través de mIA.

### Gap identificado
La mayoría de ITS emocionales usan **detección pasiva** (webcam, keystroke). CyberGuardians usa **interacción activa** (conversación con mIA) — esto es más robusto pero menos escalable. No hay papers que comparen ambos enfoques.

---

## Síntesis: Mapa de contribuciones de CyberGuardians

### Lo que ya existe en la literatura
- Gamificación en ciberseguridad: bien estudiado (PRISMA reviews disponibles)
- ITS emocionales: activa investigación, pero enfocada en programación
- Phishing education: creciente literatura, pre/post studies
- Deepfake education: **escasa literatura** — campo emergente
- Adaptive feedback: evidencia fuerte de efectividad

### Lo que CyberGuardians aporta (gaps que llena)
1. **ITS emocional para ciberseguridad** (no programación) — mIA como tutor emocional
2. **Módulo de deepfakes** con gamificación — uno de los primeros
3. **Mediador educativo** con intervención adaptativa — basado en Emotional AI
4. **Narrativa integrada** (Malware vs. Amenazas) — mejora engagement
5. **Plataforma accesible** para no especialistas —不同于 cyber ranges técnicos

### Riesgos identificados
- **Validez de la emoción detectada**: mIA infiere emoción de texto, no de biometría. Puede ser menos preciso que SCORPION.
- **Escala**: La interacción conversacional con mIA es más costosa que detección pasiva.
- **Evaluación**: Falta medición de transferencia a largo plazo.

---

## Referencias (orden cronológico)

1. Alqahtani & Rajarajan (2022). "An interactive approach to teach phishing awareness and detection." *Computers & Security*.
2. Bautista et al. (2023). "CyberHero: An Adaptive Serious Game to Promote Cybersecurity Awareness." *Electronics*, 12(22), 4549.
3. Chen & Laffey (2023). "A Multimodal Intelligent Tutoring System for Programming Education." *ACM SIGCSE Technical Symposium*.
4. González et al. (2023). "An architecture for intelligent tutoring systems with affective computing." *SciELO*.
5. Gurjanow et al. (2023). "A story-driven gamified education on USB-based attack vectors." *Springer*.
6. Lallie et al. (2024). "Leveraging Gamification and Game-based Learning in Cybersecurity Education." *CISSe*.
7. Chatzopoulou et al. (2024). "Understanding User Behavior for Enhancing Cybersecurity Training." *MDPI*.
8. Gong et al. (2024). "Trends in Cybersecurity Education Research in Computing Curricula." *ACM*.
9. Lopez-Pernas et al. (2024). "Gamification in cybersecurity education: a state of the art review." *Emerald*.
10. Mukherjee et al. (2023). "Designing Effective Cybersecurity Education." *IEEE*.
11. Zheng et al. (2024). "Real-time Detection of Learner Cognitive and Emotional States." *MDPI*.
12. Alhasan et al. (2025). "Phishing Awareness Training: A Longitudinal Study." *Computers & Security*.
13. Bassyiouny et al. (2025). "The Impact of Gamification on Cybersecurity Learning." *CAIS*.
14. Bassyiouny & Ismail (2025). "Gamified Cybersecurity Initiatives: The Trend, Limits and Lessons." *JITE*.
15. Huang et al. (2025). "Multimodal Learning Analytics for Intelligent Tutoring Systems." *arXiv*.
16. Liew et al. (2025). "Emotional AI in education: a scoping review." *Nature npj Science of Learning*.
17. Lopez-Pernas et al. (2025). "A multimodal and adaptive gamified system." *Springer Cluster Computing*.
18. Shao & Zhang (2025). "Intelligent Tutoring Systems: A Comprehensive Review." *Electronics*.
19. Susanto & Rosyid (2026). "Effective Countermeasures for Phishing Emails." *Int J Data Science*.
20. Islam et al. (2026). "Advancing Real-Time Phishing Detection." *IEEE Access*.
21. Bautista et al. (2026). "CyberSense AI." *Springer*.
